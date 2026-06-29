import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateSplits, validateSplits } from '../utils/balances';
import {
  SPLIT_TYPES,
  CATEGORIES,
  CURRENT_USER_ID,
  generateId,
} from '../utils/constants';

function buildSplitDataFromExpense(expense) {
  if (!expense) return {};
  if (['unequal', 'percentage', 'shares'].includes(expense.splitType)) {
    return { ...(expense.splits ?? {}) };
  }
  return expense.splitData ?? {};
}

function buildItemsFromExpense(expense) {
  if (expense?.splitData?.items?.length) {
    return expense.splitData.items.map((item) => ({
      id: generateId(),
      name: item.name ?? '',
      price: item.price ?? '',
      assignedTo: item.assignedTo ?? [],
    }));
  }
  return [{ id: generateId(), name: '', price: '', assignedTo: [] }];
}

export default function ExpenseForm({ group, groupId, expense = null }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const isEdit = Boolean(expense);

  const [description, setDescription] = useState(expense?.description ?? '');
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [date, setDate] = useState(
    expense?.date ?? new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(expense?.category ?? 'Food & Dining');
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? CURRENT_USER_ID);
  const [splitType, setSplitType] = useState(expense?.splitType ?? 'equal');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [splitData, setSplitData] = useState(() => buildSplitDataFromExpense(expense));
  const [participants, setParticipants] = useState(
    expense?.participants ??
      group.members.map((m) => ({ id: m.id, included: true }))
  );
  const [items, setItems] = useState(() => buildItemsFromExpense(expense));
  const [tax, setTax] = useState(expense?.splitData?.tax?.toString() ?? '');
  const [tip, setTip] = useState(expense?.splitData?.tip?.toString() ?? '');
  const [error, setError] = useState('');

  function toggleParticipant(memberId) {
    setParticipants(
      participants.map((p) =>
        p.id === memberId ? { ...p, included: !p.included } : p
      )
    );
  }

  function updateSplitDataField(memberId, value) {
    setSplitData({ ...splitData, [memberId]: value });
  }

  function addItem() {
    setItems([...items, { id: generateId(), name: '', price: '', assignedTo: [] }]);
  }

  function updateItem(id, field, value) {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function toggleItemAssignee(itemId, memberId) {
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const assigned = item.assignedTo.includes(memberId)
          ? item.assignedTo.filter((mid) => mid !== memberId)
          : [...item.assignedTo, memberId];
        return { ...item, assignedTo: assigned };
      })
    );
  }

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

    let data = splitData;
    if (splitType === 'itemized') {
      const validItems = items.filter((i) => i.name.trim() && parseFloat(i.price) > 0);
      if (validItems.length === 0) {
        setError('Add at least one item');
        return;
      }
      data = { items: validItems, tax: parseFloat(tax) || 0, tip: parseFloat(tip) || 0 };
    }

    const splits = calculateSplits(parsedAmount, splitType, participants, data);

    if (!validateSplits(parsedAmount, splits)) {
      setError('Split amounts must equal the expense total');
      return;
    }

    const payload = {
      groupId,
      description: description.trim(),
      amount: parsedAmount,
      currency: group.currency,
      date,
      category,
      paidBy,
      splitType,
      splits,
      participants,
      splitData: splitType === 'itemized' ? data : null,
      notes,
    };

    if (isEdit) {
      dispatch({ type: 'EDIT_EXPENSE', payload: { expenseId: expense.id, ...payload } });
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload });
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
          placeholder="e.g. Dinner at Nobu"
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
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="date">Date</label>
          <input
            id="date"
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
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
      </div>

      <div className="form-group">
        <label className="form-label">Split Type</label>
        <div className="split-options">
          {SPLIT_TYPES.map((st) => (
            <button
              key={st.value}
              type="button"
              className={`split-option ${splitType === st.value ? 'split-option--active' : ''}`}
              onClick={() => setSplitType(st.value)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Participants</label>
        <div className="member-list">
          {participants.map((p) => {
            const member = group.members.find((m) => m.id === p.id);
            return (
              <label
                key={p.id}
                className={`member-chip ${p.included ? 'member-chip--active' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={p.included}
                  onChange={() => toggleParticipant(p.id)}
                />
                {p.id === CURRENT_USER_ID ? 'You' : member?.name}
              </label>
            );
          })}
        </div>
      </div>

      {splitType === 'unequal' && (
        <div className="form-group">
          <label className="form-label">Amounts per Person</label>
          {participants.filter((p) => p.included).map((p) => {
            const member = group.members.find((m) => m.id === p.id);
            return (
              <div key={p.id} className="form-row" style={{ marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.75rem 0', fontSize: '0.85rem' }}>
                  {p.id === CURRENT_USER_ID ? 'You' : member?.name}
                </span>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={splitData[p.id] ?? ''}
                  onChange={(e) => updateSplitDataField(p.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {splitType === 'percentage' && (
        <div className="form-group">
          <label className="form-label">Percentage per Person</label>
          {participants.filter((p) => p.included).map((p) => {
            const member = group.members.find((m) => m.id === p.id);
            return (
              <div key={p.id} className="form-row" style={{ marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.75rem 0', fontSize: '0.85rem' }}>
                  {p.id === CURRENT_USER_ID ? 'You' : member?.name}
                </span>
                <input
                  className="form-input"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={splitData[p.id] ?? ''}
                  onChange={(e) => updateSplitDataField(p.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {splitType === 'shares' && (
        <div className="form-group">
          <label className="form-label">Shares per Person</label>
          {participants.filter((p) => p.included).map((p) => {
            const member = group.members.find((m) => m.id === p.id);
            return (
              <div key={p.id} className="form-row" style={{ marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.75rem 0', fontSize: '0.85rem' }}>
                  {p.id === CURRENT_USER_ID ? 'You' : member?.name}
                </span>
                <input
                  className="form-input"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="shares"
                  value={splitData[p.id] ?? ''}
                  onChange={(e) => updateSplitDataField(p.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}

      {splitType === 'itemized' && (
        <div className="form-group">
          <label className="form-label">Items</label>
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <input
                className="form-input"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              />
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
              />
              <div className="item-assignees">
                {group.members.map((m) => (
                  <label
                    key={m.id}
                    className="member-chip member-chip--active"
                    style={{
                      opacity: item.assignedTo.includes(m.id) ? 1 : 0.4,
                      fontSize: '0.65rem',
                      padding: '0.2rem 0.5rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.assignedTo.includes(m.id)}
                      onChange={() => toggleItemAssignee(item.id, m.id)}
                    />
                    {m.id === CURRENT_USER_ID ? 'You' : m.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--small" onClick={addItem}>
            + Add Item
          </button>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tax</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tip</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn--primary">
        {isEdit ? 'Save Changes' : 'Save Expense'}
      </button>
    </form>
  );
}
