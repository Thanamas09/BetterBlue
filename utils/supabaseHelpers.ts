import { supabase } from '@/lib/supabase/client';
import { FoodSourceType, HungerLevelType, MealType } from '@/types/menu';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (value: unknown): boolean => typeof value === 'string' && uuidPattern.test(value);

export const parseString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

export const parseNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseDateString = (value: unknown, fallback = new Date().toISOString()): string => {
  if (typeof value !== 'string') return fallback;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : fallback;
};

export const toFoodSource = (value: unknown): FoodSourceType | undefined => {
  return typeof value === 'string' && ['7-11', 'canteen', 'ordered', 'cooking'].includes(value)
    ? (value as FoodSourceType)
    : undefined;
};

export const toHungerLevel = (value: unknown): HungerLevelType | undefined => {
  return typeof value === 'string' && ['low', 'medium', 'high'].includes(value)
    ? (value as HungerLevelType)
    : undefined;
};

export const toMealType = (value: unknown): MealType => {
  return typeof value === 'string' && ['breakfast', 'lunch', 'dinner', 'snack', 'other'].includes(value)
    ? (value as MealType)
    : 'other';
};

export const logSupabaseError = (context: string, error: unknown) => {
  if (!error) return;
  console.error(`Supabase ${context}:`, error);
};

export const throwIfSupabaseError = (context: string, error: unknown) => {
  if (!error) return;
  logSupabaseError(context, error);
  throw error instanceof Error ? error : new Error(`Supabase ${context} failed`);
};

export const getSessionUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  throwIfSupabaseError('getSession', error);
  return session?.user ?? null;
};

export const getSessionUserId = async () => {
  const user = await getSessionUser();
  return user?.id ?? null;
};
