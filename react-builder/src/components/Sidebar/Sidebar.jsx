import { useCallback, useState } from 'react';
import { MODS, Icons } from '../../data/modules';
import { useStore } from '../../store/useStore';
import TemplatesPanel from '../TemplatesPanel/TemplatesPanel';

const setDragHint = (v) => useStore.getState().setDragHint(v);

function Tile({ iconHtml, name, added, active, disabled, draggable, onClick, onDragStart, onDragEnd, fullWidth }) {
  let cls = 'sb-tile';
  if (active || added) cls += ' sb-added';
  if (disabled)        cls += ' used';
  if (fullWidth)       cls += ' sb-tile-full';
  return (
    <button className={cls} draggable={draggable} onClick={onClick} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {added && (
        <span className="sb-tile-check">
          <svg viewBox="0 0 8 8" fill="none" width="15" height="15">
            <path d="M1.5 4l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      <span className="sb-tile-ico" dangerouslySetInnerHTML={{ __html: iconHtml }} />
      <span className="sb-tile-name">{name}</span>
    </button>
  );
}

export default function Sidebar() {
  const [tab, setTab] = useState('modules');
  const obPipeline   = useStore((s) => s.obPipeline);
  const authPipeline = useStore((s) => s.authPipeline);
  const activeId     = useStore((s) => s.activeId);
  const addStep      = useStore((s) => s.addStep);
  const setActive    = useStore((s) => s.setActive);

  const docSteps    = obPipeline.filter((s) => s.type === 'doc');
  const docStep     = docSteps[0] ?? null;
  const authStep    = authPipeline[0] ?? null;
  const usedObTypes = new Set(obPipeline.map((s) => s.type));

  // ── Identity card ────────────────────────────────────────────────────────
  const handleDocClick = useCallback((path) => {
    if (docStep) { setActive(docStep.id); return; }
    addStep('doc', 'ob', { path });
  }, [docStep, addStep, setActive]);

  const renderIdentityCard = () => {
    const chosenPath = docStep?.path ?? null;
    return (
      <>
        <div className="sb-identity-card">
          <div className="sb-identity-card-row">
            {[{ path: 'document', name: 'Document' }, { path: 'wallet', name: 'Wallet' }].map(({ path, name }) => {
              const isChosen = chosenPath === path;
              const isOther  = chosenPath !== null && !isChosen;
              const isActive = isChosen && docStep?.id === activeId;
              return (
                <Tile
                  key={path}
                  iconHtml={Icons.doc}
                  name={name}
                  added={isChosen}
                  active={isActive}
                  disabled={isOther}
                  draggable={!isChosen && !isOther}
                  onClick={!isOther ? () => handleDocClick(path) : undefined}
                  onDragStart={!isChosen && !isOther ? (e) => {
                    e.dataTransfer.setData('moduleType', 'doc');
                    e.dataTransfer.setData('modulePath', path);
                    e.dataTransfer.setData('zone:ob', '');
                    e.dataTransfer.effectAllowed = 'copy';
                    setDragHint('ob');
                  } : undefined}
                  onDragEnd={() => setDragHint(null)}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ── Generic tile ─────────────────────────────────────────────────────────
  const handleClick = useCallback((type) => {
    if (type === 'auth') {
      if (authStep) { setActive(authStep.id); return; }
      addStep('auth', 'auth');
      return;
    }
    const step = obPipeline.find((s) => s.type === type);
    if (step) { setActive(step.id); return; }
    if (usedObTypes.has(type)) return;
    addStep(type, 'ob');
  }, [obPipeline, authStep, addStep, setActive, usedObTypes]);

  const renderTile = (type, { fullWidth = false } = {}) => {
    const mod      = MODS[type];
    const step     = type === 'auth' ? authStep : obPipeline.find((s) => s.type === type);
    const isAdded  = !!step;
    const isActive = step && step.id === activeId;
    const isDisabled = !isAdded && type !== 'auth' && usedObTypes.has(type);
    return (
      <Tile
        key={type}
        iconHtml={Icons[mod.iconKey]}
        name={mod.name}
        added={isAdded}
        active={isActive}
        disabled={isDisabled}
        fullWidth={fullWidth}
        draggable={!isAdded && !isDisabled}
        onClick={!isDisabled ? () => handleClick(type) : undefined}
        onDragStart={!isAdded && !isDisabled ? (e) => {
          e.dataTransfer.setData('moduleType', type);
          e.dataTransfer.setData(type === 'auth' ? 'zone:auth' : 'zone:ob', '');
          e.dataTransfer.effectAllowed = 'copy';
          setDragHint(type === 'auth' ? 'auth' : 'ob');
        } : undefined}
        onDragEnd={() => setDragHint(null)}
      />
    );
  };

  return (
    <aside className="sidebar">
      <div className="sb-tabs">
        <button className={`sb-tab${tab === 'modules' ? ' active' : ''}`} onClick={() => setTab('modules')}>Modules</button>
        <button className={`sb-tab${tab === 'templates' ? ' active' : ''}`} onClick={() => setTab('templates')}>Templates</button>
      </div>

      {tab === 'modules' ? (
        <div className="sb-body">
          <div className="sb-section">
            <div className="sb-section-title">Onboarding</div>
            <div className="sb-grid sb-grid--ob">
              {renderIdentityCard()}
              {renderTile('face')}
            </div>
          </div>

          <div className="sb-divider" />

          <div className="sb-section">
            <div className="sb-section-title">Authentication</div>
            <div className="sb-grid sb-grid--auth">
              {renderTile('auth')}
            </div>
          </div>

          <div className="sb-divider" />

          <div className="sb-section">
            <div className="sb-section-title">Add-ons</div>
            <div className="sb-grid">
              {renderTile('ext')}
              {renderTile('int')}
            </div>
          </div>
        </div>
      ) : (
        <div className="sb-body">
          <TemplatesPanel />
        </div>
      )}
    </aside>
  );
}
