import { HistoryItem } from '@/types/menu';

const FALLBACK_KEYS = {
  HISTORY: 'betterblue_local_fallback_history'
};

export const getLocalFallbackHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.HISTORY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  localStorage.setItem(FALLBACK_KEYS.HISTORY, JSON.stringify([newItem, ...current]));
};
