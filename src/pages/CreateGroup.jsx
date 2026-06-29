import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  GROUP_TYPES,
  CURRENCIES,
  CURRENT_USER_ID,
  generateId,
} from '../utils/constants';
import { useUI } from '../context/UIContext';

export default function CreateGroup() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [name, setName] = useState('');
  const [type, setType] = useState('generic');
  const [currency, setCurrency] = useState('USD');
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [simplifyDebts, setSimplifyDebts] = useState(true);
  const [error, setError] = useState('');

  function addMember() {
    const trimmed = memberName.trim();
    if (!trimmed) return;
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Member already added');
      return;
    }
    setMembers([...members, { id: generateId(), name: trimmed }]);
    setMemberName('');
    setError('');
  }

  function removeMember(id) {
    setMembers(members.filter((m) => m.id !== id));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    const allMembers = [
      { id: CURRENT_USER_ID, name: 'You' },
      ...members,
    ];

    dispatch({
      type: 'CREATE_GROUP',
      payload: {
        name: name.trim(),
        type,
        currency,
        members: allMembers,
        simplifyDebts,
      },
    });

    showToast('Group created.');
    navigate('/groups');
  }

  return (
    <div>
      <Link to="/groups" className="back-link">
        ← Back
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">New Group</h1>
        <p className="page-header__subtitle">Set up a shared expense group</p>
      </div>

      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Group Name
              </label>
              <input
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apartment 4B, Tokyo Trip"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {GROUP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="currency">
                  Currency
                </label>
                <select
                  id="currency"
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Members</label>
              <div className="member-list" style={{ marginBottom: '0.75rem' }}>
                <span className="member-chip member-chip--active">You</span>
                {members.map((m) => (
                  <span
                    key={m.id}
                    className="member-chip member-chip--active"
                    onClick={() => removeMember(m.id)}
                    title="Click to remove"
                  >
                    {m.name} ×
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Add member name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMember();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={addMember}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={simplifyDebts}
                  onChange={(e) => setSimplifyDebts(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Simplify debts automatically
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--primary">
              Create Group
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
