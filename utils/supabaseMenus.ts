import { supabase } from '@/lib/supabase/client';
import { MenuItem, PlaceType, HungerLevelType } from '@/types/menu';
import { DEFAULT_MENUS } from '@/data/menus';

// 1. ประกอบร่างเมนูแบบแยกระบบสิทธิ์การเข้าถึง (พร้อมเซฟตี้บล็อกป้องกันหน้าจอพัง)
export const getVisibleMenus = async (userId?: string | null): Promise<MenuItem[]> => {
  const localDefaults = DEFAULT_MENUS.map(m => ({ ...m, isDefault: true }));
  
  if (!userId) {
    return localDefaults;
  }

  try {
    // โหลดเมนูที่ตั้งค่า/สร้างเองจากตาราง user_menus ของแท้
    const { data: userMenus, error: menuErr } = await supabase
      .from('user_menus')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    // โหลดรายการไอดีเมนูระบบที่ถูกเซ็ต "ซ่อน"
    const { data: hiddenMenus, error: hideErr } = await supabase
      .from('hidden_default_menus')
      .select('source_menu_id')
      .eq('user_id', userId);

    if (menuErr || hideErr) {
      console.warn('Supabase fetch issue:', menuErr || hideErr);
      return localDefaults;
    }

    const dbMenus = userMenus || [];
    const hiddenIds = (hiddenMenus || []).map(h => h.source_menu_id);

    // ประกอบรวมข้อมูลและป้องกันอาการอาร์เรย์ล่ม (.nutrition อาจเป็น null)
    const processDefaults = DEFAULT_MENUS.map((def) => {
      const overrideVersion = dbMenus.find(m => m.type === 'override' && m.source_menu_id === def.id);
      if (overrideVersion) {
        const nutArray = overrideVersion.nutrition || [];
        return {
          id: overrideVersion.id,
          name: overrideVersion.name,
          price: Number(overrideVersion.price),
          place: overrideVersion.place as PlaceType,
          hungerLevel: overrideVersion.hunger_level as HungerLevelType,
          tags: overrideVersion.tags || [],
          nutrition: {
            carbs: nutArray[0] || 'ปานกลาง',
            protein: nutArray[1] || 'ปานกลาง',
            fat: nutArray[2] || 'ปานกลาง',
            veggies: nutArray[3] || 'ปานกลาง',
          },
          reason: overrideVersion.reason || '',
          isDefault: true,
          source_menu_id: def.id
        };
      }
      return { ...def, isDefault: true };
    }).filter(def => !hiddenIds.includes(def.id));

    // ดึงเมนูที่สร้างขึ้นเองเพิ่มเข้ามาผสม
    const customMenus: MenuItem[] = dbMenus
      .filter(m => m.type === 'custom')
      .map(m => {
        const nutArray = m.nutrition || [];
        return {
          id: m.id,
          name: m.name,
          price: Number(m.price),
          place: m.place as PlaceType,
          hungerLevel: m.hunger_level as HungerLevelType,
          tags: m.tags || [],
          nutrition: {
            carbs: nutArray[0] || 'ปานกลาง',
            protein: nutArray[1] || 'ปานกลาง',
            fat: nutArray[2] || 'ปานกลาง',
            veggies: nutArray[3] || 'ปานกลาง',
          },
          reason: m.reason || '',
          isCustom: true
        };
      });

    return [...processDefaults, ...customMenus];
  } catch (err) {
    console.error('Error fetching menus from database, rollback to default:', err);
    return localDefaults;
  }
};

// 2. สร้างเมนูใหม่ของตัวเอง
export const createCustomMenu = async (userId: string, menu: Omit<MenuItem, 'id'>) => {
  const { error } = await supabase.from('user_menus').insert({
    user_id: userId,
    name: menu.name,
    price: menu.price,
    place: menu.place,
    hunger_level: menu.hungerLevel,
    tags: menu.tags,
    nutrition: [menu.nutrition.carbs, menu.nutrition.protein, menu.nutrition.fat, menu.nutrition.veggies],
    reason: menu.reason,
    type: 'custom'
  });
  if (error) throw error;
};

// 3. แก้ไขข้อมูลเมนู (ทั้งตัวสร้างเอง และ ตัวแปรบันทึก Override)
export const updateUserMenu = async (userId: string, menu: MenuItem) => {
  const { error } = await supabase
    .from('user_menus')
    .update({
      name: menu.name,
      price: menu.price,
      place: menu.place,
      hunger_level: menu.hungerLevel,
      tags: menu.tags,
      nutrition: [menu.nutrition.carbs, menu.nutrition.protein, menu.nutrition.fat, menu.nutrition.veggies],
      reason: menu.reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', menu.id)
    .eq('user_id', userId);

  if (error) throw error;
};

// 4. เขียนข้อมูลบันทึกทับ (Override) ตัวแปรเมนูหลักในครั้งแรกสุด
export const overrideDefaultMenu = async (userId: string, sourceMenuId: string, menu: MenuItem) => {
  const { error } = await supabase.from('user_menus').insert({
    user_id: userId,
    source_menu_id: sourceMenuId,
    name: menu.name,
    price: menu.price,
    place: menu.place,
    hunger_level: menu.hungerLevel,
    tags: menu.tags,
    nutrition: [menu.nutrition.carbs, menu.nutrition.protein, menu.nutrition.fat, menu.nutrition.veggies],
    reason: menu.reason,
    type: 'override'
  });
  if (error) throw error;
};

// 5. กลไกการสั่งทำลายหรือลบรายการเมนูออกจากระบบ
export const deleteMenu = async (userId: string, menu: MenuItem) => {
  if (menu.isCustom) {
    const { error } = await supabase
      .from('user_menus')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', menu.id)
      .eq('user_id', userId);
    if (error) throw error;
  } else if (menu.isDefault) {
    if (menu.source_menu_id) {
      await supabase.from('user_menus').delete().eq('id', menu.id).eq('user_id', userId);
      await hideDefaultMenu(userId, menu.source_menu_id);
    } else {
      await hideDefaultMenu(userId, menu.id);
    }
  }
};

// 6. การดึง ID เมนูระบบไปโยนเข้าตารางบัญชีดำซ่อนใช้งาน
export const hideDefaultMenu = async (userId: string, sourceMenuId: string) => {
  const { error } = await supabase.from('hidden_default_menus').insert({
    user_id: userId,
    source_menu_id: sourceMenuId
  });
  if (error) throw error;
};