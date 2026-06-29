/**
 * Minimize the number of payments required to settle all debts.
 * Uses a greedy algorithm on net balances.
 */
export function simplifyDebts(balances, members) {
  const creditors = [];
  const debtors = [];

  for (const member of members) {
    const balance = round2(balances[member.id] ?? 0);
    if (balance > 0.01) {
      creditors.push({ id: member.id, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ id: member.id, amount: -balance });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const payments = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const amount = round2(Math.min(creditors[i].amount, debtors[j].amount));
    if (amount > 0.01) {
      payments.push({
        from: debtors[j].id,
        to: creditors[i].id,
        amount,
      });
    }
    creditors[i].amount = round2(creditors[i].amount - amount);
    debtors[j].amount = round2(debtors[j].amount - amount);
    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }

  return payments;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
