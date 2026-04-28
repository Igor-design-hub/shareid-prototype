import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { MODS, Icons } from '../../data/modules';
import StepCard from './StepCard';

function Connector({ dashed }) {
  return <div className={`conn${dashed ? ' dashed' : ''}`} />;
}

function AuthMethodPicker({ onSelect, onCancel }) {
  const items = MODS.auth.presets[0].items;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="inline-mod-picker" onClick={(e) => e.stopPropagation()}>
      <div className="inline-mod-picker-hd">
        <span className="inline-mod-picker-label">Choose auth method</span>
        <button className="role-picker-close" onClick={onCancel}>
          <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="inline-mod-picker-items">
        {items.map((item) => (
          <button key={item.v} className="inline-mod-picker-item" onClick={() => onSelect(item)}>
            <span className="inline-mod-picker-ico" dangerouslySetInnerHTML={{ __html: Icons[MODS.auth.iconKey] }} />
            <span className="inline-mod-picker-info">
              <span className="inline-mod-picker-name">
                {item.l}
                {item.rec && <span className="rec" style={{ marginLeft: 6 }}>Rec.</span>}
              </span>
              <span className="inline-mod-picker-desc">{item.d} · {item.t} tok</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function BackupRolePicker({ onSelect, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onCancel(); };
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onClick); };
  }, [onCancel]);
  return (
    <div ref={ref} className="role-picker" onClick={(e) => e.stopPropagation()}>
      <div className="role-picker-hd">
        <span className="role-picker-label">Choose document role</span>
        <button className="role-picker-close" onClick={onCancel}>
          <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="role-picker-opts">
        <button className="role-picker-btn secondary" onClick={() => onSelect('secondary')}>
          <span className="role-picker-ico">
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <rect x="2" y="2" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="7.5" y="2" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </span>
          <span className="role-picker-name">Secondary</span>
          <span className="role-picker-desc">Parallel document</span>
        </button>
        <button className="role-picker-btn fallback" onClick={() => onSelect('fallback')}>
          <span className="role-picker-ico">
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M7 2v6M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="role-picker-name">Fallback</span>
          <span className="role-picker-desc">Used if primary fails</span>
        </button>
      </div>
    </div>
  );
}

const DOC_PATHS = [
  { key: 'document', l: 'Document', d: 'Physical or chip-based ID document' },
  { key: 'wallet',   l: 'Wallet',   d: 'EU Digital Identity Wallet or mDL' },
];

