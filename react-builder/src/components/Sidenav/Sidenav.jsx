import { useNav } from '../../store/useNav';

export default function Sidenav() {
  const page    = useNav((s) => s.page);
  const setPage = useNav((s) => s.setPage);

  const wfPages = ['dashboard', 'demo', 'developer'];
  const wfOpen  = wfPages.includes(page);

  return (
    <nav className="side">
      <div className="side-hd">
        <a className="side-logo" href="#">
          <svg viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 7v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="side-logo-text">ShareID</span>
        </a>
      </div>

      <div className="side-nav">
        <a className="side-item" href="#">
          <svg viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
          Home
        </a>

        <button className={`side-item${wfOpen ? ' active' : ''}`} aria-expanded={wfOpen}>
          <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
          Workflows
          <svg className="chev" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {wfOpen && (
          <div className="side-group-body">
            <button
              className={`side-sub${page === 'dashboard' ? ' active' : ''}`}
              onClick={() => setPage('dashboard')}
            >
              My flows
            </button>
          </div>
        )}

        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><path d="M2 12V4m4 8V7m4 5V5m4 7V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Reporting
        </a>
        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Requests history
        </a>

        <div className="side-sep"/>

        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Manage Businesses
        </a>
        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 13c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Manage Users
        </a>

        <div className="side-sep"/>

        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M8 2v1M8 13v1M2 8h1M13 8h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Run Authenticity Photo
        </a>
        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 3H6a1 1 0 00-1 1v8a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.4"/><path d="M13 6l-2 2 2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Operator platform
        </a>
        <a className="side-item disabled" href="#">
          <svg viewBox="0 0 16 16" fill="none"><path d="M2 10l4-4 3 3 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Contact support
        </a>
      </div>

      <div className="side-ft">
        <div className="side-avatar">S</div>
        <div className="side-user">
          <div className="side-user-name">Demo user</div>
          <div className="side-user-role">Admin</div>
        </div>
        <button className="side-exit" title="Sign out">
          <svg viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9 5l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 3H3a1 1 0 00-1 1v6a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
      </div>
    </nav>
  );
}
