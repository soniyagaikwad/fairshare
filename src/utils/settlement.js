/**
 * Max amount `from` can pay to `to` given net balances.
 * Payer should have negative balance; recipient positive.
 */
export function getMaxSettlementAmount(balances, from, to) {
  const fromBal = balances[from] ?? 0;
  const toBal = balances[to] ?? 0;

  if (fromBal >= -0.01 || toBal <= 0.01) {
    return 0;
  }

  return Math.round(Math.min(Math.abs(fromBal), toBal) * 100) / 100;
}

export function validateSettlement(balances, from, to, amount) {
  if (from === to) {
    return 'Cannot pay yourself';
  }
  if (!amount || amount <= 0) {
    return 'Amount must be greater than 0';
  }

  const max = getMaxSettlementAmount(balances, from, to);
  if (max <= 0) {
    return 'This payment direction is not valid — check who owes whom';
  }
  if (amount > max + 0.01) {
    return `Amount cannot exceed ${max.toFixed(2)} owed in this direction`;
  }
  return null;
}
