import { useState, useEffect, useRef } from 'react';
import Sidenav from '../Sidenav/Sidenav';

const readWorkspaces = () => JSON.parse(localStorage.getItem('shareid_workspaces') || '[]');
const writeWorkspaces = (list) => localStorage.setItem('shareid_workspaces', JSON.stringify(list));

const MOD_NAMES = { doc: 'Identity', face: 'Face IDV', ext: 'Issuance', int: 'Integration', auth: 'Authentication' };

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function cardInfo(wf) {
  const ob = wf.flows?.onboarding?.pipeline || [];
  const auth = wf.flows?.auth?.pipeline || [];
  const pipe = [...ob, ...auth];
  const flowType = wf.flowType || (auth.length && !ob.length ? 'auth' : 'onboarding');
  const names = pipe.map(s => MOD_NAMES[s.type] || s.type).join(' · ');
  const totalTok = pipe.reduce((s, st) => s + (st.config?.t || 0), 0);
  return { flowType, names, totalTok };
}

function WorkflowCard({ wf, onOpen, onTest, onIntegrate, onRename, onDelete, onDuplicate, mode }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(wf.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const { flowType, names, totalTok } = cardInfo(wf);

  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [menuOpen]);

  const commitRename = () => {
    const val = draft.trim();
    if (val && val !== wf.name) onRename(wf.id, val);
    else setDraft(wf.name);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setDraft(wf.name); setEditing(false); }
  };

  const handleCardClick = () => {
    if (editing || menuOpen) return;
    if (mode === 'demo') onTest(wf.id);
    else if (mode === 'developer') onIntegrate(wf.id);
    else onOpen(wf.id);
  };

  return (
    <div
      className="wf-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !editing) handleCardClick(); }}
    >
      <div className="wf-card-top">
        <span className={`wf-badge${flowType === 'auth' ? ' auth' : ''}`}>
          {flowType === 'auth' ? 'Authentication' : 'Onboarding'}
        </span>
        <div className="wf-menu-wrap" ref={menuRef}>
          <button
            className="wf-menu-btn"
            title="More actions"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="wf-menu-pop" onClick={(e) => e.stopPropagation()}>
              {mode === 'flows' && (
                <button className="wf-menu-item" onClick={() => { setMenuOpen(false); onOpen(wf.id); }}>
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Open
                </button>
              )}
              <button className="wf-menu-item" onClick={() => { setMenuOpen(false); onTest(wf.id); }}>
                <svg viewBox="0 0 16 16" fill="none"><polygon points="4,3 13,8 4,13" fill="currentColor" opacity=".8"/></svg>
                Test
              </button>
              <button className="wf-menu-item" onClick={() => { setMenuOpen(false); onIntegrate(wf.id); }}>
                <svg viewBox="0 0 16 16" fill="none"><path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5M9.5 3l-3 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Integrate
              </button>
              {mode === 'flows' && (
                <>
                  <div className="wf-menu-sep" />
                  <button className="wf-menu-item" onClick={() => { setMenuOpen(false); setEditing(true); }}>
                    <svg viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5L6 12.5l-3 .5.5-3L11 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                    Rename
                  </button>
                  <button className="wf-menu-item" onClick={() => { setMenuOpen(false); onDuplicate(wf.id); }}>
                    <svg viewBox="0 0 16 16" fill="none"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10.5 5.5V3.5c0-.55-.45-1-1-1H3.5c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h2" stroke="currentColor" strokeWidth="1.4"/></svg>
                    Duplicate
                  </button>
                  <div className="wf-menu-sep" />
                  <button className="wf-menu-item danger" onClick={() => {
                    setMenuOpen(false);
                    // eslint-disable-next-line no-restricted-globals
                    if (confirm(`Delete "${wf.name}"? This cannot be undone.`)) onDelete(wf.id);
                  }}>
                    <svg viewBox="0 0 16 16" fill="none"><path d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M5 4.5l.5 8a1 1 0 001 .9h3a1 1 0 001-.9l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          className="wf-card-name-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <h3 className="wf-card-name" onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}>
          {wf.name || 'Untitled'}
        </h3>
      )}

      {names ? (
        <div className="wf-card-mods">
          <span className="wf-card-mods-names">{names}</span>
          {totalTok > 0 && <span className="wf-card-tok">{totalTok} tok</span>}
        </div>
      ) : (
        <div className="wf-card-empty-hint">
          {mode === 'demo' ? 'Click to test' : mode === 'developer' ? 'Click to get code' : 'Empty — click to build'}
        </div>
      )}

      <div className="wf-card-foot">
        <span className="wf-card-date">{timeAgo(wf.updatedAt || wf.createdAt)}</span>
      </div>
    </div>
  );
}

