const STORAGE_KEY = 'fairshare-data';

export const DEFAULT_STATE = {
  user: {
    id: 'user-you',
    name: 'You',
    email: 'you@fairshare.app',
    defaultCurrency: 'USD',
    profilePicture: null,
    notifications: {
      expenseAdded: true,
      settlements: true,
      comments: true,
    },
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
      user: {
        ...DEFAULT_STATE.user,
        ...parsed.user,
        notifications: {
          ...DEFAULT_STATE.user.notifications,
          ...parsed.user?.notifications,
        },
      },
      recurringExpenses: parsed.recurringExpenses ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
