import { supabase } from '@/lib/supabase/client';
import { MenuItem } from '@/types/menu';
import type { Database } from '@/types/supabase';
import { DEFAULT_MENUS } from '@/data/menus';
import {
  logSupabaseError,
  parseNumber,
  parseString,
  throwIfSupabaseError,
} from '@/utils/supabaseHelpers';

const normalizeNutrition = (nutrition: unknown) => {
  const values = Array.isArray(nutrition) ? nutrition.map((value) => parseString(value as unknown)) : [];
  return {
    carbs: values[0] || 'ปานกลาง',
    protein: values[1] || 'ปานกลาง',
    fat: values[2] || 'ปานกลาง',
    veggies: values[3] || 'ปานกลาง',
  };
};

const buildPayload = (menu: Omit<MenuItem, 'id'>) => ({
  name: menu.name,
  price: menu.price,
  place: menu.place,
  hunger_level: menu.hungerLevel,
  tags: menu.tags,
  nutrition: [menu.nutrition.carbs, menu.nutrition.protein, menu.nutrition.fat, menu.nutrition.veggies],
  reason: menu.reason,
});

const mapCustomDbMenu = (row: Database['public']['Tables']['user_menus']['Row']): MenuItem => {
  return {
    id: parseString(row.id),
    name: parseString(row.name),
    price: parseNumber(row.price),
    place: row.place,
    hungerLevel: row.hunger_level,
    tags: Array.isArray(row.tags) ? row.tags.map((value) => parseString(value as unknown)) : [],
    nutrition: normalizeNutrition(row.nutrition),
    reason: parseString(row.reason),
    isCustom: true,
  };
};

const mapOverrideDefault = (overrideVersion: Database['public']['Tables']['user_menus']['Row'], sourceId: string): MenuItem => {
  return {
    id: parseString(overrideVersion.id),
    name: parseString(overrideVersion.name),
    price: parseNumber(overrideVersion.price),
    place: overrideVersion.place,
    hungerLevel: overrideVersion.hunger_level,
    tags: Array.isArray(overrideVersion.tags) ? overrideVersion.tags.map((value) => parseString(value as unknown)) : [],
    nutrition: normalizeNutrition(overrideVersion.nutrition),
    reason: parseString(overrideVersion.reason),
    isDefault: true,
    source_menu_id: sourceId,
  };
};

export const getVisibleMenus = async (userId?: string | null): Promise<MenuItem[]> => {
  const localDefaults = DEFAULT_MENUS.map((m) => ({ ...m, isDefault: true }));

  if (!userId) {
    return localDefaults;
  }

  try {
    const { data: userMenus, error: menuErr } = await supabase
      .from('user_menus')
      .select('*');

    const { data: hiddenMenus, error: hideErr } = await supabase
      .from('hidden_default_menus')
      .select('source_menu_id');

    if (menuErr || hideErr) {
      logSupabaseError('fetching visible menus', menuErr || hideErr);
      return localDefaults;
    }

    const dbMenus = (userMenus as Database['public']['Tables']['user_menus']['Row'][]) || [];
    const hiddenMenusArray = (hiddenMenus as Pick<Database['public']['Tables']['hidden_default_menus']['Row'], 'source_menu_id'>[]) || [];
    const hiddenIds = hiddenMenusArray
      .map((item) => parseString(item.source_menu_id as unknown))
      .filter(Boolean);

    const processDefaults = DEFAULT_MENUS.map((def) => {
      const overrideVersion = dbMenus.find((m) => m.type === 'override' && m.source_menu_id === def.id);
      if (overrideVersion) {
        return mapOverrideDefault(overrideVersion, def.id);
      }
      return { ...def, isDefault: true };
    }).filter((def) => !hiddenIds.includes(def.id));

    const customMenus: MenuItem[] = dbMenus.filter((m) => m.type === 'custom').map(mapCustomDbMenu);

    return [...processDefaults, ...customMenus];
  } catch (err) {
    logSupabaseError('fetching menus from database', err);
    return localDefaults;
  }
};

export const createCustomMenu = async (userId: string, menu: Omit<MenuItem, 'id'>) => {
  const payload: Database['public']['Tables']['user_menus']['Insert'] = {
    user_id: userId,
    ...buildPayload(menu),
    type: 'custom',
  };
  // @ts-expect-error Supabase.from() generic type inference - payloads are strongly typed
  const { error } = await supabase.from('user_menus').insert([payload]);

  throwIfSupabaseError('creating custom menu', error);
};

export const updateUserMenu = async (userId: string, menu: MenuItem) => {
  const payload: Database['public']['Tables']['user_menus']['Update'] = {
    ...buildPayload(menu),
    updated_at: new Date().toISOString(),
  };
  // @ts-expect-error Supabase.from() generic type inference - payloads are strongly typed
  const { error } = await supabase.from('user_menus').update(payload).eq('id', menu.id).eq('user_id', userId);

  throwIfSupabaseError('updating user menu', error);
};

export const overrideDefaultMenu = async (userId: string, sourceMenuId: string, menu: MenuItem) => {
  const payload: Database['public']['Tables']['user_menus']['Insert'] = {
    user_id: userId,
    source_menu_id: sourceMenuId,
    ...buildPayload(menu),
    type: 'override',
  };
  // @ts-expect-error Supabase.from() generic type inference - payloads are strongly typed
  const { error } = await supabase.from('user_menus').insert([payload]);

  throwIfSupabaseError('overriding default menu', error);
};

export const deleteMenu = async (userId: string, menu: MenuItem) => {
  if (menu.isCustom) {
    const payload: Database['public']['Tables']['user_menus']['Update'] = {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    };
    // @ts-expect-error Supabase.from() generic type inference - payloads are strongly typed
    const { error } = await supabase.from('user_menus').update(payload).eq('id', menu.id).eq('user_id', userId);

    throwIfSupabaseError('deleting custom menu', error);
  }

  if (menu.isDefault) {
    if (menu.source_menu_id) {
      const { error } = await supabase
        .from('user_menus')
        .delete()
        .eq('id', menu.id)
        .eq('user_id', userId);
      throwIfSupabaseError('deleting override default menu', error);
      await hideDefaultMenu(userId, menu.source_menu_id);
    } else {
      await hideDefaultMenu(userId, menu.id);
    }
  }
};

export const hideDefaultMenu = async (userId: string, sourceMenuId: string) => {
  const payload: Database['public']['Tables']['hidden_default_menus']['Insert'] = {
    user_id: userId,
    source_menu_id: sourceMenuId,
  };
  // @ts-expect-error Supabase.from() generic type inference - payloads are strongly typed
  const { error } = await supabase.from('hidden_default_menus').insert([payload]);

  throwIfSupabaseError('hiding default menu', error);
};