function DocPathPicker({ onSelect, onBack, onCancel }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="inline-mod-picker" onClick={(e) => e.stopPropagation()}>
      <div className="inline-mod-picker-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onBack && (
            <button className="picker-back-btn" onClick={onBack}>
              <svg viewBox="0 0 8 8" fill="none" width="10" height="10">
                <path d="M6 1L2 4l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <span className="inline-mod-picker-label">Choose document type</span>
        </div>
        <button className="role-picker-close" onClick={onCancel}>
          <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="inline-mod-picker-items">
        {DOC_PATHS.map((p) => (
          <button key={p.key} className="inline-mod-picker-item" onClick={() => onSelect(p.key)}>
            <span className="inline-mod-picker-ico">
              {p.key === 'document'
                ? <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><rect x="3" y="1.5" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                : <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M5.5 9h5M8 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              }
            </span>
            <span className="inline-mod-picker-info">
              <span className="inline-mod-picker-name">{p.l}</span>
              <span className="inline-mod-picker-desc">{p.d}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AddBackupBtn({ onOpen }) {
  return (
    <button className="add-backup-btn" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
      <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      Add backup document
    </button>
  );
}

function InlineModulePicker({ types, overrides = {}, onSelect, onCancel, extraItems = [], onExtraSelect }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onCancel(); };
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onClick); };
  }, [onCancel]);
  return (
    <div ref={ref} className="inline-mod-picker" onClick={(e) => e.stopPropagation()}>
      <div className="inline-mod-picker-hd">
        <span className="inline-mod-picker-label">Add module</span>
        <button className="role-picker-close" onClick={onCancel}>
          <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="inline-mod-picker-items">
        {extraItems.map((item) => {
          const mod = MODS[item.type];
          return (
            <button key={item.type} className="inline-mod-picker-item" onClick={onExtraSelect}>
              <span className="inline-mod-picker-ico" dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }} />
              <span className="inline-mod-picker-info">
                <span className="inline-mod-picker-name">{item.name}</span>
                <span className="inline-mod-picker-desc">{item.desc}</span>
              </span>
            </button>
          );
        })}
        {types.map((type) => {
          const mod = MODS[type];
          const ov = overrides[type] || {};
          return (
            <button key={type} className="inline-mod-picker-item" onClick={() => onSelect(type)}>
              <span className="inline-mod-picker-ico" dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }} />
              <span className="inline-mod-picker-info">
                <span className="inline-mod-picker-name">{ov.name ?? mod.name}</span>
                <span className="inline-mod-picker-desc">{ov.desc ?? mod.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddModuleBtn({ onOpen, highlighted, hasDoc }) {
  return (
    <button className={`add-backup-btn${highlighted ? ' canvas-highlight' : ''}`} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
      <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {hasDoc ? 'Add module' : 'Add Identity'}
    </button>
  );
}

export default function Canvas() {
  const obPipeline  = useStore((s) => s.obPipeline);
  const authPipeline = useStore((s) => s.authPipeline);
  const addStep     = useStore((s) => s.addStep);
  const addBackupDoc = useStore((s) => s.addBackupDoc);
  const setActive   = useStore((s) => s.setActive);
  const zoom              = useStore((s) => s.zoom);
  const setZoom           = useStore((s) => s.setZoom);
  const canvasTrigger      = useStore((s) => s.canvasTrigger);
  const clearCanvasTrigger = useStore((s) => s.clearCanvasTrigger);
  const canvasHighlight    = useStore((s) => s.canvasHighlight);
  const clearCanvasHighlight = useStore((s) => s.clearCanvasHighlight);
  const canvasRef         = useRef(null);

  const [showObPicker, setShowObPicker] = useState(false);
  const [showDocPathPicker, setShowDocPathPicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [pendingBackupRole, setPendingBackupRole] = useState(null);

  const addIdentity = useCallback(() => addStep('doc', 'ob', {}), [addStep]);
  const addAuth     = useCallback(() => addStep('auth', 'auth', {}, false), [addStep]);

  const docSteps    = obPipeline.filter((s) => s.type === 'doc');
  const secondDocStep = docSteps[1] ?? null;

  // Available ob modules
  const usedObTypes = new Set(obPipeline.map((s) => s.type));
  const docCount = obPipeline.filter((s) => s.type === 'doc').length;
  const obAddTypes = ['doc', 'face', 'ext', 'int'].filter((t) => {
    if (t === 'doc') return docCount < 2;
    return !usedObTypes.has(t);
  });

  // Auth step
  const authStep = authPipeline[0] ?? null;

  // Zoom
  const zoomAt = useCallback((clientY, delta) => {
    const el = canvasRef.current;
    if (!el) return;
    const oldZoom = useStore.getState().zoom;
    const newZoom = Math.min(2, Math.max(0.25, Math.round((oldZoom + delta) * 100) / 100));
    if (newZoom === oldZoom) return;
    const rect = el.getBoundingClientRect();
    const cy = clientY != null ? clientY - rect.top : rect.height / 2;
    const contentY = (el.scrollTop + cy) / oldZoom;
    el.scrollTop = contentY * newZoom - cy;
    setZoom(newZoom);
  }, [setZoom]);

  useEffect(() => {
    const onKey = (e) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomAt(null, +0.1); }
      else if (e.key === '-') { e.preventDefault(); zoomAt(null, -0.1); }
      else if (e.key === '0') { e.preventDefault(); setZoom(1); }
    };
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomAt(e.clientY, -e.deltaY * 0.002);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
    };
  }, [zoomAt, setZoom]);


  // Auto-clear highlight after animation
  useEffect(() => {
    if (!canvasHighlight) return;
    const t = setTimeout(() => clearCanvasHighlight(), 1400);
    return () => clearTimeout(t);
  }, [canvasHighlight, clearCanvasHighlight]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('moduleType');
    if (type) addStep(type, 'ob');
  }, [addStep]);

  return (
    <div ref={canvasRef} className="canvas" onDragOver={onDragOver} onDrop={onDrop} onClick={() => setActive(null)}>
      <div
        className="flow"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform .15s' }}
      >
        <>
            {/* ── Onboarding section ── */}
            <div className="flow-section">
              <div className="flow-section-box">
                <div className="flow-section-label">
                  <span className="flow-section-pill ob-pill">New user</span>
                </div>

                {obPipeline.map((step, idx) => {
                  const isSecondDoc = step === secondDocStep;
                  const isFirst = idx === 0;
                  return (
                    <div
                      key={step.id}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <StepCard step={step} isSecondDoc={isSecondDoc} index={idx} isDragOver={false} isFirst={isFirst} isHighlighted={canvasHighlight === step.id} />
                      <Connector />
                    </div>
                  );
                })}

                {/* ── Add ob module ── */}
                {obAddTypes.length > 0 && (
                  <>
                    {showDocPathPicker ? (
                      <DocPathPicker
                        onSelect={(path) => {
                          setShowDocPathPicker(false);
                          if (pendingBackupRole) { addBackupDoc(pendingBackupRole, 'ob', { path }); setPendingBackupRole(null); }
                          else addStep('doc', 'ob', { path });
                        }}
                        onBack={pendingBackupRole
                          ? () => { setShowDocPathPicker(false); setShowRolePicker(true); }
                          : () => { setShowDocPathPicker(false); setShowObPicker(true); }}
                        onCancel={() => { setShowDocPathPicker(false); setPendingBackupRole(null); }}
                      />
                    ) : showRolePicker ? (
                      <BackupRolePicker
                        onSelect={(role) => { setShowRolePicker(false); setPendingBackupRole(role); setShowDocPathPicker(true); }}
                        onCancel={() => setShowRolePicker(false)}
                      />
                    ) : showObPicker ? (
                      <InlineModulePicker
                        types={obAddTypes.filter(t => t !== 'doc' || docCount === 0)}
                        overrides={{ doc: { name: 'Identity Document', desc: 'Physical ID, passport or wallet' } }}
                        onSelect={(type) => {
                          if (type === 'doc') { setShowObPicker(false); setShowDocPathPicker(true); }
                          else { setShowObPicker(false); addStep(type, 'ob'); }
                        }}
                        onCancel={() => setShowObPicker(false)}
                        extraItems={docCount >= 1 && docCount < 2 ? [{ type: 'doc', name: 'Add backup document', desc: 'Fallback or required alongside' }] : []}
                        onExtraSelect={() => { setShowObPicker(false); setShowRolePicker(true); }}
                      />
                    ) : (
                      <AddModuleBtn
                        onOpen={() => setShowObPicker(true)}
                        highlighted={canvasHighlight === 'ob-add'}
                        hasDoc={docCount > 0}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── Section separator ── */}
            <Connector dashed />

            {/* ── Auth section ── */}
            <div className="flow-section" style={{ marginTop: 8 }}>
              <div className="flow-section-box">
                <div className="flow-section-label">
                  <span className="flow-section-pill auth-pill">If user returns</span>
                </div>

                {authStep ? (
                  <StepCard step={authStep} isSecondDoc={false} index={0} isDragOver={false} isHighlighted={canvasHighlight === authStep.id} />
                ) : (
                  <button
                    className={`add-backup-btn${canvasHighlight === 'auth-add' ? ' canvas-highlight' : ''}`}
                    onClick={(e) => { e.stopPropagation(); addAuth(); }}
                  >
                    <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Add Authentication
                  </button>
                )}
              </div>
            </div>
        </>
      </div>
    </div>
  );
}

