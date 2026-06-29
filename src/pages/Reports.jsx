import { useState } from 'react';
import { useApp, getMemberName } from '../context/AppContext';
import { buildReports, exportExpensesCsv, downloadCsv } from '../utils/reports';
import { formatMoney } from '../utils/constants';
import ReceiptCard, { ReceiptRow, ReceiptSection } from '../components/ReceiptCard';

export default function Reports() {
  const { state } = useApp();
  const [groupFilter, setGroupFilter] = useState('all');
  const activeGroups = state.groups.filter((g) => !g.archived);

  const reports = buildReports(
    state,
    groupFilter === 'all' ? null : groupFilter
  );

  function handleExport() {
    const csv = exportExpensesCsv(
      state,
      groupFilter === 'all' ? null : groupFilter
    );
    const name =
      groupFilter === 'all'
        ? 'fairshare-all-expenses.csv'
        : `fairshare-${activeGroups.find((g) => g.id === groupFilter)?.name ?? 'group'}.csv`;
    downloadCsv(name.replace(/\s+/g, '-').toLowerCase(), csv);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Reports</h1>
        <p className="page-header__subtitle">Spending insights and export</p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="group-filter">Scope</label>
        <select
          id="group-filter"
          className="form-select"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="all">All active groups</option>
          {activeGroups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <ReceiptCard title="Summary">
        <ReceiptSection label="Overview">
          <ReceiptRow label="Total spent" amount={formatMoney(reports.totalSpent)} />
          <ReceiptRow label="Expenses" amount={reports.expenseCount.toString()} />
        </ReceiptSection>
      </ReceiptCard>

      <div style={{ marginTop: '1.5rem' }}>
        <ReceiptCard title="By Category">
          {reports.byCategory.length === 0 ? (
            <p className="empty-state__text" style={{ padding: '1rem 0' }}>No data yet.</p>
          ) : (
            reports.byCategory.map(([cat, total]) => (
              <ReceiptRow key={cat} label={cat} amount={formatMoney(total)} />
            ))
          )}
        </ReceiptCard>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <ReceiptCard title="By Month">
          {reports.byMonth.length === 0 ? (
            <p className="empty-state__text" style={{ padding: '1rem 0' }}>No data yet.</p>
          ) : (
            reports.byMonth.map(([month, total]) => (
              <ReceiptRow key={month} label={month} amount={formatMoney(total)} />
            ))
          )}
        </ReceiptCard>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <ReceiptCard title="Outstanding Balances">
          {reports.outstanding.length === 0 ? (
            <p className="empty-state__text" style={{ padding: '1rem 0' }}>All settled.</p>
          ) : (
            reports.outstanding.map(({ group, memberId, balance }) => (
              <ReceiptRow
                key={`${group.id}-${memberId}`}
                label={`${getMemberName(group, memberId, state.user)} · ${group.name}`}
                amount={formatMoney(balance, group.currency)}
              />
            ))
          )}
        </ReceiptCard>
      </div>

      <div className="page-actions">
        <button type="button" className="btn btn--primary" onClick={handleExport}>
          Export CSV
        </button>
      </div>
    </div>
  );
}
