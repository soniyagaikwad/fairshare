import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp, getGroup, getMemberName } from '../context/AppContext';
import { computeBalances } from '../utils/balances';
import {
  GROUP_TYPES,
  CURRENCIES,
  CURRENT_USER_ID,
  generateId,
} from '../utils/constants';
import { useUI } from '../context/UIContext';

export default function EditGroup() {
  const { groupId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { showToast } = useUI();
  const group = getGroup(state, groupId);

  const [type, setType] = useState(group?.type ?? 'generic');
  const [currency, setCurrency] = useState(group?.currency ?? 'USD');
  const [members, setMembers] = useState(group?.members ?? []);
  const [memberName, setMemberName] = useState('');
  const [simplifyDebts, setSimplifyDebts] = useState(group?.simplifyDebts ?? true);
  const [error, setError] = useState('');

  if (!group) {
    return (
      <div className="empty-state">
        <p>Group not found.</p>
        <Link to="/groups" className="btn btn--primary">Go to Groups</Link>
      </div>
    );
  }

  if (group.archived) {
    return (
      <div className="empty-state">
        <p>Restore this group before editing settings.</p>
        <Link to={`/groups/${groupId}`} className="btn btn--primary">View Group</Link>
      </div>
    );
  }

  const balances = computeBalances(groupId, group.members, state.expenses, state.settlements);

  function addMember() {
    const trimmed = memberName.trim();
    if (!trimmed) return;
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Member already in group');
      return;
    }
    setMembers([...members, { id: generateId(), name: trimmed }]);
    setMemberName('');
    setError('');
  }

  function removeMember(memberId) {
    if (memberId === CURRENT_USER_ID) {
      setError('You cannot remove yourself');
      return;
    }
    const bal = balances[memberId] ?? 0;
    if (Math.abs(bal) > 0.01) {
      setError('Cannot remove member with an outstanding balance');
      return;
    }
    setMembers(members.filter((m) => m.id !== memberId));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({
      type: 'EDIT_GROUP',
      payload: { groupId, type, currency, members, simplifyDebts },
    });
    showToast('Group updated.');
    navigate(`/groups/${groupId}`);
  }

  return (
    <div>
      <Link to={`/groups/${groupId}`} className="back-link">← Back to {group.name}</Link>
      <div className="page-header">
        <h1 className="page-header__title">Edit Group</h1>
        <p className="page-header__subtitle">{group.name}</p>
      </div>
      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="type">Type</label>
                <select
                  id="type"
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {GROUP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  className="form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Members</label>
              <div className="member-list" style={{ marginBottom: '0.75rem' }}>
                {members.map((m) => (
                  <span
                    key={m.id}
                    className="member-chip member-chip--active"
                    onClick={() => m.id !== CURRENT_USER_ID && removeMember(m.id)}
                    title={m.id !== CURRENT_USER_ID ? 'Click to remove' : undefined}
                    style={{ cursor: m.id !== CURRENT_USER_ID ? 'pointer' : 'default' }}
                  >
                    {getMemberName({ members }, m.id, state.user)}
                    {m.id !== CURRENT_USER_ID && ' ×'}
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
                    if (e.key === 'Enter') { e.preventDefault(); addMember(); }
                  }}
                />
                <button type="button" className="btn btn--small" onClick={addMember}>Add</button>
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
            <button type="submit" className="btn btn--primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
