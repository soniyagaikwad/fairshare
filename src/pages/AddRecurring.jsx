import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp, getGroup } from '../context/AppContext';
import { calculateSplits, validateSplits } from '../utils/balances';
import { CATEGORIES, CURRENT_USER_ID } from '../utils/constants';
import { RECURRING_INTERVALS } from '../utils/recurring';

export default function AddRecurring() {
  const { groupId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const group = getGroup(state, groupId);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [paidBy, setPaidBy] = useState(CURRENT_USER_ID);
  const [interval, setInterval] = useState('monthly');
  const [intervalDays, setIntervalDays] = useState('30');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  if (!group || group.archived) {
    return (
      <div className="empty-state">
        <p>{!group ? 'Group not found.' : 'Archived groups are read-only.'}</p>
        <Link to={group ? `/groups/${groupId}` : '/groups'} className="btn btn--primary">
          Go Back
        </Link>
      </div>
    );
  }

  const participants = group.members.map((m) => ({ id: m.id, included: true }));

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const splits = calculateSplits(parsedAmount, 'equal', participants, {});
    if (!validateSplits(parsedAmount, splits)) {
      setError('Could not calculate splits');
      return;
    }

    dispatch({
      type: 'ADD_RECURRING_EXPENSE',
      payload: {
        groupId,
        description: description.trim(),
        amount: parsedAmount,
        category,
        paidBy,
        splitType: 'equal',
        splits,
        participants,
        interval,
        intervalDays: interval === 'custom' ? parseInt(intervalDays, 10) : null,
        startDate,
      },
    });

    navigate(`/groups/${groupId}`);
  }

  return (
    <div>
      <Link to={`/groups/${groupId}`} className="back-link">← Back to {group.name}</Link>
      <div className="page-header">
        <h1 className="page-header__title">Recurring Expense</h1>
        <p className="page-header__subtitle">Auto-generates on schedule · equal split</p>
      </div>
      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <input
                id="description"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly Rent"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="paidBy">Paid By</label>
                <select
                  id="paidBy"
                  className="form-select"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {group.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id === CURRENT_USER_ID ? 'You' : m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="interval">Interval</label>
                <select
                  id="interval"
                  className="form-select"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                >
                  {RECURRING_INTERVALS.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {interval === 'custom' && (
              <div className="form-group">
                <label className="form-label" htmlFor="intervalDays">Every N days</label>
                <input
                  id="intervalDays"
                  className="form-input"
                  type="number"
                  min="1"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(e.target.value)}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn--primary">Create Recurring</button>
          </form>
        </div>
      </div>
    </div>
  );
}
