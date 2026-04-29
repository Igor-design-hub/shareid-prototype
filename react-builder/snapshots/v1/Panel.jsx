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
    <button
      className={`opt${isOn ? ' on' : ''}`}
      onClick={() => onPick(item)}
    >
      <div className="ri"><i /></div>
      <div className="opt-icon-placeholder" />
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
  const pipeline   = useStore((s) => s.pipeline);
  const mod        = MODS.doc;
  const currentPath = step.path ?? mod.defaultPath;
  const pathDef    = mod.paths[currentPath];
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

  const pickPath = useCallback((path) =>
    updateStep(step.id, { path, config: null, fb: null, secOpts: {} }), [step.id, updateStep]);

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
        <div className="p-section">
          <div className="p-section-title">Document role</div>
          <div className="p-section-card">
            <div className="role-toggle">
              {[
                { key: 'fallback',   l: 'Backup' },
                { key: 'secondary',  l: 'Required alongside' },
              ].map((r) => (
                <button
                  key={r.key}
                  className={`role-btn${step.docRole === r.key ? ' on' : ''}`}
                  onClick={() => pickRole(r.key)}
                >
                  {r.l}
                </button>
              ))}
            </div>
          </div>
          {step.docRole && (
            <div className="role-desc">
              {step.docRole === 'fallback'
                ? 'Used if the primary document fails or is unsupported.'
                : 'Both documents are always required from the user.'}
            </div>
          )}
        </div>
      )}

      {/* Document type toggle + presets — one grouped card */}
      <div className="doc-group">
        <div className="doc-group-toggle">
          {Object.keys(mod.paths).map((p) => (
            <button
              key={p}
              className={`doc-group-tab${currentPath === p ? ' on' : ''}`}
              onClick={() => pickPath(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="doc-group-presets">
          {pathDef.presets.map((pg, gi) => (
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
          ? 'Select a document type first'
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
      <PSection title="Credentials to issue">
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
      </PSection>
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
      <PSection title="Options">
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
      </PSection>
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
  const getActiveStep = useStore((s) => s.getActiveStep);
  const pipeline      = useStore((s) => s.pipeline);
  const activeId      = useStore((s) => s.activeId);   // triggers re-render on selection
  const removeStep    = useStore((s) => s.removeStep);
  const setActive     = useStore((s) => s.setActive);

  const step = getActiveStep();
  if (!step) return null;

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
    <div className="panel-zone open">
      <div className="panel open">

        {/* ── Header ── */}
        <div className="panel-hd">
          <div className="panel-hd-info">
            <div className="panel-ico" dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }} />
            <div>
              <div className="panel-name">{mod.name}</div>
              <div className="panel-desc">{mod.desc}</div>
            </div>
          </div>
          <button className="panel-close-btn" onClick={() => setActive(null)} title="Close">
            <svg viewBox="0 0 9 9" fill="none">
              <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
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
