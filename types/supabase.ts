export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type FoodSourceType = '7-11' | 'canteen' | 'ordered' | 'cooking';
export type HungerLevelType = 'low' | 'medium' | 'high';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface Database {
  public: {
    Tables: {
      user_menus: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          price: number;
          place: FoodSourceType;
          hunger_level: HungerLevelType;
          tags: string[];
          nutrition: string[];
          reason: string;
          type: 'custom' | 'override';
          source_menu_id: string | null;
          is_deleted: boolean;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          price: number;
          place: FoodSourceType;
          hunger_level: HungerLevelType;
          tags: string[];
          nutrition: string[];
          reason: string;
          type: 'custom' | 'override';
          source_menu_id?: string | null;
          is_deleted?: boolean;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          price?: number;
          place?: FoodSourceType;
          hunger_level?: HungerLevelType;
          tags?: string[];
          nutrition?: string[];
          reason?: string;
          type?: 'custom' | 'override';
          source_menu_id?: string | null;
          is_deleted?: boolean;
          updated_at?: string | null;
        };
      };
      hidden_default_menus: {
        Row: {
          id: string;
          user_id: string;
          source_menu_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_menu_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_menu_id?: string;
        };
      };
      menus: {
        Row: {
          id: string;
        };
        Insert: {
          id?: string;
        };
        Update: {
          id?: string;
        };
      };
      meal_history: {
        Row: {
          id: string;
          user_id: string;
          menu_id: string | null;
          menu_name: string;
          price: number;
          place: FoodSourceType;
          budget: number | null;
          hunger_level: HungerLevelType | null;
          meal_type: MealType;
          eaten_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          menu_id?: string | null;
          menu_name: string;
          price: number;
          place: FoodSourceType;
          budget?: number | null;
          hunger_level?: HungerLevelType | null;
          meal_type?: MealType;
          eaten_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          menu_id?: string | null;
          menu_name?: string;
          price?: number;
          place?: FoodSourceType;
          budget?: number | null;
          hunger_level?: HungerLevelType | null;
          meal_type?: MealType;
          eaten_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}
