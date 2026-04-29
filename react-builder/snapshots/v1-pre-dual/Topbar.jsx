import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export default function Topbar() {
  const pipeline = useStore((s) => s.pipeline);
  const isDirty = useStore((s) => s.isDirty);
  const lastSavedAt = useStore((s) => s.lastSavedAt);
  const markSaved = useStore((s) => s.markSaved);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const timerRef = useRef(null);

  // Auto-save: 1.5s after last change
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => markSaved(), 1500);
    return () => clearTimeout(timerRef.current);
  }, [pipeline, isDirty, markSaved]);

  const savedLabel = lastSavedAt
    ? `Auto-saved at ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : null;

  return (
    <header className="topbar">
      <div className="tb-center">
        <button className={`mode-b${mode === 'onboarding' ? ' on' : ''}`} onClick={() => setMode('onboarding')}>
          Onboarding
        </button>
        <button className={`mode-b${mode === 'auth' ? ' on' : ''}`} onClick={() => setMode('auth')}>
          Authentication
        </button>
      </div>

      <div className="tb-left">
        <button className="tb-back">
          <svg viewBox="0 0 11 11" fill="none">
            <path d="M7 2L4 5.5 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All workflows
        </button>
        <div className="tb-divider"/>
        <input
          className="tb-wf-name"
          defaultValue="Test workflow"
          onBlur={(e) => { if (!e.target.value.trim()) e.target.value = 'Test workflow'; }}
        />
      </div>

      <div className="tb-actions">
        <button className="tb-action-btn">
          <svg viewBox="0 0 13 13" fill="none">
            <polygon points="3,2 11,6.5 3,11" fill="currentColor"/>
          </svg>
          Test
        </button>
        <button className="tb-action-btn">
          <svg viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5h9M8 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 4H2.5a1 1 0 00-1 1v2a1 1 0 001 1H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Integrate
        </button>

        <div className="tb-divider" />

        {/* Save button */}
        {isDirty ? (
          <button className="tb-save-btn active" onClick={markSaved}>
            <svg viewBox="0 0 13 13" fill="none" width="12" height="12">
              <path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save
          </button>
        ) : (
          <div className="tb-saved-wrap" title={savedLabel ?? 'No changes'}>
            <span className="tb-saved">
              <svg viewBox="0 0 11 11" fill="none" width="10" height="10">
                <path d="M2 5.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {savedLabel ? 'Saved' : 'No changes'}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
