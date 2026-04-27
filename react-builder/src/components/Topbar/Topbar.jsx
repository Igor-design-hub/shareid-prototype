import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export default function Topbar({ onBack, onTest, onIntegrate }) {
  const obPipeline     = useStore((s) => s.obPipeline);
  const authPipeline   = useStore((s) => s.authPipeline);
  const isDirty        = useStore((s) => s.isDirty);
  const lastSavedAt    = useStore((s) => s.lastSavedAt);
  const markSaved      = useStore((s) => s.markSaved);
  const workflowName   = useStore((s) => s.workflowName);
  const setWorkflowName = useStore((s) => s.setWorkflowName);
  const timerRef = useRef(null);

  // Auto-save: 1.5s after last change
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => markSaved(), 1500);
    return () => clearTimeout(timerRef.current);
  }, [obPipeline, authPipeline, isDirty, markSaved]);

  const savedLabel = lastSavedAt
    ? `Auto-saved at ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : null;

  const handleNameBlur = (e) => {
    const val = e.target.value.trim();
    if (!val) {
      e.target.value = workflowName;
    } else {
      setWorkflowName(val);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="tb-back" onClick={onBack}>
          <svg viewBox="0 0 11 11" fill="none">
            <path d="M7 2L4 5.5 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All workflows
        </button>
        <div className="tb-divider"/>
        <input
          className="tb-wf-name"
          key={workflowName}
          defaultValue={workflowName}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
        />
      </div>

      <div className="tb-actions">
        <div className="tb-divider" />

        <button className="tb-action-btn" onClick={onTest}>
          <svg viewBox="0 0 13 13" fill="none">
            <polygon points="3,2 11,6.5 3,11" fill="currentColor"/>
          </svg>
          Test
        </button>
        <button className="tb-action-btn" onClick={onIntegrate}>
          <svg viewBox="0 0 13 13" fill="none">
            <path d="M5.5 4.5L2 6.5l3.5 2M7.5 4.5L11 6.5l-3.5 2M9 3l-5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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
