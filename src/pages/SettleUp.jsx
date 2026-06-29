import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp, getGroup, getMemberName } from '../context/AppContext';
import { computeBalances } from '../utils/balances';
import { PAYMENT_METHODS, CURRENT_USER_ID, formatMoney } from '../utils/constants';
import { validateSettlement, getMaxSettlementAmount } from '../utils/settlement';
import { ReceiptRow } from '../components/ReceiptCard';

export default function SettleUp() {
  const { groupId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const group = getGroup(state, groupId);

  const [from, setFrom] = useState(CURRENT_USER_ID);
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Venmo');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!group) {
    return (
      <div className="empty-state">
        <p>Group not found.</p>
        <Link to="/groups" className="btn btn--primary">
          Go to Groups
        </Link>
      </div>
    );
  }

  if (group.archived) {
    return (
      <div className="empty-state">
        <p>This group is archived. Restore it to record settlements.</p>
        <Link to={`/groups/${groupId}`} className="btn btn--primary">
          View Group
        </Link>
      </div>
    );
  }

  const balances = computeBalances(
    groupId,
    group.members,
    state.expenses,
    state.settlements
  );

  const otherMembers = group.members.filter((m) => m.id !== from);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!to) {
      setError('Select who you are paying');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (from === to) {
      setError('Cannot pay yourself');
      return;
    }

    const validationError = validateSettlement(balances, from, to, parsedAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    dispatch({
      type: 'ADD_SETTLEMENT',
      payload: {
        groupId,
        from,
        to,
        amount: parsedAmount,
        method,
        note,
      },
    });

    navigate(`/groups/${groupId}`);
  }

  function quickFill(memberId) {
    const myBal = balances[CURRENT_USER_ID] ?? 0;
    if (myBal < 0) {
      setFrom(CURRENT_USER_ID);
      setTo(memberId);
      const theirBal = balances[memberId] ?? 0;
      if (theirBal > 0) {
        setAmount(Math.min(Math.abs(myBal), theirBal).toFixed(2));
      }
    } else if (myBal > 0) {
      setFrom(memberId);
      setTo(CURRENT_USER_ID);
      const theirBal = balances[memberId] ?? 0;
      if (theirBal < 0) {
        setAmount(Math.min(myBal, Math.abs(theirBal)).toFixed(2));
      }
    }
  }

  return (
    <div>
      <Link to={`/groups/${groupId}`} className="back-link">
        ← Back to {group.name}
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">Settle Up</h1>
        <p className="page-header__subtitle">Record a payment between members</p>
      </div>

      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <div className="receipt__section-label">Current Balances</div>
          {group.members.map((member) => {
            const bal = balances[member.id] ?? 0;
            return (
              <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ReceiptRow
                  label={getMemberName(group, member.id, state.user)}
                  amount={
                    <span
                      className={
                        bal > 0
                          ? 'receipt__amount--positive'
                          : bal < 0
                            ? 'receipt__amount--negative'
                            : ''
                      }
                    >
                      {bal === 0
                        ? 'settled'
                        : bal > 0
                          ? `+${formatMoney(bal, group.currency)}`
                          : formatMoney(bal, group.currency)}
                    </span>
                  }
                />
                {bal !== 0 && member.id !== CURRENT_USER_ID && (
                  <button
                    className="btn btn--ghost btn--small"
                    style={{ width: 'auto', marginLeft: '0.5rem' }}
                    onClick={() => quickFill(member.id)}
                  >
                    Fill
                  </button>
                )}
              </div>
            );
          })}

          <hr className="receipt__divider" />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="from">
                From (payer)
              </label>
              <select
                id="from"
                className="form-select"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {group.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getMemberName(group, m.id, state.user)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="to">
                To (recipient)
              </label>
              <select
                id="to"
                className="form-select"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                <option value="">Select member</option>
                {otherMembers
                  .filter((m) => m.id !== from)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {getMemberName(group, m.id, state.user)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Amount
                {to && from && (
                  <span className="form-hint">
                    {' '}· max {formatMoney(getMaxSettlementAmount(balances, from, to), group.currency)}
                  </span>
                )}
              </label>
              <input
                id="amount"
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="method">
                Payment Method
              </label>
              <select
                id="method"
                className="form-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="note">
                Note
              </label>
              <input
                id="note"
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--primary">
              Record Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
