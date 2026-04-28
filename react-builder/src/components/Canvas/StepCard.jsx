import { memo, useCallback } from 'react';
import { MODS, Icons, getTok, getStepSub } from '../../data/modules';
import { useStore } from '../../store/useStore';

const FB_OPTS = ['none', 'video', 'photo'];
const FB_LABELS = { none: 'None', video: 'Video', photo: 'Photo' };

const COHERENCE_OPTS = [
  { key: 'data_coherence', l: 'Data match' },
  { key: 'face_coherence', l: 'Face match' },
];

const CoreIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
    <rect x="1" y="1" width="4.2" height="4.2" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="6.8" y="1" width="4.2" height="4.2" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1" y="6.8" width="4.2" height="4.2" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M6.8 9.1h4.2M8.9 6.8v4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const AddonIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
    <rect x="1.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.25"/>
    <rect x="6.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.25"/>
    <rect x="1.5" y="6.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.25"/>
    <rect x="6.5" y="6.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.25"/>
  </svg>
);

const GripV = () => (
  <svg viewBox="0 0 4 16" fill="none" width="4" height="16">
    <circle cx="2" cy="3"  r="1.4" fill="currentColor"/>
    <circle cx="2" cy="8"  r="1.4" fill="currentColor"/>
    <circle cx="2" cy="13" r="1.4" fill="currentColor"/>
  </svg>
);

