import { HistoryItem, HungerLevelType, MealType, StorageMode } from '@/types/menu';

const FALLBACK_KEYS = {
  HISTORY: 'betterblue_local_fallback_history',
};

const validHungerLevels: HungerLevelType[] = ['low', 'medium', 'high'];
const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];
const validStorageModes: StorageMode[] = ['cloud', 'local'];

const readString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const readNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeHistoryItem = (item: unknown): HistoryItem | null => {
  if (!item || typeof item !== 'object') return null;
  const source = item as Record<string, unknown>;
  const menuName = readString(source.menuName);
  if (!menuName) return null;

  const dateTime = readString(source.dateTime, new Date().toISOString());
  const parsedDate = new Date(dateTime);

  const hungerLevel = readString(source.hungerLevel);
  const mealType = readString(source.mealType);
  const storageMode = readString(source.storageMode);

  return {
    id: readString(source.id, crypto.randomUUID()),
    menuId: readString(source.menuId),
    menuName,
    price: readNumber(source.price),
    dateTime: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
    place: readString(source.place) || undefined,
    budget: source.budget === undefined || source.budget === null ? undefined : readNumber(source.budget),
    hungerLevel: validHungerLevels.includes(hungerLevel as HungerLevelType)
      ? (hungerLevel as HungerLevelType)
      : undefined,
    mealType: validMealTypes.includes(mealType as MealType) ? (mealType as MealType) : undefined,
    storageMode: validStorageModes.includes(storageMode as StorageMode)
      ? (storageMode as StorageMode)
      : 'local',
  };
};

export const getLocalFallbackHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.HISTORY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHistoryItem).filter((item): item is HistoryItem => item !== null);
  } catch {
    return [];
  }
};

export const saveLocalFallbackHistory = (history: HistoryItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FALLBACK_KEYS.HISTORY, JSON.stringify(history));
};

export const clearLocalFallbackHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FALLBACK_KEYS.HISTORY);
};

export const deleteLocalFallbackHistoryItem = (id: string): HistoryItem[] => {
  const updated = getLocalFallbackHistory().filter((item) => item.id !== id);
  saveLocalFallbackHistory(updated);
  return updated;
};

export const addLocalFallbackHistory = (
  item: Omit<HistoryItem, 'id' | 'dateTime' | 'storageMode'>
): void => {
  if (typeof window === 'undefined') return;
  const current = getLocalFallbackHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    storageMode: 'local',
  };
  saveLocalFallbackHistory([newItem, ...current]);
};
