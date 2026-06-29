import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="app-header__brand">
          <span>///</span> FairShare
        </Link>
        <nav className="app-header__nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Groups
          </Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