const StepCard = memo(function StepCard({ step, isSecondDoc, index, isDragOver, isFirst, isHighlighted }) {
  const activeId   = useStore((s) => s.activeId);
  const setActive  = useStore((s) => s.setActive);
  const removeStep = useStore((s) => s.removeStep);
  const updateStep = useStore((s) => s.updateStep);
  const getActivePipeline = useStore((s) => s.getActivePipeline);
  const pipeline = useStore((s) => {
    if (s.obPipeline.find((p) => p.id === step.id)) return s.obPipeline;
    if (s.authPipeline.find((p) => p.id === step.id)) return s.authPipeline;
    return s.obPipeline;
  });

  const mod      = MODS[step.type];
  const isActive = activeId === step.id;
  const tok      = getTok(step);
  const sub      = getStepSub(step);
  const isAddon  = step.type === 'ext' || step.type === 'int';
  const isCore   = !isAddon;

  const baseDone = step.config || Object.keys(step.addons || {}).length > 0 || Object.keys(step.intOpts || {}).length > 0;

  // Find the preset item for the current config to get fb support and allowed fbOpts
  const configPresetItem = step.type === 'doc' && step.config ? (() => {
    const docMod = MODS.doc;
    for (const pg of (docMod.paths?.[step.path ?? docMod.defaultPath]?.presets ?? [])) {
      const item = pg.items.find(i => i.v === step.config.v);
      if (item) return item;
    }
    return null;
  })() : null;
  const configSupportsFb = !!configPresetItem?.fb;
  const allowedFbOpts = configPresetItem?.fbOpts ?? ['none', 'video', 'photo'];
  const done     = isSecondDoc ? (baseDone && !!step.docRole) : baseDone;

  // Coherence checks — only for secondary second doc
  const hasFaceIDV = pipeline.some((s) => s.type === 'face');
  const isTrusted  = step.config?.v === 'trusted';
  const showCoherence = isSecondDoc && step.docRole === 'secondary';
  const coherenceOpts = showCoherence ? COHERENCE_OPTS.filter((o) => {
    if (o.key === 'data_coherence' && isTrusted) return false;
    if (o.key === 'face_coherence' && !hasFaceIDV) return false;
    return true;
  }) : [];

  const typeLabel = isSecondDoc
    ? (step.docRole === 'secondary' ? 'Secondary document' : step.docRole === 'fallback' ? 'Fallback document' : 'Backup document')
    : isCore ? 'Core module' : 'Add-on';

  const cardName = mod.name;

  let cls = 'step';
  if (isActive)      cls += ' active';
  if (done)          cls += ' done';
  if (!done)         cls += ' needs-config';
  if (isAddon)       cls += ` ${step.type}-step addon-step`;
  if (isSecondDoc)   cls += ' second-doc';
  if (isDragOver)    cls += ' drag-over';
  if (isHighlighted) cls += ' canvas-highlight';

  const handleClick  = useCallback((e) => { e.stopPropagation(); setActive(step.id); }, [step.id, setActive]);
  const handleRemove = useCallback((e) => { e.stopPropagation(); removeStep(step.id); }, [step.id, removeStep]);

  const toggleCoherence = useCallback((key) => {
    const next = { ...(step.coherence || {}) };
    if (next[key]) delete next[key]; else next[key] = true;
    updateStep(step.id, { coherence: next });
  }, [step.id, step.coherence, updateStep]);

  return (
    <div className={cls} onClick={handleClick} tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}>

      {/* ── Header row ── */}
      <div className="step-header">
        <div className="step-type">
          {isCore ? <CoreIcon /> : <AddonIcon />}
          <span>{typeLabel}</span>
        </div>

        <div className="step-header-right">
          {done ? (
            <span className="step-tok-pill">
              <span className="step-tok-val">{tok}</span>
              <span className="step-tok-lbl">tok</span>
            </span>
          ) : (
            <div className="step-cfg-badge">
              <svg viewBox="0 0 6 6" fill="none" width="5" height="5">
                <circle cx="3" cy="3" r="3" fill="currentColor"/>
              </svg>
              Add configuration
            </div>
          )}
        </div>
      </div>

      {/* ── Inner card ── */}
      <div className="step-inner">
        <div className="step-ico" dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }} />
        <div className="step-info">
          <div className="step-name">
            <span className="step-name-text">{cardName}</span>
          </div>
          {step.type === 'ext' && Object.keys(step.addons || {}).length > 0 && (
            <div className="step-chips">
              {Object.values(step.addons).map((a) => (
                <span key={a.l} className="step-chip">{a.l}</span>
              ))}
            </div>
          )}
          {step.type === 'int' && Object.keys(step.intOpts || {}).length > 0 && (
            <div className="step-chips">
              {MODS.int.options.filter((o) => step.intOpts?.[o.key]).map((o) => (
                <span key={o.key} className="step-chip">{o.l}</span>
              ))}
            </div>
          )}
          {step.type !== 'ext' && step.type !== 'int' && (done || step.type === 'doc') && sub && (
            <div className="step-sub">{sub}</div>
          )}
        </div>
      </div>


      {/* ── Fallback branch (NFC fails → Video/Photo) ── */}
      {configSupportsFb && (
        <div className="step-fb-block">
          <div className="step-fb-label">
            If NFC fails
            <span className="step-info-tip" data-tip="Fallback verification method used if the NFC chip cannot be read">
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="4.5" r=".6" fill="currentColor"/></svg>
            </span>
          </div>
          <div className="step-fb-inline" onClick={(e) => e.stopPropagation()}>
            <div className="opt-fb-seg" style={{ flex: 1 }}>
              {allowedFbOpts.map((o) => {
                const isOn = o === 'none' ? (!step.fb || step.fb === 'none') : step.fb === o;
                return (
                  <button key={o} className={`opt-fb-seg-btn${isOn ? ' on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); updateStep(step.id, { fb: o === 'none' ? null : o }); }}>
                    {FB_LABELS[o]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Coherence checks (inline, secondary doc only) ── */}
      {showCoherence && coherenceOpts.length > 0 && (
        <div className="step-coherence-block" onClick={(e) => e.stopPropagation()}>
          <div className="step-fb-label">
            Coherence checks
            <span className="step-info-tip" data-tip="Cross-check extracted data and face match between both documents">
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="4.5" r=".6" fill="currentColor"/></svg>
            </span>
          </div>
          <div className="step-coherence-chips">
            {coherenceOpts.map((o) => {
              const isOn = !!step.coherence?.[o.key];
              return (
                <button
                  key={o.key}
                  className={`step-coherence-chip${isOn ? ' on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleCoherence(o.key); }}
                >
                  <span className="step-coherence-sw" />
                  {o.l}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Remove button ── */}
      <button className="step-rm" onClick={handleRemove} title="Remove step">
        <svg viewBox="0 0 8 8" fill="none">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
});

export default StepCard;
