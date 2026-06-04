import { supabase } from '@/lib/supabase/client';
import { MealType, MenuItem, HistoryItem } from '@/types/menu';
import type { Database } from '@/types/supabase';
import {
  isUUID,
  logSupabaseError,
  throwIfSupabaseError,
  parseDateString,
  parseNumber,
  parseString,
  toFoodSource,
  toHungerLevel,
  toMealType,
} from '@/utils/supabaseHelpers';

const parseHistoryRow = (row: Database['public']['Tables']['meal_history']['Row']): HistoryItem => ({
  id: parseString(row.id),
  menuId: parseString(row.menu_id),
  menuName: parseString(row.menu_name, 'เมนูไม่ระบุชื่อ'),
  price: parseNumber(row.price, 0),
  place: toFoodSource(row.place),
  budget: row.budget === undefined || row.budget === null ? undefined : parseNumber(row.budget),
  hungerLevel: toHungerLevel(row.hunger_level),
  mealType: toMealType(row.meal_type),
  dateTime: parseDateString(row.eaten_at, new Date().toISOString()),
  storageMode: 'cloud',
});

export const getMealHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('meal_history')
      .select('*')
      .eq('user_id', userId)
      .order('eaten_at', { ascending: false });

    if (error) {
      logSupabaseError('reading history', error);
      return [];
    }

    return (data || []).map(parseHistoryRow);
  } catch (err) {
    logSupabaseError('fetching meal history', err);
    return [];
  }
};

export const addMealHistory = async (
  userId: string,
  menu: MenuItem,
  extra?: { budget?: number; mealType?: MealType }
) => {
  const payload: Database['public']['Tables']['meal_history']['Insert'] = {
    user_id: userId,
    menu_id: isUUID(menu.id) ? menu.id : null,
    menu_name: menu.name,
    price: menu.price,
    place: menu.place,
    budget: extra?.budget ?? null,
    hunger_level: menu.hungerLevel,
    meal_type: extra?.mealType ?? 'other',
    eaten_at: new Date().toISOString(),
  };
  // @ts-expect-error Supabase.from() generic type inference - payloads are strongly typed
  const { error } = await supabase.from('meal_history').insert([payload]);

  throwIfSupabaseError('saving history', error);
};

export const clearMealHistory = async (userId: string) => {
  const { error } = await supabase
    .from('meal_history')
    .delete()
    .eq('user_id', userId);

  throwIfSupabaseError('clearing history', error);
};

export const deleteSingleMealHistory = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('meal_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  throwIfSupabaseError('deleting history item', error);
};
