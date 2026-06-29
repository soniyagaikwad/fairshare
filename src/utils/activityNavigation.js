import { ACTIVITY_TYPES } from './constants';

/**
 * Returns in-group navigation target for an activity item, or null if not actionable.
 */
export function getActivityNavigation(activity, state) {
  if (activity.expenseId) {
    const expense = state.expenses.find((e) => e.id === activity.expenseId);
    if (expense) {
      const isDeleted = activity.type === ACTIVITY_TYPES.EXPENSE_DELETED || expense.deleted;
      return {
        tab: 'expenses',
        expenseId: isDeleted ? null : activity.expenseId,
      };
    }
  }

  if (activity.type === ACTIVITY_TYPES.SETTLEMENT) {
    return { tab: 'balances' };
  }

  if (
    [
      ACTIVITY_TYPES.RECURRING_CREATED,
      ACTIVITY_TYPES.RECURRING_EDITED,
      ACTIVITY_TYPES.RECURRING_DELETED,
    ].includes(activity.type)
  ) {
    return { tab: 'recurring' };
  }

  return null;
}

export function buildGroupActivityPath(groupId, activity, state) {
  const nav = getActivityNavigation(activity, state);
  if (!nav) return `/groups/${groupId}`;

  const params = new URLSearchParams();
  params.set('tab', nav.tab);
  if (nav.expenseId) params.set('expense', nav.expenseId);
  return `/groups/${groupId}?${params.toString()}`;
}
