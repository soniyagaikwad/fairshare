import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeBalances } from '../utils/balances';
import {
  formatMoney,
  formatDateTime,
  CURRENT_USER_ID,
} from '../utils/constants';
import ReceiptCard, {
  ReceiptDivider,
  ReceiptRow,
  ReceiptSection,
} from '../components/ReceiptCard';

export default function Home() {
  const { state } = useApp();
  const activeGroups = state.groups.filter((g) => !g.archived);

  let totalOwed = 0;
  let totalOwing = 0;
  const groupsWithBalances = activeGroups.map((group) => {
    const balances = computeBalances(
      group.id,
      group.members,
      state.expenses,
      state.settlements
    );
    const myBalance = balances[CURRENT_USER_ID] ?? 0;
    if (myBalance > 0) totalOwed += myBalance;
    if (myBalance < 0) totalOwing += Math.abs(myBalance);
    return { group, myBalance };
  });

  const unsettledGroups = groupsWithBalances.filter((g) => g.myBalance !== 0);
  const recentActivity = [...state.activities]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  return (
    <div>
      <div className="page-header page-header--centered">
        <h1 className="page-header__title">FairShare</h1>
        <p className="page-header__subtitle">
          Split fairly, settle simply
        </p>
      </div>

      <div className="page-actions page-actions--top">
        <Link to="/groups/new" className="btn btn--primary">
          New Group
        </Link>
        <Link to="/groups" className="btn">
          View All Groups
        </Link>
      </div>

      <ReceiptCard title="Balance Summary" date={new Date().toISOString()}>
        <ReceiptSection label="Your Totals">
          <ReceiptRow
            label="You are owed"
            amount={
              <span className="receipt__amount--positive">
                {formatMoney(totalOwed)}
              </span>
            }
          />
          <ReceiptRow
            label="You owe"
            amount={
              <span className="receipt__amount--negative">
                {formatMoney(totalOwing)}
              </span>
            }
          />
          <ReceiptDivider light />
          <ReceiptRow
            label="Net"
            amount={
              <span
                className={
                  totalOwed - totalOwing > 0
                    ? 'receipt__amount--positive'
                    : totalOwed - totalOwing < 0
                      ? 'receipt__amount--negative'
                      : ''
                }
              >
                {totalOwed - totalOwing === 0
                  ? 'All settled'
                  : formatMoney(totalOwed - totalOwing)}
              </span>
            }
            total
          />
        </ReceiptSection>

        {unsettledGroups.length > 0 && (
          <>
            <ReceiptDivider />
            <ReceiptSection label="Outstanding by Group">
              {unsettledGroups.map(({ group, myBalance }) => (
                <Link key={group.id} to={`/groups/${group.id}`}>
                  <ReceiptRow
                    label={group.name}
                    amount={
                      <span
                        className={
                          myBalance > 0
                            ? 'receipt__amount--positive'
                            : 'receipt__amount--negative'
                        }
                      >
                        {myBalance > 0
                          ? `+${formatMoney(myBalance, group.currency)}`
                          : formatMoney(myBalance, group.currency)}
                      </span>
                    }
                  />
                </Link>
              ))}
            </ReceiptSection>
          </>
        )}
      </ReceiptCard>

      <div style={{ marginTop: '1.5rem' }}>
        <ReceiptCard title="Recent Activity">
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <p className="empty-state__text">
                No activity yet. Create a group and add your first expense.
              </p>
            </div>
          ) : (
            recentActivity.map((activity) => {
              const group = state.groups.find((g) => g.id === activity.groupId);
              return (
                <div key={activity.id} className="activity-item">
                  <div>
                    {group && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--ink-faint)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          display: 'block',
                          marginBottom: '0.15rem',
                        }}
                      >
                        {group.name}
                      </span>
                    )}
                    {activity.message}
                  </div>
                  <div className="activity-item__time">
                    {formatDateTime(activity.timestamp)}
                  </div>
                </div>
              );
            })
          )}
        </ReceiptCard>
      </div>
    </div>
  );
}
