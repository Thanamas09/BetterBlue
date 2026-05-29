import { supabase } from '@/lib/supabase/client';
import { MenuItem, HistoryItem, MealType, HungerLevelType } from '@/types/menu';

// 1. ดึงประวัติการกิน
export const getMealHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('meal_history')
      .select('*')
      .eq('user_id', userId)
      .order('eaten_at', { ascending: false });

    if (error) {
      console.warn('Supabase reading history error:', error.message);
      return [];
    }

    return (data || []).map((h) => {
      let dateTime = new Date().toISOString();
      try {
        if (h.eaten_at) {
          dateTime = new Date(h.eaten_at).toISOString();
        }
      } catch {
        // keep default
      }

      return {
        id: h.id,
        menuId: h.menu_id || '',
        menuName: h.menu_name || 'เมนูไม่ระบุชื่อ',
        price: Number(h.price) || 0,
        place: h.place || '',
        budget: h.budget ? Number(h.budget) : undefined,
        hungerLevel: h.hunger_level as HungerLevelType | undefined,
        mealType: (h.meal_type as MealType) || 'other',
        dateTime,
        storageMode: 'cloud' as const,
      };
    });
  } catch (err) {
    console.error('Fatal error fetching meal history:', err);
    return [];
  }
};

// 2. บันทึกประวัติการกินลง Cloud
export const addMealHistory = async (
  userId: string,
  menu: MenuItem,
  extra?: { budget?: number; mealType?: MealType }
) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(menu.id);

  const { error } = await supabase.from('meal_history').insert({
    user_id: userId,
    menu_id: isValidUUID ? menu.id : null,
    menu_name: menu.name,
    price: menu.price,
    place: menu.place || 'ordered',
    budget: extra?.budget ?? null,
    hunger_level: menu.hungerLevel ?? null,
    meal_type: extra?.mealType ?? 'other',
    eaten_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving history to Supabase:', error.message);
    throw error;
  }
};

// 3. ล้างประวัติมื้ออาหาร
export const clearMealHistory = async (userId: string) => {
  const { error } = await supabase
    .from('meal_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing history from Supabase:', error.message);
    throw error;
  }
};

// 4. ลบรายการเดียว
export const deleteSingleMealHistory = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('meal_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting single history item:', error.message);
    throw error;
  }
};
