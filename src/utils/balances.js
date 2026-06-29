/**
 * Compute net balances for a group.
 * Positive = others owe this member; Negative = member owes others.
 */
export function computeBalances(groupId, members, expenses, settlements) {
  const balances = {};
  members.forEach((m) => {
    balances[m.id] = 0;
  });

  const groupExpenses = expenses.filter(
    (e) => e.groupId === groupId && !e.deleted
  );
  const groupSettlements = settlements.filter((s) => s.groupId === groupId);

  for (const expense of groupExpenses) {
    const paidBy = expense.paidBy;
    const splits = expense.splits ?? {};

    balances[paidBy] = (balances[paidBy] ?? 0) + expense.amount;

    for (const [memberId, share] of Object.entries(splits)) {
      balances[memberId] = (balances[memberId] ?? 0) - share;
    }
  }

  for (const settlement of groupSettlements) {
    balances[settlement.from] = (balances[settlement.from] ?? 0) + settlement.amount;
    balances[settlement.to] = (balances[settlement.to] ?? 0) - settlement.amount;
  }

  return balances;
}

/**
 * Compute splits from split configuration.
 */
export function calculateSplits(amount, splitType, participants, splitData) {
  const activeParticipants = participants.filter((p) => p.included !== false);
  const count = activeParticipants.length;

  if (count === 0) return {};

  switch (splitType) {
    case 'equal': {
      const perPerson = round2(amount / count);
      const splits = {};
      let allocated = 0;
      activeParticipants.forEach((p, i) => {
        if (i === count - 1) {
          splits[p.id] = round2(amount - allocated);
        } else {
          splits[p.id] = perPerson;
          allocated += perPerson;
        }
      });
      return splits;
    }

    case 'unequal': {
      const splits = {};
      activeParticipants.forEach((p) => {
        splits[p.id] = round2(parseFloat(splitData[p.id]) || 0);
      });
      return splits;
    }

    case 'percentage': {
      const splits = {};
      activeParticipants.forEach((p) => {
        const pct = parseFloat(splitData[p.id]) || 0;
        splits[p.id] = round2((amount * pct) / 100);
      });
      return fixRounding(splits, amount);
    }

    case 'shares': {
      const totalShares = activeParticipants.reduce(
        (sum, p) => sum + (parseFloat(splitData[p.id]) || 0),
        0
      );
      if (totalShares === 0) return {};
      const splits = {};
      activeParticipants.forEach((p) => {
        const shares = parseFloat(splitData[p.id]) || 0;
        splits[p.id] = round2((amount * shares) / totalShares);
      });
      return fixRounding(splits, amount);
    }

    case 'itemized': {
      const items = splitData.items ?? [];
      const tax = parseFloat(splitData.tax) || 0;
      const tip = parseFloat(splitData.tip) || 0;
      const subtotal = items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0);

      const splits = {};
      activeParticipants.forEach((p) => {
        splits[p.id] = 0;
      });

      for (const item of items) {
        const itemTotal = parseFloat(item.price) || 0;
        const assigned = item.assignedTo ?? [];
        if (assigned.length === 0) continue;
        const perPerson = round2(itemTotal / assigned.length);
        let itemAllocated = 0;
        assigned.forEach((memberId, i) => {
          if (i === assigned.length - 1) {
            splits[memberId] = round2((splits[memberId] ?? 0) + (itemTotal - itemAllocated));
          } else {
            splits[memberId] = round2((splits[memberId] ?? 0) + perPerson);
            itemAllocated += perPerson;
          }
        });
      }

      if (subtotal > 0) {
        const extras = tax + tip;
        for (const memberId of Object.keys(splits)) {
          const proportion = splits[memberId] / subtotal;
          splits[memberId] = round2(splits[memberId] + extras * proportion);
        }
      }

      return fixRounding(splits, amount);
    }

    default:
      return {};
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function fixRounding(splits, targetTotal) {
  const current = Object.values(splits).reduce((s, v) => s + v, 0);
  const diff = round2(targetTotal - current);
  if (diff !== 0) {
    const keys = Object.keys(splits);
    if (keys.length > 0) {
      splits[keys[keys.length - 1]] = round2(splits[keys[keys.length - 1]] + diff);
    }
  }
  return splits;
}

export function validateSplits(amount, splits) {
  const total = Object.values(splits).reduce((s, v) => s + v, 0);
  return Math.abs(total - amount) < 0.02;
}
