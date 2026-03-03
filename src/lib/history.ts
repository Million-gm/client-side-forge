export interface HistoryItem {
  name: string;
  type: string;
  action: string;
  date: string;
  size: number;
}

const STORAGE_KEY = 'docu_manip_history';

export const getHistory = (): HistoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const addToHistory = (item: HistoryItem) => {
  const history = getHistory();
  const updated = [item, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};