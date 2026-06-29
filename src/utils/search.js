export function globalSearch(state, query) {
  const q = query.trim().toLowerCase();
  if (!q) return { groups: [], expenses: [], members: [] };

  const groups = state.groups
    .filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q)
    )
    .map((g) => ({ type: 'group', item: g }));

  const expenses = state.expenses
    .filter((e) => !e.deleted)
    .filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
    )
    .map((e) => ({ type: 'expense', item: e }));

  const memberMatches = [];
  const seen = new Set();
  for (const group of state.groups) {
    for (const member of group.members) {
      if (
        member.id !== 'user-you' &&
        member.name.toLowerCase().includes(q) &&
        !seen.has(`${group.id}-${member.id}`)
      ) {
        seen.add(`${group.id}-${member.id}`);
        memberMatches.push({ type: 'member', item: member, group });
      }
    }
  }

  return { groups, expenses, members: memberMatches };
}
