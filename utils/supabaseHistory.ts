import { supabase } from '@/lib/supabase/client';
import { FoodSourceType, HungerLevelType, MealType, MenuItem, HistoryItem } from '@/types/menu';

const foodSources: FoodSourceType[] = ['7-11', 'canteen', 'ordered', 'cooking'];
const hungerLevels: HungerLevelType[] = ['low', 'medium', 'high'];
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

const toFoodSource = (value: unknown): FoodSourceType | undefined => {
  return typeof value === 'string' && foodSources.includes(value as FoodSourceType)
    ? (value as FoodSourceType)
    : undefined;
};

const toHungerLevel = (value: unknown): HungerLevelType | undefined => {
  return typeof value === 'string' && hungerLevels.includes(value as HungerLevelType)
    ? (value as HungerLevelType)
    : undefined;
};

const toMealType = (value: unknown): MealType => {
  return typeof value === 'string' && mealTypes.includes(value as MealType)
    ? (value as MealType)
    : 'other';
};

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
        // Keep current timestamp when the database value is malformed.
      }

      return {
        id: h.id,
        menuId: h.menu_id || '',
        menuName: h.menu_name || 'เมนูไม่ระบุชื่อ',
        price: Number(h.price) || 0,
        place: toFoodSource(h.place),
        budget: h.budget ? Number(h.budget) : undefined,
        hungerLevel: toHungerLevel(h.hunger_level),
        mealType: toMealType(h.meal_type),
        dateTime,
        storageMode: 'cloud',
      } satisfies HistoryItem;
    });
  } catch (err) {
    console.error('Fatal error fetching meal history:', err);
    return [];
  }
};

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
    place: menu.place,
    budget: extra?.budget ?? null,
    hunger_level: menu.hungerLevel,
    meal_type: extra?.mealType ?? 'other',
    eaten_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving history to Supabase:', error.message);
    throw error;
  }
};

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
