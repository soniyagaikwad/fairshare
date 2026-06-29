import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateSplits, validateSplits } from '../utils/balances';
import { CATEGORIES, CURRENT_USER_ID } from '../utils/constants';
import { RECURRING_INTERVALS } from '../utils/recurring';
import { useUI } from '../context/UIContext';

export default function RecurringForm({ group, groupId, recurring = null }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const isEdit = Boolean(recurring);

  const [description, setDescription] = useState(recurring?.description ?? '');
  const [amount, setAmount] = useState(recurring?.amount?.toString() ?? '');
  const [category, setCategory] = useState(recurring?.category ?? 'Rent');
  const [paidBy, setPaidBy] = useState(recurring?.paidBy ?? CURRENT_USER_ID);
  const [interval, setInterval] = useState(recurring?.interval ?? 'monthly');
  const [intervalDays, setIntervalDays] = useState(
    recurring?.intervalDays?.toString() ?? '30'
  );
  const [startDate, setStartDate] = useState(
    recurring?.startDate ?? new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');

  const participants =
    recurring?.participants ?? group.members.map((m) => ({ id: m.id, included: true }));

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

    const payload = {
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
    };

    if (isEdit) {
      dispatch({
        type: 'EDIT_RECURRING_EXPENSE',
        payload: { recurringId: recurring.id, ...payload },
      });
      showToast('Recurring expense updated.');
    } else {
      dispatch({ type: 'ADD_RECURRING_EXPENSE', payload });
      showToast('Recurring expense added.');
    }

    navigate(`/groups/${groupId}`);
  }

  return (
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
      <button type="submit" className="btn btn--primary">
        {isEdit ? 'Save Changes' : 'Create Recurring'}
      </button>
    </form>
  );
}
