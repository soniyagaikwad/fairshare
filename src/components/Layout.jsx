import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="app-header__brand">
          <span>///</span> FairShare
        </Link>
        <nav className="app-header__nav">
          <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/groups" className={isActive('/groups') ? 'active' : ''}>
            Groups
          </Link>
          <Link to="/search" className={isActive('/search') ? 'active' : ''}>
            Search
          </Link>
          <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>
            Reports
          </Link>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            Profile
          </Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
