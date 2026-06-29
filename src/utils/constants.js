export const CURRENT_USER_ID = 'user-you';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export const GROUP_TYPES = [
  { value: 'household', label: 'Household' },
  { value: 'trip', label: 'Trip' },
  { value: 'event', label: 'Event' },
  { value: 'project', label: 'Project' },
  { value: 'generic', label: 'Generic' },
];

export const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal' },
  { value: 'unequal', label: 'Unequal' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'shares', label: 'Shares' },
  { value: 'itemized', label: 'Itemized' },
];

export const CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Rent',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Travel',
  'Shopping',
  'Health',
  'Other',
];

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Venmo',
  'PayPal',
  'Other',
];

export const ACTIVITY_TYPES = {
  EXPENSE_CREATED: 'expense_created',
  EXPENSE_EDITED: 'expense_edited',
  EXPENSE_DELETED: 'expense_deleted',
  SETTLEMENT: 'settlement',
  COMMENT: 'comment',
  MEMBER_JOINED: 'member_joined',
  GROUP_CREATED: 'group_created',
  GROUP_ARCHIVED: 'group_archived',
  GROUP_RESTORED: 'group_restored',
  GROUP_DELETED: 'group_deleted',
};

export function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatMoney(amount, currencyCode = 'USD') {
  const symbol = getCurrencySymbol(currencyCode);
  const abs = Math.abs(amount);
  const formatted = abs.toFixed(2);
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
