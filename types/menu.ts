export type PlaceType = '7-11' | 'canteen' | 'ordered' | 'cooking';
export type HungerLevelType = 'low' | 'medium' | 'high';

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
  place: PlaceType;
  hungerLevel: HungerLevelType;
  tags: string[];
  nutrition: Nutrition;
  reason: string;
  isDefault?: boolean; 
  isCustom?: boolean;  
}

export interface HistoryItem {
  id: string;
  menuId: string;
  menuName: string;
  price: number;
  dateTime: string;
}

export interface FilterCriteria {
  budget: number;
  place: PlaceType;
  hungerLevel: HungerLevelType;
  excludeTags: string[];
}