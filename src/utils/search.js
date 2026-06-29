import { CURRENT_USER_ID } from './constants';

function memberDisplayName(member, user) {
  if (member.id === CURRENT_USER_ID || member.id === 'user-you') {
    return user?.name || member.name || 'You';
  }
  return member.name;
}

export function globalSearch(state, query) {
  const q = query.trim().toLowerCase();
  if (!q) return { groups: [], expenses: [], members: [], profile: null };

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

  const user = state.user;
  const userName = user?.name?.toLowerCase() ?? '';
  const userEmail = user?.email?.toLowerCase() ?? '';
  const profileMatches =
    userName.includes(q) ||
    userEmail.includes(q) ||
    q === 'you' ||
    q === 'me';

  const memberMatches = [];
  const seen = new Set();
  for (const group of state.groups) {
    for (const member of group.members) {
      const name = memberDisplayName(member, user).toLowerCase();
      const isYou = member.id === CURRENT_USER_ID || member.id === 'user-you';
      const matches =
        name.includes(q) || (isYou && (q === 'you' || q === 'me'));

      if (matches && !seen.has(`${group.id}-${member.id}`)) {
        seen.add(`${group.id}-${member.id}`);
        memberMatches.push({
          type: 'member',
          item: { ...member, name: memberDisplayName(member, user) },
          group,
          isYou,
        });
      }
    }
  }

  return {
    groups,
    expenses,
    members: memberMatches,
    profile: profileMatches ? user : null,
  };
}
