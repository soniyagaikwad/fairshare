import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeBalances } from '../utils/balances';
import { formatMoney, CURRENT_USER_ID } from '../utils/constants';
import { useUI } from '../context/UIContext';

export default function Groups() {
  const { state, dispatch } = useApp();
  const { showToast, confirm } = useUI();
  const [filter, setFilter] = useState('active');

  const activeGroups = state.groups.filter((g) => !g.archived);
  const archivedGroups = state.groups.filter((g) => g.archived);
  const displayedGroups = filter === 'active' ? activeGroups : archivedGroups;

  async function handleArchive(groupId, groupName) {
    const ok = await confirm({
      title: 'Archive group?',
      message: `Archive "${groupName}"? You can restore it later from the Archived tab.`,
      confirmLabel: 'Archive',
    });
    if (ok) {
      dispatch({ type: 'ARCHIVE_GROUP', payload: { groupId } });
      showToast('Group archived.');
    }
  }

  function handleRestore(groupId) {
    dispatch({ type: 'UNARCHIVE_GROUP', payload: { groupId } });
    showToast('Group restored.');
  }

  async function handleDelete(groupId, groupName) {
    const ok = await confirm({
      title: 'Delete group?',
      message: `Permanently delete "${groupName}"? This will remove all expenses, settlements, and activity. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) {
      dispatch({ type: 'DELETE_GROUP', payload: { groupId } });
      showToast('Group deleted.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Your Groups</h1>
        <p className="page-header__subtitle">
          {activeGroups.length} active · {archivedGroups.length} archived
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${filter === 'active' ? 'tab--active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({activeGroups.length})
        </button>
        <button
          className={`tab ${filter === 'archived' ? 'tab--active' : ''}`}
          onClick={() => setFilter('archived')}
        >
          Archived ({archivedGroups.length})
        </button>
      </div>

      {displayedGroups.length === 0 ? (
        <div className="receipt receipt--torn-top">
          <div className="receipt__body">
            <div className="empty-state">
              <div className="empty-state__title">
                {filter === 'active' ? 'No Active Groups' : 'No Archived Groups'}
              </div>
              <p className="empty-state__text">
                {filter === 'active'
                  ? 'Create a group to start tracking shared expenses.'
                  : 'Archived groups will appear here. You can restore or permanently delete them.'}
              </p>
              {filter === 'active' && (
                <Link to="/groups/new" className="btn btn--primary">
                  Create Group
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="group-list">
            {displayedGroups.map((group) => {
              const balances = computeBalances(
                group.id,
                group.members,
                state.expenses,
                state.settlements
              );
              const myBalance = balances[CURRENT_USER_ID] ?? 0;
              const expenseCount = state.expenses.filter(
                (e) => e.groupId === group.id && !e.deleted
              ).length;

              return (
                <div key={group.id} className="group-card">
                  <Link to={`/groups/${group.id}`} className="group-card__main">
                    <div>
                      <div className="group-card__name">
                        {group.name}
                        {group.archived && (
                          <span className="group-card__badge">Archived</span>
                        )}
                      </div>
                      <div className="group-card__meta">
                        {group.type} · {group.members.length} members ·{' '}
                        {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div
                      className={`group-card__balance ${
                        myBalance > 0
                          ? 'receipt__amount--positive'
                          : myBalance < 0
                            ? 'receipt__amount--negative'
                            : ''
                      }`}
                    >
                      {myBalance > 0
                        ? `+${formatMoney(myBalance, group.currency)}`
                        : myBalance < 0
                          ? formatMoney(myBalance, group.currency)
                          : 'settled'}
                    </div>
                  </Link>
                  <div className="group-card__actions btn-row">
                    {filter === 'active' ? (
                      <button
                        className="btn btn--small"
                        onClick={() => handleArchive(group.id, group.name)}
                      >
                        Archive
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn--small"
                          onClick={() => handleRestore(group.id)}
                        >
                          Restore
                        </button>
                        <button
                          className="btn btn--danger btn--small"
                          onClick={() => handleDelete(group.id, group.name)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filter === 'active' && (
            <div className="page-actions">
              <Link to="/groups/new" className="btn btn--primary">
                New Group
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
