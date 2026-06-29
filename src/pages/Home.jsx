import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeBalances } from '../utils/balances';
import { formatMoney, CURRENT_USER_ID } from '../utils/constants';

export default function Home() {
  const { state } = useApp();
  const activeGroups = state.groups.filter((g) => !g.archived);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Your Groups</h1>
        <p className="page-header__subtitle">
          {activeGroups.length} active group{activeGroups.length !== 1 ? 's' : ''}
        </p>
      </div>

      {activeGroups.length === 0 ? (
        <div className="receipt receipt--torn-top">
          <div className="receipt__body">
            <div className="empty-state">
              <div className="empty-state__title">No Groups Yet</div>
              <p className="empty-state__text">
                Create a group to start tracking shared expenses with friends,
                roommates, or travel companions.
              </p>
              <Link to="/groups/new" className="btn btn--primary">
                Create Group
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="group-list">
            {activeGroups.map((group) => {
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
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <div className="group-card">
                    <div>
                      <div className="group-card__name">{group.name}</div>
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
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="page-actions">
            <Link to="/groups/new" className="btn btn--primary">
              New Group
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
