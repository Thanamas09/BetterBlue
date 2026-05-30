export type FoodSourceType = '7-11' | 'canteen' | 'ordered' | 'cooking';
export type PlaceType = FoodSourceType;
export type PlaceFilterType = FoodSourceType | 'all';
export type HungerLevelType = 'low' | 'medium' | 'high';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
export type StorageMode = 'cloud' | 'local';

export interface Nutrition {
  carbs: string;
  protein: string;
  fat: string;
  veggies: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  place: FoodSourceType;
  hungerLevel: HungerLevelType;
  tags: string[];
  nutrition: Nutrition;
  reason: string;
  isDefault?: boolean;
  isCustom?: boolean;
  source_menu_id?: string | null;
}

export type MenuDraft = Omit<MenuItem, 'id' | 'source_menu_id'>;

export interface HistoryItem {
  id: string;
  menuId: string;
  menuName: string;
  price: number;
  dateTime: string;
  place?: FoodSourceType | string;
  budget?: number;
  hungerLevel?: HungerLevelType;
  mealType?: MealType;
  storageMode?: StorageMode;
}

export interface FilterCriteria {
  budget: number;
  place: PlaceFilterType;
  hungerLevel: HungerLevelType;
  excludeTags: string[];
}
