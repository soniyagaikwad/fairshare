const STORAGE_KEY = 'fairshare-data';

export const DEFAULT_STATE = {
  user: {
    id: 'user-you',
    name: 'You',
    email: 'you@fairshare.app',
    defaultCurrency: 'USD',
  },
  groups: [],
  expenses: [],
  settlements: [],
  activities: [],
  comments: [],
  recurringExpenses: [],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      recurringExpenses: parsed.recurringExpenses ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
