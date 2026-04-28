import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { MODS, getTok } from '../../data/modules';
import StepCard from './StepCard';

function DragHandle({ onDragStart, onDragEnd }) {
  return (
    <div
      className="step-drag-handle"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 8 14" fill="none" width="8" height="14">
        <circle cx="2" cy="2"  r="1.5" fill="currentColor"/>
        <circle cx="6" cy="2"  r="1.5" fill="currentColor"/>
        <circle cx="2" cy="7"  r="1.5" fill="currentColor"/>
        <circle cx="6" cy="7"  r="1.5" fill="currentColor"/>
        <circle cx="2" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    </div>
  );
}

function Connector({ dashed }) {
  return <div className={`conn${dashed ? ' dashed' : ''}`} />;
}

function AddBtn({ label, onClick }) {
  return (
    <button
      className="add-backup-btn"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {label}
    </button>
  );
}

function ZoneHint({ variant }) {
  const isAuth = variant === 'auth';
  return (
    <div className={`zone-hint${isAuth ? ' zone-hint--auth' : ''}`}>
      <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
        <rect x="1" y="1" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 2"/>
        <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      <span className="zone-hint-text">
        {isAuth ? 'Add authentication\nfrom the left panel' : 'Add a module\nfrom the left panel'}
      </span>
    </div>
  );
}

