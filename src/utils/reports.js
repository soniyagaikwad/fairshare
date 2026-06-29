import { computeBalances } from './balances';
import { formatMoney } from './constants';

export function buildReports(state, groupId = null) {
  const groups = groupId
    ? state.groups.filter((g) => g.id === groupId)
    : state.groups.filter((g) => !g.archived);

  const expenses = state.expenses.filter(
    (e) => !e.deleted && groups.some((g) => g.id === e.groupId)
  );

  const byCategory = {};
  const byMonth = {};
  const byMember = {};
  const outstanding = [];

  for (const expense of expenses) {
    const cat = expense.category || 'Other';
    byCategory[cat] = (byCategory[cat] ?? 0) + expense.amount;

    const month = expense.date?.slice(0, 7) ?? 'unknown';
    byMonth[month] = (byMonth[month] ?? 0) + expense.amount;

    for (const [memberId, share] of Object.entries(expense.splits ?? {})) {
      byMember[memberId] = (byMember[memberId] ?? 0) + share;
    }
  }

  for (const group of groups) {
    const balances = computeBalances(
      group.id,
      group.members,
      state.expenses,
      state.settlements
    );
    for (const member of group.members) {
      const bal = balances[member.id] ?? 0;
      if (Math.abs(bal) > 0.01) {
        outstanding.push({ group, memberId: member.id, balance: bal });
      }
    }
  }

  return {
    byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
    byMonth: Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])),
    byMember,
    outstanding,
    totalSpent: expenses.reduce((s, e) => s + e.amount, 0),
    expenseCount: expenses.length,
  };
}

export function exportExpensesCsv(state, groupId = null) {
  const groups = groupId
    ? state.groups.filter((g) => g.id === groupId)
    : state.groups;

  const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));
  const rows = [
    ['Date', 'Group', 'Description', 'Category', 'Amount', 'Currency', 'Paid By', 'Split Type'].join(','),
  ];

  for (const e of state.expenses.filter((ex) => !ex.deleted && groupMap[ex.groupId])) {
    const g = groupMap[e.groupId];
    const paidBy = g.members.find((m) => m.id === e.paidBy)?.name ?? e.paidBy;
    rows.push(
      [
        e.date,
        `"${g.name}"`,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        e.amount,
        e.currency,
        `"${paidBy}"`,
        e.splitType,
      ].join(',')
    );
  }

  return rows.join('\n');
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