function AddCard({ onCreate }) {
  return (
    <button className="wf-card wf-card--add" onClick={onCreate}>
      <div className="wf-add-icon">
        <svg viewBox="0 0 18 18" fill="none">
          <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="wf-add-label">New workflow</div>
    </button>
  );
}

const PAGE_META = {
  flows:     { title: 'Workflows',     topbar: 'Workflows',    showNew: true },
  demo:      { title: 'Product demo',  topbar: 'Product demo', showNew: false },
  developer: { title: 'Developer',     topbar: 'Developer',    showNew: false },
};

export default function Dashboard({ onOpen, onCreate, onTest, onIntegrate, mode = 'flows' }) {
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState('');
  const searchRef = useRef(null);

  const refresh = () => setWorkflows(readWorkspaces());

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const uid = () => 'w_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

  const handleCreate = () => {
    const list = readWorkspaces();
    const base = 'Untitled workflow';
    const taken = list.map((w) => w.name);
    let name = base;
    if (taken.includes(base)) { let n = 2; while (taken.includes(`${base} ${n}`)) n++; name = `${base} ${n}`; }
    onCreate(name);
  };

  const handleRename = (id, name) => {
    const list = readWorkspaces();
    const idx = list.findIndex((w) => w.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], name, updatedAt: Date.now() }; writeWorkspaces(list); refresh(); }
  };

  const handleDelete = (id) => {
    writeWorkspaces(readWorkspaces().filter((w) => w.id !== id));
    refresh();
  };

  const handleDuplicate = (id) => {
    const list = readWorkspaces();
    const wf = list.find((w) => w.id === id);
    if (!wf) return;
    const copy = { ...wf, id: uid(), name: `${wf.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    writeWorkspaces([...list, copy]);
    refresh();
  };

  const filtered = workflows.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()));
  const meta = PAGE_META[mode] || PAGE_META.flows;

  return (
    <div className="dash-shell">
      <Sidenav />
      <div className="dash-main">
        {/* Topbar */}
        <div className="dash-topbar">
          <span className="dash-topbar-title">{meta.topbar}</span>
          <span className="dash-topbar-right">Workspace</span>
        </div>

        {/* Page header */}
        <div className="dash-page-hd">
          <div>
            <h1 className="dash-page-title">{meta.title}</h1>
            <p className="dash-page-sub">
              {workflows.length === 0
                ? 'No workflows yet.'
                : `${workflows.length} workflow${workflows.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {meta.showNew && (
            <button className="dash-new-btn" onClick={handleCreate}>
              <svg viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              New workflow
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="dash-toolbar">
          <div className="dash-search-wrap">
            <svg className="dash-search-ico" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              className="dash-search"
              placeholder='Search workflows…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="dash-search-clear" onClick={() => setSearch('')}>
                <svg viewBox="0 0 10 10" fill="none">
                  <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 && search ? (
          <div className="dash-empty">
            <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
              <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2" opacity=".25"/>
              <path d="M32 32l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".25"/>
            </svg>
            <div className="dash-empty-title">No results for "{search}"</div>
            <div className="dash-empty-sub">Try a different search term.</div>
          </div>
        ) : (
          <div className="dash-grid">
            {filtered.map((wf) => (
              <WorkflowCard
                key={wf.id}
                wf={wf}
                mode={mode}
                onOpen={onOpen}
                onTest={onTest}
                onIntegrate={onIntegrate}
                onRename={handleRename}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
            {mode === 'flows' && <AddCard onCreate={handleCreate} />}
          </div>
        )}
      </div>
    </div>
  );
}
