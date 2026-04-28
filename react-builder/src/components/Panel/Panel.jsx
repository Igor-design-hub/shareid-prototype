import { useCallback } from 'react';
import { MODS, Icons, getTok } from '../../data/modules';
import { useStore } from '../../store/useStore';

// ── Section wrapper (gray card with title above) ──────────────────────────────
function PSection({ title, children }) {
  return (
    <div className="p-section">
      {title && <div className="p-section-title">{title}</div>}
      <div className="p-section-card">{children}</div>
    </div>
  );
}

// ── Radio option ──────────────────────────────────────────────────────────────
function Opt({ item, isOn, onPick }) {
  return (
    <button className={`opt${isOn ? ' on' : ''}`} onClick={() => onPick(item)}>
      <div className="ri"><i /></div>
      <div className="opt-body">
        <div className="opt-name">
          {item.l}
          {item.rec && <span className="rec">Rec.</span>}
        </div>
        {item.d && <div className="opt-desc">{item.d}</div>}
      </div>
      {item.t > 0 && <div className="opt-tok">{item.t} tok</div>}
    </button>
  );
}

// ── Doc panel ────────────────────────────────────────────────────────────────
function DocPanel({ step, isSecondDoc }) {
  const updateStep = useStore((s) => s.updateStep);
  const pipeline   = useStore((s) => {
    if (s.obPipeline.find((p) => p.id === step.id)) return s.obPipeline;
    return s.authPipeline;
  });
  const mod        = MODS.doc;
  const currentPath = step.path ?? null;
  const pathDef    = currentPath ? mod.paths[currentPath] : null;
  const coherence  = step.coherence ?? {};

  const toggleSecOpt = useCallback((opt) => {
    const next = { ...(step.secOpts || {}) };
    if (next[opt.key]) delete next[opt.key];
    else next[opt.key] = { t: opt.t, l: opt.l };
    updateStep(step.id, { secOpts: next });
  }, [step.id, step.secOpts, updateStep]);

  const pickConfig = useCallback((item) => {
    const allowedFb = item.fbOpts ?? ['none', 'video', 'photo'];
    const currentFb = step.fb;
    const fbValid = currentFb && allowedFb.includes(currentFb);
    const update = { config: item, fb: fbValid ? currentFb : null };
    // Clear security opts when switching to trusted (PAD/IAD not applicable)
    if (item.v === 'trusted') update.secOpts = {};
    updateStep(step.id, update);
  }, [step.id, step.fb, updateStep]);

  const pickRole = useCallback((role) =>
    updateStep(step.id, { docRole: role }), [step.id, updateStep]);

  const togCoherence = useCallback((key) => {
    const next = { ...coherence };
    if (next[key]) delete next[key]; else next[key] = true;
    updateStep(step.id, { coherence: next });
  }, [step.id, coherence, updateStep]);

  const hasFaceIDV = pipeline.some((s) => s.type === 'face');

  return (
    <div className="panel-body">
      {/* Role selector — second doc only */}
      {isSecondDoc && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className={`doc-path-toggle${!step.docRole ? ' needs-action' : ''}`}>
            {[
              { key: 'fallback',  l: 'Backup' },
              { key: 'secondary', l: 'Required alongside' },
            ].map((r) => (
              <button
                key={r.key}
                className={`doc-path-tab${step.docRole === r.key ? ' on' : ''}`}
                onClick={() => pickRole(r.key)}
              >
                {r.l}
              </button>
            ))}
          </div>
          {step.docRole && (
            <div className="doc-path-desc">
              {step.docRole === 'fallback'
                ? 'Used if the primary document fails or is unsupported.'
                : 'Both documents are always required from the user.'}
            </div>
          )}
        </div>
      )}

      {/* Presets */}
      <div className="doc-group">
        <div className="p-section-title">Verification level</div>
        <div className="doc-group-presets">
          {(pathDef ?? mod.paths[mod.defaultPath]).presets.map((pg, gi) => (
            <div key={gi} className="doc-group-section">
              {pg.group && <div className="doc-group-title">{pg.group}</div>}
              {pg.items.map((item) => (
                <div key={item.v} className="opt-shell">
                  <Opt item={item} isOn={step.config?.v === item.v} onPick={pickConfig} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {currentPath === 'document' && (() => {
        const isTrusted = step.config?.v === 'trusted';
        const noConfig = !step.config;
        const disabled = isTrusted || noConfig;
        const hint = isTrusted
          ? 'Not available with Trusted Source'
          : noConfig
          ? 'Select verification level first'
          : null;
        return (
          <div className={`doc-group${disabled ? ' doc-group-disabled' : ''}`}>
            <div className="doc-group-title">Document security</div>
            <div className="doc-group-section">
              {mod.securityOpts.map((opt) => {
                const isOn = !disabled && !!step.secOpts?.[opt.key];
                return (
                  <button key={opt.key} className={`ext-item${isOn ? ' on' : ''}`}
                    disabled={disabled}
                    onClick={() => !disabled && toggleSecOpt(opt)}>
                    <div className="ext-cb">
                      <svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="ext-item-info">
                      <div className="ext-item-name">{opt.l}</div>
                      <div className="ext-item-desc">{opt.d}</div>
                    </div>
                    <div className="ext-item-tok">{opt.t} tok</div>
                  </button>
                );
              })}
            </div>
            {hint && <div className="doc-group-hint">{hint}</div>}
          </div>
        );
      })()}
    </div>
  );
}

// ── Face panel ───────────────────────────────────────────────────────────────
function FacePanel({ step }) {
  const updateStep = useStore((s) => s.updateStep);
  const mod = MODS.face;
  return (
    <div className="panel-body">
      {mod.presets.map((pg, gi) => (
        <PSection key={gi} title={pg.group}>
          {pg.items.map((item) => (
            <Opt
              key={item.v}
              item={item}
              isOn={step.config?.v === item.v}
              onPick={(item) => updateStep(step.id, { config: item })}
             
            />
          ))}
        </PSection>
      ))}
    </div>
  );
}

// ── Issuance panel ───────────────────────────────────────────────────────────
function ExtPanel({ step }) {
  const updateStep = useStore((s) => s.updateStep);
  const mod = MODS.ext;

  const toggle = useCallback((chip) => {
    const addons = { ...step.addons };
    if (addons[chip.key]) delete addons[chip.key];
    else addons[chip.key] = { t: chip.t, l: chip.l };
    updateStep(step.id, { addons });
  }, [step.id, step.addons, updateStep]);

  return (
    <div className="panel-body">
      <div className="doc-group">
        <div className="doc-group-title">Credentials to issue</div>
        <div className="doc-group-section">
          {mod.chips.map((chip) => {
            const isOn = !!step.addons?.[chip.key];
            return (
              <button key={chip.key} className={`ext-item${isOn ? ' on' : ''}`} onClick={() => toggle(chip)}>
                <div className="ext-cb">
                  <svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="ext-item-info">
                  <div className="ext-item-name">{chip.l}</div>
                </div>
                <div className="ext-item-tok">{chip.t} tok</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Integration panel ────────────────────────────────────────────────────────
function IntPanel({ step }) {
  const updateStep = useStore((s) => s.updateStep);
  const mod = MODS.int;

  const toggle = useCallback((key) => {
    const intOpts = { ...step.intOpts };
    if (intOpts[key]) delete intOpts[key];
    else intOpts[key] = true;
    updateStep(step.id, { intOpts });
  }, [step.id, step.intOpts, updateStep]);

  return (
    <div className="panel-body">
      <div className="doc-group">
        <div className="doc-group-title">Options</div>
        <div className="doc-group-section">
          {mod.options.map((opt) => {
            const isOn = !!step.intOpts?.[opt.key];
            return (
              <button key={opt.key} className={`ext-item${isOn ? ' on' : ''}`} onClick={() => toggle(opt.key)}>
                <div className="ext-cb">
                  <svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="ext-item-info">
                  <div className="ext-item-name">{opt.l}</div>
                  <div className="ext-item-desc">{opt.d}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Auth panel ───────────────────────────────────────────────────────────────
function AuthPanel({ step }) {
  const updateStep = useStore((s) => s.updateStep);
  const mod = MODS.auth;
  return (
    <div className="panel-body">
      {mod.presets.map((pg, gi) => (
        <PSection key={gi} title={pg.group}>
          {pg.items.map((item) => (
            <Opt
              key={item.v}
              item={item}
              isOn={step.config?.v === item.v}
              onPick={(item) => updateStep(step.id, { config: item })}
             
            />
          ))}
        </PSection>
      ))}
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────
export default function Panel() {
  const getActiveStep     = useStore((s) => s.getActiveStep);
  const getActivePipeline = useStore((s) => s.getActivePipeline);
  const activeId          = useStore((s) => s.activeId);
  const removeStep        = useStore((s) => s.removeStep);
  const setActive         = useStore((s) => s.setActive);
  // Subscribe to pipeline data so Panel re-renders when steps are updated
  useStore((s) => s.obPipeline);
  useStore((s) => s.authPipeline);

  const pipeline = getActivePipeline();
  const step = getActiveStep();

  if (!step) return (
    <div className="panel-zone">
      <div className="panel panel-empty-state">
        <div className="panel-empty">
          <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
            <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 11h12M10 16h12M10 21h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Select a module to configure it</span>
        </div>
      </div>
    </div>
  );

  const mod        = MODS[step.type];
  const docSteps   = pipeline.filter((s) => s.type === 'doc');
  const isSecondDoc = step.type === 'doc' && docSteps.length > 1 && docSteps.indexOf(step) > 0;
  const baseDone   = step.config || Object.keys(step.addons || {}).length > 0 || Object.keys(step.intOpts || {}).length > 0;
  const done       = isSecondDoc ? (baseDone && !!step.docRole) : baseDone;

  const handleRemove = () => { removeStep(step.id); setActive(null); };

  const renderBody = () => {
    switch (step.type) {
      case 'doc':  return <DocPanel step={step} isSecondDoc={isSecondDoc} />;
      case 'face': return <FacePanel step={step} />;
      case 'ext':  return <ExtPanel step={step} />;
      case 'int':  return <IntPanel step={step} />;
      case 'auth': return <AuthPanel step={step} />;
      default: return null;
    }
  };

  return (
    <div className="panel-zone">
      <div className="panel">

        {/* ── Close btn — on the left border of the panel ── */}
        <button className="panel-close-btn" onClick={() => setActive(null)} title="Close">
          <svg viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Header ── */}
        <div className="panel-hd">
          <div className="panel-hd-info">
            <div className="panel-ico" dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }} />
            <div className="panel-hd-text">
              <div className="panel-name">{mod.name}</div>
              <div className="panel-desc">{mod.desc}</div>
            </div>
          </div>
          {done ? (
            <div className="panel-status panel-status--done">
              <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Configured
            </div>
          ) : (
            <div className="panel-status panel-status--pending">
              Add configuration
            </div>
          )}
        </div>

        {renderBody()}

        {/* ── Footer ── */}
        <div className="panel-foot">
          <button className="panel-rm-btn" onClick={handleRemove}>
            <svg viewBox="0 0 11 11" fill="none">
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Remove module
          </button>
        </div>

      </div>
    </div>
  );
}
