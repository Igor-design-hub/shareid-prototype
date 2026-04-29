import { useCallback } from 'react';
import { MODS, Icons, TEMPLATES } from '../../data/modules';
import { useStore } from '../../store/useStore';
import { getStepSub } from '../../data/modules';

const CORE = ['doc', 'face'];
const ADDONS = ['ext', 'int'];
// auth shown only in auth mode
const AUTH = ['auth'];

export default function Sidebar() {
  const pipeline = useStore((s) => s.pipeline);
  const mode = useStore((s) => s.mode);
  const activeId = useStore((s) => s.activeId);
  const addStep = useStore((s) => s.addStep);
  const setActive = useStore((s) => s.setActive);
  const applyTemplate = useStore((s) => s.applyTemplate);

  const usedTypes = new Set(pipeline.map((s) => s.type));
  const docCount = pipeline.filter((s) => s.type === 'doc').length;

  const handleClick = useCallback((type) => {
    const step = pipeline.find((s) => s.type === type);
    if (step) {
      setActive(step.id);
    } else {
      if (type === 'doc' && docCount >= 2) return;
      if (type !== 'doc' && usedTypes.has(type)) return;
      addStep(type);
    }
  }, [pipeline, addStep, setActive, usedTypes, docCount]);

  const handleDragStart = useCallback((e, type) => {
    e.dataTransfer.setData('moduleType', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const renderItem = (type) => {
    const mod = MODS[type];
    const docMaxed = type === 'doc' && docCount >= 2;
    const step = pipeline.find((s) => s.type === type);
    const isAdded = !!step;                      // any step in pipeline
    const isActive = step && step.id === activeId;
    const isDisabled = docMaxed && !step;        // doc maxed out, can't add more
    const isConfigured = step && (step.config || Object.keys(step.addons || {}).length > 0 || Object.keys(step.intOpts || {}).length > 0);

    let cls = 'sb-item';
    if (isActive) cls += ' type-active';
    else if (isAdded) cls += ' sb-added';
    if (isDisabled) cls += ' used';

    return (
      <button
        key={type}
        className={cls}
        draggable={!isAdded && !isDisabled}
        onClick={!isDisabled ? () => handleClick(type) : undefined}
        onDragStart={(e) => !isAdded && !isDisabled && handleDragStart(e, type)}
      >
        <span className="sb-ico" dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }} />
        <span className="sb-info">
          <span className="sb-name">{mod.name}</span>
          <span className="sb-desc">{mod.desc}</span>
        </span>
        {isAdded ? (
          <svg viewBox="0 0 10 10" fill="none" width="13" height="13" style={{ flexShrink: 0, color: 'var(--green)' }}>
            <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span className="sb-drag">
            <svg viewBox="0 0 16 10" fill="none" width="16" height="10">
              <circle cx="5" cy="2" r="1.2" fill="currentColor"/><circle cx="11" cy="2" r="1.2" fill="currentColor"/>
              <circle cx="5" cy="5" r="1.2" fill="currentColor"/><circle cx="11" cy="5" r="1.2" fill="currentColor"/>
              <circle cx="5" cy="8" r="1.2" fill="currentColor"/><circle cx="11" cy="8" r="1.2" fill="currentColor"/>
            </svg>
          </span>
        )}
      </button>
    );
  };

  const coreModules = mode === 'auth' ? AUTH : CORE;
  const addonModules = mode === 'auth' ? [] : ADDONS;

  return (
    <aside className="sidebar">
      <div className="sb-hd-row">
        <span className="sb-hd-title">Modules</span>
        <span className="sb-hd-badge">{mode === 'auth' ? 'Auth' : 'Onboarding'}</span>
      </div>

      <div className="sb-list">
        <div className="sb-group">
          <div className="sb-label">Core modules</div>
          {coreModules.map(renderItem)}
        </div>

        {addonModules.length > 0 && (
          <div className="sb-group">
            <div className="sb-label">Add-ons</div>
            {addonModules.map(renderItem)}
          </div>
        )}
      </div>

      {mode !== 'auth' && (
        <>
          <div className="sb-sep"/>
          <div className="sb-templates">
            <div className="sb-tpl-lbl">Templates</div>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                className="sb-tpl-btn"
                onClick={() => applyTemplate(tpl.name)}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
