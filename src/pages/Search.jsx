import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { globalSearch } from '../utils/search';
import { formatMoney, formatDate } from '../utils/constants';

export default function Search() {
  const { state } = useApp();
  const [query, setQuery] = useState('');

  const results = globalSearch(state, query);
  const hasResults =
    results.profile ||
    results.groups.length > 0 ||
    results.expenses.length > 0 ||
    results.members.length > 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Search</h1>
        <p className="page-header__subtitle">Groups, expenses, and members</p>
      </div>

      <input
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {!query.trim() ? (
        <div className="empty-state">
          <p className="empty-state__text">Type to search across all your data.</p>
        </div>
      ) : !hasResults ? (
        <div className="empty-state">
          <p className="empty-state__text">No results for "{query}"</p>
        </div>
      ) : (
        <div className="receipt receipt--torn-top">
          <div className="receipt__body">
            {results.profile && (
              <section style={{ marginBottom: '1.5rem' }}>
                <div className="receipt__section-label">You</div>
                <Link to="/profile">
                  <div className="search-result">
                    <span>
                      {results.profile.name}
                      <span className="search-result__meta" style={{ display: 'block' }}>
                        {results.profile.email} · Your profile
                      </span>
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {results.groups.length > 0 && (
              <section style={{ marginBottom: '1.5rem' }}>
                <div className="receipt__section-label">Groups</div>
                {results.groups.map(({ item: g }) => (
                  <Link key={g.id} to={`/groups/${g.id}`}>
                    <div className="search-result">
                      <span>{g.name}</span>
                      <span className="search-result__meta">{g.type}</span>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {results.expenses.length > 0 && (
              <section style={{ marginBottom: '1.5rem' }}>
                <div className="receipt__section-label">Expenses</div>
                {results.expenses.map(({ item: e }) => {
                  const group = state.groups.find((g) => g.id === e.groupId);
                  return (
                    <Link key={e.id} to={`/groups/${e.groupId}`}>
                      <div className="search-result">
                        <span>
                          {e.description}
                          <span className="search-result__meta" style={{ display: 'block' }}>
                            {group?.name} · {formatDate(e.date)} · {e.category}
                          </span>
                        </span>
                        <span className="receipt__amount">
                          {formatMoney(e.amount, e.currency)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </section>
            )}

            {results.members.length > 0 && (
              <section>
                <div className="receipt__section-label">Members</div>
                {results.members.map(({ item: m, group, isYou }) => (
                  <Link key={`${group.id}-${m.id}`} to={`/groups/${group.id}`}>
                    <div className="search-result">
                      <span>
                        {m.name}
                        {isYou && (
                          <span className="search-result__meta" style={{ display: 'block' }}>
                            You · {group.name}
                          </span>
                        )}
                      </span>
                      {!isYou && (
                        <span className="search-result__meta">{group.name}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
