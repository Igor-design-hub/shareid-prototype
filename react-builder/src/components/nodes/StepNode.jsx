import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MODS, Icons, getTok, getStepSub } from '../../data/modules';
import { useStore } from '../../store/useStore';
import './StepNode.css';

function StepNode({ id, data }) {
  const { step, isSecondDoc } = data;
  const activeId = useStore((s) => s.activeId);
  const setActive = useStore((s) => s.setActive);
  const removeStep = useStore((s) => s.removeStep);
  const addBackupDoc = useStore((s) => s.addBackupDoc);
  const pipeline = useStore((s) => s.pipeline);

  const mod = MODS[step.type];
  const isActive = activeId === step.id;
  const tok = getTok(step);
  const sub = getStepSub(step);

  const docSteps = pipeline.filter((s) => s.type === 'doc');
  const hasSecondDoc = docSteps.length > 1;
  const isFirstDoc = step.type === 'doc' && docSteps[0]?.id === step.id;

  // Determine card label & role badge for second doc
  let cardName = mod.name;
  let roleBadge = null;
  if (isSecondDoc && step.docRole) {
    cardName = step.docRole === 'secondary' ? 'Second document' : 'Backup document';
    const lbl = step.docRole === 'secondary' ? 'Secondary' : 'Fallback';
    const cls = step.docRole === 'secondary' ? 'secondary' : 'fallback';
    roleBadge = <span className={`doc-role-badge ${cls}`}>{lbl}</span>;
  } else if (isSecondDoc) {
    cardName = 'Backup document';
    roleBadge = <span className="doc-role-badge unset">Role?</span>;
  }

  // "done" check
  const baseDone =
    step.config ||
    Object.keys(step.addons ?? {}).length > 0 ||
    Object.keys(step.intOpts ?? {}).length > 0;
  const done = isSecondDoc ? baseDone && !!step.docRole : baseDone;

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      setActive(step.id);
    },
    [step.id, setActive]
  );

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      removeStep(step.id);
    },
    [step.id, removeStep]
  );

  const handleAddBackup = useCallback(
    (e) => {
      e.stopPropagation();
      addBackupDoc();
    },
    [addBackupDoc]
  );

  return (
    <div className="step-node-wrapper">
      {/* Main card */}
      <div
        className={`step-node ${isActive ? 'active' : ''} ${done ? 'done' : ''} ${isSecondDoc ? 'second-doc' : ''}`}
        onClick={handleClick}
      >
        <Handle type="target" position={Position.Left} className="rf-handle" />

        <div className="step-node__header">
          <span
            className="step-node__icon"
            dangerouslySetInnerHTML={{ __html: Icons[mod.iconKey] }}
          />
          <div className="step-node__title">
            <span className="step-node__name">
              {cardName}
              {roleBadge}
            </span>
            <span className="step-node__sub">{sub}</span>
          </div>
          {tok > 0 && <span className="step-node__tok">{tok} tok</span>}
        </div>

        {done && <div className="step-node__done-bar" />}

        <button
          className="step-node__remove"
          onClick={handleRemove}
          title="Remove step"
        >
          ×
        </button>

        <Handle type="source" position={Position.Right} className="rf-handle" />
      </div>

      {/* Add backup doc button — shown below first doc when no second doc */}
      {isFirstDoc && !hasSecondDoc && (
        <div className="add-backup-wrap">
          <div className="add-backup-line" />
          <button className="add-backup-btn" onClick={handleAddBackup}>
            + Add backup document
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(StepNode);
