import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useApp,
  getGroup,
  getGroupExpenses,
  getGroupRecurring,
  getMemberName,
} from '../context/AppContext';
import { computeBalances } from '../utils/balances';
import { simplifyDebts } from '../utils/debtSimplification';
import { RECURRING_INTERVALS } from '../utils/recurring';
import {
  formatMoney,
  formatDate,
  formatDateTime,
  CURRENT_USER_ID,
} from '../utils/constants';
import ReceiptCard, {
  ReceiptDivider,
  ReceiptRow,
  ReceiptSection,
} from '../components/ReceiptCard';

export default function GroupDetail() {
  const { groupId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('balances');
  const [search, setSearch] = useState('');
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');

  const group = getGroup(state, groupId);
  if (!group) {
    return (
      <div className="empty-state">
        <p>Group not found.</p>
        <Link to="/groups" className="btn btn--primary">
          Go Home
        </Link>
      </div>
    );
  }

  const expenses = getGroupExpenses(state, groupId);
  const balances = computeBalances(
    groupId,
    group.members,
    state.expenses,
    state.settlements
  );
  const simplified = group.simplifyDebts
    ? simplifyDebts(balances, group.members)
    : [];
  const activities = state.activities
    .filter((a) => a.groupId === groupId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recurring = getGroupRecurring(state, groupId);

  const tabs = group.archived
    ? ['balances', 'expenses', 'activity']
    : ['balances', 'expenses', 'recurring', 'activity'];

  const filteredExpenses = search
    ? expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.category?.toLowerCase().includes(search.toLowerCase())
      )
    : expenses;

  function handleDeleteExpense(expenseId) {
    if (window.confirm('Delete this expense?')) {
      dispatch({ type: 'DELETE_EXPENSE', payload: { expenseId } });
    }
  }

  function handleAddComment(expenseId) {
    if (!commentText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      payload: { expenseId, groupId, text: commentText.trim() },
    });
    setCommentText('');
  }

  function startRename() {
    setRenameValue(group.name);
    setRenameError('');
    setIsRenaming(true);
  }

  function cancelRename() {
    setIsRenaming(false);
    setRenameValue('');
    setRenameError('');
  }

  function handleRename(e) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameError('Group name is required');
      return;
    }
    if (trimmed === group.name) {
      cancelRename();
      return;
    }
    dispatch({
      type: 'RENAME_GROUP',
      payload: { groupId, name: trimmed },
    });
    cancelRename();
  }

  const myBalance = balances[CURRENT_USER_ID] ?? 0;

  return (
    <div>
      <div className="page-toolbar">
        <Link to="/groups" className="back-link">
          ← All Groups
        </Link>
        <div className="group-detail__actions">
          {group.archived ? (
            <>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => {
                  dispatch({ type: 'UNARCHIVE_GROUP', payload: { groupId } });
                }}
              >
                Restore
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--danger btn--small"
                onClick={() => {
                  if (
                    window.confirm(
                      `Permanently delete "${group.name}"? This cannot be undone.`
                    )
                  ) {
                    dispatch({ type: 'DELETE_GROUP', payload: { groupId } });
                    navigate('/groups');
                  }
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={startRename}
              >
                Rename
              </button>
              <Link
                to={`/groups/${groupId}/edit`}
                className="btn btn--ghost btn--small"
              >
                Edit
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => {
                  if (
                    window.confirm(
                      `Archive "${group.name}"? You can restore it later from the Archived tab.`
                    )
                  ) {
                    dispatch({ type: 'ARCHIVE_GROUP', payload: { groupId } });
                  }
                }}
              >
                Archive
              </button>
            </>
          )}
        </div>
      </div>

      {group.archived && (
        <div className="archived-banner">
          This group is archived — viewing only. Restore it from the Groups page to make changes.
        </div>
      )}

      {!group.archived && isRenaming && (
        <div className="rename-form">
          <form onSubmit={handleRename}>
            <label className="form-label" htmlFor="group-name">
              Rename Group
            </label>
            <input
              id="group-name"
              className="form-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            {renameError && <p className="form-error">{renameError}</p>}
            <div className="rename-form__actions">
              <button type="submit" className="btn btn--primary btn--small">
                Save
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={cancelRename}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <ReceiptCard
        title={group.name}
        date={new Date().toISOString()}
        footer="FairShare — Split fairly, settle simply"
      >
        <ReceiptSection label="Your Balance">
          <ReceiptRow
            label={myBalance >= 0 ? 'You are owed' : 'You owe'}
            amount={
              <span
                className={
                  myBalance > 0
                    ? 'receipt__amount--positive'
                    : myBalance < 0
                      ? 'receipt__amount--negative'
                      : ''
                }
              >
                {myBalance === 0
                  ? 'Settled'
                  : formatMoney(Math.abs(myBalance), group.currency)}
              </span>
            }
            total
          />
        </ReceiptSection>

        <ReceiptDivider />

        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? 'tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'balances' && (
          <>
            <ReceiptSection label="Member Balances">
              <ReceiptRow label="Member" amount="Balance" header />
              {group.members.map((member) => {
                const bal = balances[member.id] ?? 0;
                return (
                  <ReceiptRow
                    key={member.id}
                    label={getMemberName(group, member.id)}
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
                          ? '—'
                          : bal > 0
                            ? `+${formatMoney(bal, group.currency)}`
                            : formatMoney(bal, group.currency)}
                      </span>
                    }
                  />
                );
              })}
            </ReceiptSection>

            {group.simplifyDebts && simplified.length > 0 && (
              <>
                <ReceiptDivider />
                <ReceiptSection label="Simplified Settlements">
                  {simplified.map((payment, i) => (
                    <div key={i} className="settlement-card">
                      <div className="settlement-card__arrow">
                        {getMemberName(group, payment.from)} →{' '}
                        {getMemberName(group, payment.to)}
                      </div>
                      <ReceiptRow
                        label="Amount"
                        amount={formatMoney(payment.amount, group.currency)}
                      />
                    </div>
                  ))}
                </ReceiptSection>
              </>
            )}
          </>
        )}

        {tab === 'expenses' && (
          <>
            <input
              className="search-input"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {filteredExpenses.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <p className="empty-state__text">No expenses yet.</p>
              </div>
            ) : (
              <>
                <ReceiptRow label="Description" amount="Amount" header />
                {filteredExpenses
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((expense) => {
                    const isExpanded = expandedExpense === expense.id;
                    const expenseComments = state.comments.filter(
                      (c) => c.expenseId === expense.id
                    );
                    const myShare = expense.splits?.[CURRENT_USER_ID] ?? 0;

                    return (
                      <div key={expense.id}>
                        <div
                          className="receipt__row"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            setExpandedExpense(isExpanded ? null : expense.id)
                          }
                        >
                          <span>
                            {expense.description}
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.65rem',
                                color: 'var(--ink-faint)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {formatDate(expense.date)} · paid by{' '}
                              {getMemberName(group, expense.paidBy)} · your
                              share: {formatMoney(myShare, group.currency)}
                            </span>
                          </span>
                          <span className="receipt__amount">
                            {formatMoney(expense.amount, group.currency)}
                          </span>
                        </div>

                        {isExpanded && (
                          <div
                            style={{
                              padding: '0.75rem 0',
                              borderBottom: '1px dotted var(--line)',
                            }}
                          >
                            <ReceiptRow
                              label="Category"
                              amount={expense.category}
                            />
                            <ReceiptRow
                              label="Split"
                              amount={expense.splitType}
                            />
                            {expense.notes && (
                              <ReceiptRow label="Notes" amount={expense.notes} />
                            )}

                            <div style={{ marginTop: '0.75rem' }}>
                              <div className="receipt__section-label">
                                Split Breakdown
                              </div>
                              {Object.entries(expense.splits ?? {}).map(
                                ([memberId, share]) => (
                                  <ReceiptRow
                                    key={memberId}
                                    label={getMemberName(group, memberId)}
                                    amount={formatMoney(share, group.currency)}
                                  />
                                )
                              )}
                            </div>

                            {expenseComments.length > 0 && (
                              <div style={{ marginTop: '0.75rem' }}>
                                <div className="receipt__section-label">
                                  Comments
                                </div>
                                {expenseComments.map((c) => (
                                  <div key={c.id} className="comment">
                                    <div className="comment__author">You</div>
                                    <div className="comment__text">{c.text}</div>
                                    <div className="comment__time">
                                      {formatDateTime(c.createdAt)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!group.archived && (
                              <div className="comment-form">
                                <input
                                  placeholder="Add a comment..."
                                  value={
                                    expandedExpense === expense.id
                                      ? commentText
                                      : ''
                                  }
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(expense.id);
                                    }
                                  }}
                                />
                                <button
                                  className="btn btn--small"
                                  onClick={() => handleAddComment(expense.id)}
                                >
                                  Post
                                </button>
                              </div>
                            )}

                            {!group.archived && (
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                <Link
                                  to={`/groups/${groupId}/expenses/${expense.id}/edit`}
                                  className="btn btn--small"
                                >
                                  Edit
                                </Link>
                                <button
                                  className="btn btn--ghost btn--danger btn--small"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}
          </>
        )}

        {tab === 'recurring' && (
          <>
            {recurring.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <p className="empty-state__text">No recurring expenses yet.</p>
                <Link
                  to={`/groups/${groupId}/recurring/new`}
                  className="btn btn--primary btn--small"
                  style={{ marginTop: '1rem' }}
                >
                  Add Recurring
                </Link>
              </div>
            ) : (
              <>
                {recurring.map((r) => {
                  const intervalLabel =
                    RECURRING_INTERVALS.find((i) => i.value === r.interval)?.label ??
                    r.interval;
                  return (
                    <div key={r.id} className="recurring-item">
                      <ReceiptRow
                        label={
                          <span>
                            {r.description}
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.65rem',
                                color: 'var(--ink-faint)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {intervalLabel} · {r.category}
                            </span>
                          </span>
                        }
                        amount={formatMoney(r.amount, group.currency)}
                      />
                      <button
                        type="button"
                        className="btn btn--ghost btn--danger btn--small"
                        onClick={() => {
                          if (window.confirm(`Remove recurring "${r.description}"?`)) {
                            dispatch({
                              type: 'DELETE_RECURRING_EXPENSE',
                              payload: { recurringId: r.id },
                            });
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
                <Link
                  to={`/groups/${groupId}/recurring/new`}
                  className="btn btn--secondary btn--small"
                  style={{ marginTop: '1rem' }}
                >
                  Add Recurring
                </Link>
              </>
            )}
          </>
        )}

        {tab === 'activity' && (
          <>
            {activities.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <p className="empty-state__text">No activity yet.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div>{activity.message}</div>
                  <div className="activity-item__time">
                    {formatDateTime(activity.timestamp)}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </ReceiptCard>

      {!group.archived && (
        <div className="page-actions">
          <Link
            to={`/groups/${groupId}/expenses/new`}
            className="btn btn--primary"
          >
            Add Expense
          </Link>
          <Link to={`/groups/${groupId}/settle`} className="btn btn--secondary">
            Settle Up
          </Link>
        </div>
      )}
    </div>
  );
}
