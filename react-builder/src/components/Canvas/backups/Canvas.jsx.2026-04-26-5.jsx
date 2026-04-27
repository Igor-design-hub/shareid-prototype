import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { MODS, Icons } from '../../data/modules';
import StepCard from './StepCard';

function Connector({ dashed }) {
  return <div className={`conn${dashed ? ' dashed' : ''}`} />;
}

// Inline role picker — shown instead of immediately adding the card
function BackupRolePicker({ onSelect, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // Close on click outside
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onCancel(); };
    // defer so the opening click doesn't immediately close it
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

// Add backup doc button — inline between Identity and next step
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

export default function Canvas() {
  const pipeline = useStore((s) => s.pipeline);
  const addStep = useStore((s) => s.addStep);
  const addBackupDoc = useStore((s) => s.addBackupDoc);
  const setActive = useStore((s) => s.setActive);
  const zoom = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);
  const canvasRef = useRef(null);
  const [showRolePicker, setShowRolePicker] = useState(false);

  // Zoom toward cursor. transformOrigin is 'top center', so only vertical scroll needs adjustment.
  // clientY: cursor Y in viewport; pass null to zoom toward canvas vertical center.
  const zoomAt = useCallback((clientY, delta) => {
    const el = canvasRef.current;
    if (!el) return;
    const oldZoom = useStore.getState().zoom;
    const newZoom = Math.min(2, Math.max(0.25, Math.round((oldZoom + delta) * 100) / 100));
    if (newZoom === oldZoom) return;

    // Adjust vertical scroll so content under cursor stays fixed
    const rect = el.getBoundingClientRect();
    const cy = clientY != null ? clientY - rect.top : rect.height / 2;
    // content Y under cursor (in unscaled units): (scrollTop + cy) / oldZoom
    const contentY = (el.scrollTop + cy) / oldZoom;
    el.scrollTop = contentY * newZoom - cy;

    setZoom(newZoom);
  }, [setZoom]);

  // Hotkeys: Cmd/Ctrl +/-/0
  useEffect(() => {
    const onKey = (e) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomAt(null, +0.1); }
      else if (e.key === '-') { e.preventDefault(); zoomAt(null, -0.1); }
      else if (e.key === '0') { e.preventDefault(); setZoom(1); }
    };
    // Ctrl+wheel: cursor-centered zoom
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

  const reorderSteps = useStore((s) => s.reorderSteps);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('moduleType');
    if (type) addStep(type);
  }, [addStep]);

  const docSteps = pipeline.filter((s) => s.type === 'doc');
  const hasSecondDoc = docSteps.length > 1;
  const firstDocStep = docSteps[0] ?? null;
  const secondDocStep = docSteps[1] ?? null;

  // All steps render inline — second doc is a regular inline card, NOT a side card
  const mainSteps = pipeline;

  return (
    <>
      <div ref={canvasRef} className="canvas" onDragOver={onDragOver} onDrop={onDrop} onClick={() => setActive(null)}>
        {pipeline.length === 0 ? (
          <div className="canvas-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="10" y="8" width="28" height="32" rx="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M17 18h14M17 24h14M17 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2>Build your workflow</h2>
            <p>Drag modules from the left panel or click to add them</p>
          </div>
        ) : (
          <div className="flow" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform .15s' }}>
            <div className="flow-cap start">
              <span className="flow-cap-ico">
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <path d="M4 3l7 4-7 4V3z" fill="currentColor"/>
                </svg>
              </span>
              Start
            </div>
            <Connector />

            {mainSteps.map((step, idx) => {
              const isFirstDoc = step === firstDocStep;
              const isSecondDoc = step === secondDocStep;
              const isDragOver = dragOverIdx === idx;

              return (
                <div
                  key={step.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes('cardidx')) {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverIdx(idx);
                    }
                  }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => {
                    const fromStr = e.dataTransfer.getData('cardIdx');
                    if (fromStr !== '') {
                      e.preventDefault();
                      e.stopPropagation();
                      const from = parseInt(fromStr);
                      if (!isNaN(from) && from !== idx) reorderSteps(from, idx);
                    }
                    setDragOverIdx(null);
                  }}
                >
                  <StepCard step={step} isSecondDoc={isSecondDoc} index={idx} isDragOver={isDragOver} />

                  {isFirstDoc && !hasSecondDoc ? (
                    <>
                      <Connector />
                      {showRolePicker ? (
                        <BackupRolePicker
                          onSelect={(role) => { setShowRolePicker(false); addBackupDoc(role); }}
                          onCancel={() => setShowRolePicker(false)}
                        />
                      ) : (
                        <AddBackupBtn onOpen={() => setShowRolePicker(true)} />
                      )}
                      <Connector />
                    </>
                  ) : (
                    <Connector />
                  )}
                </div>
              );
            })}

            <div className="flow-cap end">
              <span className="flow-cap-ico">
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
                </svg>
              </span>
              End
            </div>
          </div>
        )}
      </div>
    </>
  );
}
