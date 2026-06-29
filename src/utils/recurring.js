import { generateId, ACTIVITY_TYPES, CURRENT_USER_ID } from './constants';
import { calculateSplits, validateSplits } from './balances';

export const RECURRING_INTERVALS = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'yearly', label: 'Yearly', days: 365 },
  { value: 'custom', label: 'Custom', days: null },
];

export function getIntervalDays(recurring) {
  if (recurring.interval === 'custom') {
    return parseInt(recurring.intervalDays, 10) || 30;
  }
  return RECURRING_INTERVALS.find((i) => i.value === recurring.interval)?.days ?? 30;
}

export function isRecurringDue(recurring, asOf = new Date()) {
  if (!recurring.active) return false;
  const last = recurring.lastGenerated
    ? new Date(recurring.lastGenerated)
    : new Date(recurring.startDate);
  const days = getIntervalDays(recurring);
  const next = new Date(last);
  next.setDate(next.getDate() + days);
  return asOf >= next;
}

export function processRecurringExpenses(state) {
  const recurring = state.recurringExpenses ?? [];
  if (recurring.length === 0) return state;

  let expenses = [...state.expenses];
  let activities = [...state.activities];
  let updatedRecurring = [...recurring];
  let changed = false;

  for (let i = 0; i < updatedRecurring.length; i++) {
    const r = updatedRecurring[i];
    if (!isRecurringDue(r)) continue;

    const group = state.groups.find((g) => g.id === r.groupId);
    if (!group || group.archived) continue;

    const splits =
      r.splits ??
      calculateSplits(r.amount, r.splitType, r.participants, r.splitData ?? {});

    if (!validateSplits(r.amount, splits)) continue;

    const expense = {
      id: generateId(),
      groupId: r.groupId,
      description: r.description,
      amount: r.amount,
      currency: group.currency,
      date: new Date().toISOString().split('T')[0],
      category: r.category,
      paidBy: r.paidBy,
      splitType: r.splitType,
      splits,
      participants: r.participants,
      splitData: r.splitData,
      notes: r.notes ?? '',
      recurringId: r.id,
      createdBy: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      deleted: false,
    };

    expenses.push(expense);
    activities.unshift({
      id: generateId(),
      groupId: r.groupId,
      type: ACTIVITY_TYPES.EXPENSE_CREATED,
      userId: CURRENT_USER_ID,
      expenseId: expense.id,
      message: `Recurring: "${expense.description}" — ${expense.amount}`,
      timestamp: new Date().toISOString(),
    });

    updatedRecurring[i] = {
      ...r,
      lastGenerated: new Date().toISOString(),
    };
    changed = true;
  }

  if (!changed) return state;
  return { ...state, expenses, activities, recurringExpenses: updatedRecurring };
}