export default function Canvas() {
  const obPipeline         = useStore((s) => s.obPipeline);
  const authPipeline       = useStore((s) => s.authPipeline);
  const addStep            = useStore((s) => s.addStep);
  const setActive          = useStore((s) => s.setActive);
  const zoom               = useStore((s) => s.zoom);
  const setZoom            = useStore((s) => s.setZoom);
  const canvasHighlight    = useStore((s) => s.canvasHighlight);
  const clearCanvasHighlight = useStore((s) => s.clearCanvasHighlight);
  const dragHint           = useStore((s) => s.dragHint);
  const reorderSteps       = useStore((s) => s.reorderSteps);
  const canvasRef          = useRef(null);
  const [backupPickerOpen, setBackupPickerOpen] = useState(false);
  const [dragZone, setDragZone] = useState(null);
  const [reorderFrom, setReorderFrom] = useState(null);
  const [reorderOver, setReorderOver] = useState(null);
  const [justDroppedId, setJustDroppedId] = useState(null);
  const cardRefs  = useRef({});   // step.id → wrapper DOM el
  const flipState = useRef(null); // { positions: {id: top}, droppedId }
  const dragCountOb   = useRef(0);
  const dragCountAuth = useRef(0);

  const docSteps    = obPipeline.filter((s) => s.type === 'doc');
  const secondDocStep = docSteps[1] ?? null;
  const docCount    = docSteps.length;
  const authStep    = authPipeline[0] ?? null;

  const obTok   = obPipeline.reduce((sum, s) => sum + getTok(s), 0);
  const authTok = authStep ? getTok(authStep) : 0;

  const usedObTypes = new Set(obPipeline.map((s) => s.type));
  // Available types to add in order
  const obAddTypes = ['doc', 'face', 'ext', 'int'].filter((t) => {
    if (t === 'doc') return docCount < 2;
    return !usedObTypes.has(t);
  });

  // FLIP animation after reorder
  useLayoutEffect(() => {
    if (!flipState.current) return;
    const { positions, droppedId } = flipState.current;
    flipState.current = null;

    Object.entries(positions).forEach(([id, oldTop]) => {
      const el = cardRefs.current[id];
      if (!el) return;
      const delta = oldTop - el.getBoundingClientRect().top;
      if (Math.abs(delta) < 2) return;
      el.style.transition = 'none';
      el.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.28s cubic-bezier(0.2,0.9,0.3,1)';
        el.style.transform = '';
        el.addEventListener('transitionend', () => {
          el.style.transform = '';
          el.style.transition = '';
        }, { once: true });
      });
    });

    if (droppedId) {
      setJustDroppedId(droppedId);
      setTimeout(() => setJustDroppedId(null), 400);
    }
  }, [obPipeline]);

  const doReorderDrop = useCallback((from, to) => {
    if (to === from) return;
    const positions = {};
    obPipeline.forEach((step, i) => {
      const el = cardRefs.current[step.id];
      if (el) positions[step.id] = el.getBoundingClientRect().top;
    });
    flipState.current = { positions, droppedId: obPipeline[from]?.id ?? null };
    reorderSteps(from, to, 'ob');
  }, [obPipeline, reorderSteps]);

  // For the add button: skip face (added from sidebar only)
  const nextType     = obAddTypes[0] ?? null;
  const isBackupDoc  = nextType === 'doc' && docCount === 1;
  const addBtnLabel  = !nextType         ? null
    : isBackupDoc                         ? null  // shown inline after doc card
    : nextType === 'doc'                  ? 'Add Identity'
    : nextType === 'face'                 ? null  // sidebar only
    : `Add ${MODS[nextType].name}`;

  const handleAddOb = useCallback(() => {
    if (!nextType) return;
    // For doc, default path is 'document' — user can add Wallet separately from sidebar
    const initialData = nextType === 'doc' ? { path: 'document' } : {};
    addStep(nextType, 'ob', initialData);
  }, [nextType, addStep]);

  const handlePickBackupRole = useCallback((role) => {
    addStep('doc', 'ob', { path: 'document', docRole: role });
    setBackupPickerOpen(false);
  }, [addStep]);

  const handleAddAuth = useCallback(() => {
    addStep('auth', 'auth');
  }, [addStep]);

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

  useEffect(() => {
    if (!canvasHighlight) return;
    const t = setTimeout(() => clearCanvasHighlight(), 1400);
    return () => clearTimeout(t);
  }, [canvasHighlight, clearCanvasHighlight]);

  // Per-zone drag handlers
  const makeZoneHandlers = useCallback((zone) => {
    const counter = zone === 'ob' ? dragCountOb : dragCountAuth;
    return {
      onDragOver: (e) => {
        const allowed = e.dataTransfer.types.includes(`zone:${zone}`);
        if (!allowed) { e.dataTransfer.dropEffect = 'none'; return; }
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      },
      onDragEnter: (e) => {
        const allowed = e.dataTransfer.types.includes(`zone:${zone}`);
        if (!allowed) return;
        e.preventDefault();
        counter.current++;
        setDragZone(zone);
      },
      onDragLeave: () => {
        counter.current--;
        if (counter.current === 0) setDragZone((z) => z === zone ? null : z);
      },
      onDrop: (e) => {
        e.preventDefault();
        counter.current = 0;
        setDragZone(null);
        useStore.getState().setDragHint(null);
        const type = e.dataTransfer.getData('moduleType');
        const path = e.dataTransfer.getData('modulePath') || undefined;
        if (!type) return;
        addStep(type, zone, path ? { path } : {});
      },
    };
  }, [addStep]);

  const obZone   = makeZoneHandlers('ob');
  const authZone = makeZoneHandlers('auth');

  const onDrop = useCallback(() => {}, []); // kept for canvas root (no-op)

  return (
    <div ref={canvasRef} className="canvas" onClick={() => { setActive(null); setBackupPickerOpen(false); }}>
      <div
        className="flow"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform .15s' }}
      >
        {/* ── Onboarding section ── */}
        <div className="flow-section">
          <div
            className={`flow-section-box${dragHint === 'ob' || dragZone === 'ob' ? ' drag-active' : ''}${canvasHighlight === 'ob-add' ? ' canvas-highlight' : ''}`}
            {...obZone}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('reorder')) {
                e.preventDefault();
                e.stopPropagation();
                // find closest gap by querying all card wrappers
                const wraps = e.currentTarget.querySelectorAll('.step-reorder-wrap');
                let gap = obPipeline.length;
                for (let i = 0; i < wraps.length; i++) {
                  const r = wraps[i].getBoundingClientRect();
                  if (e.clientY < r.top + r.height * 0.25) { gap = i; break; }
                }
                setReorderOver(gap);
              } else {
                obZone.onDragOver(e);
              }
            }}
            onDrop={(e) => {
              if (e.dataTransfer.types.includes('reorder')) {
                e.preventDefault();
                e.stopPropagation();
                const from = parseInt(e.dataTransfer.getData('reorder'));
                if (!isNaN(from) && reorderOver !== null) {
                  const to = reorderOver > from ? reorderOver - 1 : reorderOver;
                  doReorderDrop(from, to);
                }
                setReorderFrom(null);
                setReorderOver(null);
              } else {
                obZone.onDrop(e);
              }
            }}
          >
            <div className="flow-section-label">
              <span className="flow-section-pill ob-pill">Onboarding</span>
            </div>
            {obTok > 0 && (
              <div className="zone-tok-badge">
                <span className="zone-tok-val">{obTok}</span>
                <span className="zone-tok-lbl">tok</span>
              </div>
            )}

            {obPipeline.map((step, idx) => {
              const showBackupBtn = step.type === 'doc' && isBackupDoc;
              const isDraggingThis = reorderFrom === idx;
              const isNoOp = reorderFrom === reorderOver || reorderFrom + 1 === reorderOver;
              const showDropLineBefore = reorderFrom !== null && !isNoOp && reorderOver === idx;
              return (
                <React.Fragment key={step.id}>
                  {showDropLineBefore && <div className="step-drop-slot" />}
                  <div
                    className={`step-reorder-wrap${isDraggingThis ? ' is-dragging' : ''}${justDroppedId === step.id ? ' just-landed' : ''}`}
                    ref={el => { cardRefs.current[step.id] = el; }}
                  >
                    <DragHandle
                      onDragStart={(e) => {
                        e.stopPropagation();
                        // use the card element as drag image
                        const cardEl = e.currentTarget.parentElement?.querySelector('.step');
                        if (cardEl) e.dataTransfer.setDragImage(cardEl, cardEl.offsetWidth / 2, 30);
                        e.dataTransfer.setData('reorder', String(idx));
                        e.dataTransfer.effectAllowed = 'move';
                        setTimeout(() => setReorderFrom(idx), 0);
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        setReorderFrom(null);
                        setReorderOver(null);
                      }}
                    />
                    <StepCard
                      step={step}
                      isSecondDoc={step === secondDocStep}
                      index={idx}
                      isDragOver={false}
                      isFirst={idx === 0}
                      isHighlighted={canvasHighlight === step.id}
                    />
                  </div>
                  {showBackupBtn && (
                    <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                      {backupPickerOpen ? (
                        <div className="role-picker" onClick={(e) => e.stopPropagation()}>
                          <div className="role-picker-hd">
                            <span className="role-picker-label">Choose document role</span>
                            <button className="role-picker-close" onClick={() => setBackupPickerOpen(false)}>
                              <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
                                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                          <div className="role-picker-opts">
                            <button className="role-picker-btn secondary" onClick={() => handlePickBackupRole('secondary')}>
                              <span className="role-picker-ico">
                                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                                  <rect x="2" y="2" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                                  <rect x="7.5" y="2" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                                </svg>
                              </span>
                              <span className="role-picker-name">Required alongside</span>
                              <span className="role-picker-desc">Both documents always required</span>
                            </button>
                            <button className="role-picker-btn fallback" onClick={() => handlePickBackupRole('fallback')}>
                              <span className="role-picker-ico">
                                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                                  <path d="M7 2v6M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                              </span>
                              <span className="role-picker-name">Backup</span>
                              <span className="role-picker-desc">Used if primary fails</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <AddBtn
                          label="Add backup document"
                          onClick={() => setBackupPickerOpen(true)}
                        />
                      )}
                    </div>
                  )}
                  {!(idx === obPipeline.length - 1 && !addBtnLabel && !showBackupBtn) &&
                   !(showBackupBtn && idx === obPipeline.length - 1) && <Connector />}
                  {/* Drop line after last card */}
                  {idx === obPipeline.length - 1 && reorderFrom !== null && !isNoOp
                    && reorderOver === obPipeline.length
                    && <div className="step-drop-slot" style={{ marginTop: 8 }} />}
                </React.Fragment>
              );
            })}

            {obPipeline.length === 0 && <ZoneHint />}
            {addBtnLabel && addBtnLabel !== 'Add Identity' && !isBackupDoc && (
              <AddBtn
                label={addBtnLabel}
                onClick={handleAddOb}
              />
            )}
          </div>
        </div>

        {/* ── Section separator ── */}
        <Connector dashed />

        {/* ── Auth section ── */}
        <div className="flow-section" style={{ marginTop: 8 }}>
          <div className={`flow-section-box${dragHint === 'auth' || dragZone === 'auth' ? ' drag-active-auth' : ''}${canvasHighlight === 'auth-add' ? ' canvas-highlight-auth' : ''}`} {...authZone}>
            <div className="flow-section-label">
              <span className="flow-section-pill auth-pill">Authentication</span>
            </div>
            {authTok > 0 && (
              <div className="zone-tok-badge zone-tok-badge--auth">
                <span className="zone-tok-val">{authTok}</span>
                <span className="zone-tok-lbl">tok</span>
              </div>
            )}

            {authStep ? (
              <StepCard
                step={authStep}
                isSecondDoc={false}
                index={0}
                isDragOver={false}
                isHighlighted={canvasHighlight === authStep.id}
              />
            ) : (
              <ZoneHint variant="auth" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
