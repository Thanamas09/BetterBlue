import { MenuItem, HistoryItem } from '@/types/menu';

const FALLBACK_KEYS = {
  HISTORY: 'betterblue_local_fallback_history'
};

export const getLocalFallbackHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(FALLBACK_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const addLocalFallbackHistory = (item: Omit<HistoryItem, 'id' | 'dateTime'>): void => {
  if (typeof window === 'undefined') return;
  const current = getLocalFallbackHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    dateTime: new Date().toLocaleString('th-TH'),
  };
  localStorage.setItem(FALLBACK_KEYS.HISTORY, JSON.stringify([newItem, ...current]));
};