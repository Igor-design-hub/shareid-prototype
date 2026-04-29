import { useStore } from '../../store/useStore';

const Check = ({ done, warn }) => {
  if (done) return (
    <svg viewBox="0 0 16 16" fill="none" width="20" height="20">
      <rect x="1" y="1" width="14" height="14" rx="4" fill="#3253d1" fillOpacity=".12"/>
      <path d="M5 8l2.5 2.5L11 5.5" stroke="#3253d1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (warn) return (
    <svg viewBox="0 0 16 16" fill="none" width="20" height="20">
      <rect x="1" y="1" width="14" height="14" rx="4" fill="#f97316" fillOpacity=".12"/>
      <path d="M8 5v3.5" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="8" cy="11" r=".8" fill="#f97316"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 16 16" fill="none" width="20" height="20">
      <rect x="1" y="1" width="14" height="14" rx="4" stroke="var(--brd)" strokeWidth="1.4"/>
    </svg>
  );
};

function scrollToHighlight() {
  requestAnimationFrame(() => {
    const el = document.querySelector('.canvas-highlight, .canvas-highlight-auth');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

export default function Checklist() {
  const obPipeline   = useStore((s) => s.obPipeline);
  const authPipeline = useStore((s) => s.authPipeline);
  const setActive          = useStore((s) => s.setActive);
  const setCanvasHighlight = useStore((s) => s.setCanvasHighlight);

  const docSteps  = obPipeline.filter((s) => s.type === 'doc');
  const faceStep  = obPipeline.find((s) => s.type === 'face');
  const authStep  = authPipeline[0] ?? null;

  const docDone   = docSteps.length > 0 && docSteps.every((s) => !!s.config);
  const faceDone  = !!faceStep;
  const authDone  = !!authStep?.config;

  const unconfigured = obPipeline.filter((s) => {
    if (s.type === 'ext') return Object.keys(s.addons || {}).length === 0;
    if (s.type === 'int') return Object.keys(s.intOpts || {}).length === 0;
    return !s.config;
  });
  const allConfigured = obPipeline.length > 0 && unconfigured.length === 0;

  const items = [
    {
      label: 'Add Identity document',
      sub: docDone
        ? docSteps.map(s => s.config?.l).join(', ')
        : docSteps.length > 0
          ? 'Document added — open to configure'
          : 'Add an identity document to your flow',
      done: docDone,
      warn: !docDone && docSteps.length > 0,
      onClick: docDone ? null : docSteps[0] ? () => { setActive(docSteps[0].id); setCanvasHighlight(docSteps[0].id); scrollToHighlight(); } : () => { setCanvasHighlight('ob-add'); scrollToHighlight(); },
    },
    {
      label: 'Set up Authentication',
      sub: authDone
        ? authStep.config.l
        : authStep
          ? 'Auth added — open to configure'
          : 'Choose how returning users log in',
      done: authDone,
      warn: !authDone && authStep !== null,
      onClick: authDone ? null : authStep ? () => { setActive(authStep.id); setCanvasHighlight(authStep.id); scrollToHighlight(); } : () => { setCanvasHighlight('auth-add'); scrollToHighlight(); },
    },
    {
      label: 'Configure all modules',
      sub: allConfigured
        ? 'All modules are configured'
        : unconfigured.length > 0
          ? `${unconfigured.length} module${unconfigured.length > 1 ? 's' : ''} need configuration`
          : 'Add modules to your flow first',
      done: allConfigured,
      warn: unconfigured.length > 0,
      onClick: allConfigured ? null : unconfigured[0] ? () => { setActive(unconfigured[0].id); setCanvasHighlight(unconfigured[0].id); scrollToHighlight(); } : null,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;

  return (
    <div className="checklist-zone">
      <div className="checklist-hd">
        <div className="checklist-title">Setup checklist</div>
        <div className={`checklist-progress${allDone ? ' done' : ''}`}>
          {completedCount}/{items.length}
        </div>
      </div>

      <div className="checklist-bar-wrap">
        <div className="checklist-bar">
          <div
            className="checklist-bar-fill"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="checklist-list">
        {items.map((item) => (
          <button
            key={item.label}
            className={`checklist-item${item.done ? ' done' : ''}${item.onClick ? ' clickable' : ''}`}
            onClick={item.onClick || undefined}
            disabled={!item.onClick}
          >
            <span className="checklist-ico">
              <Check done={item.done} warn={item.warn} />
            </span>
            <span className="checklist-body">
              <span className="checklist-label">{item.label}</span>
              <span className="checklist-sub">{item.sub}</span>
            </span>
            {item.onClick && !item.done && (
              <svg viewBox="0 0 8 12" fill="none" width="7" height="11" className="checklist-arr">
                <path d="M1.5 1.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      {allDone && (
        <div className="checklist-done-msg">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
            <circle cx="8" cy="8" r="7" fill="var(--blue)" fillOpacity=".15"/>
            <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--blue)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Your flow is ready to test
        </div>
      )}
    </div>
  );
}
