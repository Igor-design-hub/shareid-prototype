import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../store/useStore';
import { TEMPLATES } from '../../data/modules';

export default function TemplatesPanel() {
  const obPipeline            = useStore((s) => s.obPipeline);
  const savedTemplates        = useStore((s) => s.savedTemplates);
  const applyTemplate         = useStore((s) => s.applyTemplate);
  const saveCurrentAsTemplate = useStore((s) => s.saveCurrentAsTemplate);
  const deleteSavedTemplate   = useStore((s) => s.deleteSavedTemplate);
  const applySavedTemplate    = useStore((s) => s.applySavedTemplate);

  const [open, setOpen]                   = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingName, setSavingName]       = useState('');
  const [savedOk, setSavedOk]            = useState(false);
  const [confirmTpl, setConfirmTpl]      = useState(null);
  const [confirmSaveName, setConfirmSaveName] = useState('');
  const [confirmSaveMode, setConfirmSaveMode] = useState(false);

  const saveInputRef   = useRef(null);
  const confirmNameRef = useRef(null);

  useEffect(() => { if (showSaveModal && saveInputRef.current) saveInputRef.current.focus(); }, [showSaveModal]);
  useEffect(() => { if (confirmSaveMode && confirmNameRef.current) confirmNameRef.current.focus(); }, [confirmSaveMode]);

  const handleApply = (type, tpl) => {
    if (obPipeline.length > 0) {
      setConfirmTpl({ type, tpl });
      setConfirmSaveMode(false);
      setConfirmSaveName('');
    } else {
      doApply(type, tpl);
    }
  };

  const doApply = (type, tpl) => {
    if (type === 'builtin') applyTemplate(tpl.name);
    else applySavedTemplate(tpl);
    setConfirmTpl(null);
  };

  const handleConfirmSaveAndApply = () => {
    const name = confirmSaveName.trim();
    if (!name) return;
    saveCurrentAsTemplate(name);
    doApply(confirmTpl.type, confirmTpl.tpl);
  };

  const handleConfirmSave = () => {
    const name = savingName.trim();
    if (!name) return;
    saveCurrentAsTemplate(name);
    setSavingName('');
    setShowSaveModal(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2000);
  };

  return (
    <div className={`tpl-panel${open ? ' tpl-panel--open' : ''}`}>
      <button className="tpl-panel-toggle" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
          <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
        Templates
        <svg viewBox="0 0 10 6" fill="none" width="9" height="9" className={`tpl-panel-chevron${open ? ' open' : ''}`}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && <>
        <div className="tpl-panel-section">
          <div className="tpl-panel-label">Built-in</div>
          {TEMPLATES.map((tpl) => (
            <button key={tpl.name} className="tpl-panel-item"
              onClick={() => handleApply('builtin', tpl)}
              title={tpl.desc}
            >
              <span className="tpl-panel-item-name">{tpl.name}</span>
            </button>
          ))}
        </div>

        <div className="tpl-panel-section">
          <div className="tpl-panel-label">Saved</div>
          {savedTemplates.length === 0 ? (
            <div className="tpl-panel-empty">No saved templates yet</div>
          ) : savedTemplates.map((entry) => (
            <button key={entry.name} className="tpl-panel-item"
              onClick={() => handleApply('saved', entry)}
            >
              <span className="tpl-panel-item-name">{entry.name}</span>
              <span className="tpl-panel-item-del" role="button" title="Delete"
                onClick={(e) => { e.stopPropagation(); deleteSavedTemplate(entry.name); }}
              >
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        {!confirmTpl && obPipeline.length > 0 && (
          <div className="tpl-panel-footer">
            {savedOk ? (
              <div className="tpl-saved-ok">
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><circle cx="7" cy="7" r="6" fill="#1b9764" fillOpacity=".15"/><path d="M4 7l2 2 4-4" stroke="#1b9764" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Template saved
              </div>
            ) : (
              <button className="tpl-save-btn" onClick={() => { setSavingName(''); setShowSaveModal(true); }}>
                + Save current as template
              </button>
            )}
          </div>
        )}
      </>}

      {/* Confirm overwrite — full-screen modal */}
      {confirmTpl && createPortal(
        <div className="tpl-modal-overlay" onClick={() => setConfirmTpl(null)}>
          <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tpl-modal-title">Replace current flow?</div>
            <div className="tpl-modal-sub">This will replace your current flow. Save it first?</div>
            {confirmSaveMode ? (
              <>
                <input ref={confirmNameRef} className="tpl-modal-input" type="text"
                  placeholder="Template name" value={confirmSaveName}
                  onChange={(e) => setConfirmSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmSaveAndApply();
                    if (e.key === 'Escape') setConfirmSaveMode(false);
                  }}
                />
                <div className="tpl-modal-btns">
                  <button className="tpl-modal-cancel" onClick={() => setConfirmSaveMode(false)}>Back</button>
                  <button className="tpl-modal-save" onClick={handleConfirmSaveAndApply} disabled={!confirmSaveName.trim()}>Save & apply</button>
                </div>
              </>
            ) : (
              <div className="tpl-modal-btns tpl-modal-btns--3">
                <button className="tpl-modal-cancel" onClick={() => setConfirmTpl(null)}>Cancel</button>
                <button className="tpl-modal-skip" onClick={() => doApply(confirmTpl.type, confirmTpl.tpl)}>Replace</button>
                <button className="tpl-modal-save" onClick={() => setConfirmSaveMode(true)}>Save current</button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Save modal — rendered in body via portal */}
      {showSaveModal && createPortal(
        <div className="tpl-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tpl-modal-title">Save as template</div>
            <input
              ref={saveInputRef}
              className="tpl-modal-input"
              type="text"
              placeholder="Template name"
              value={savingName}
              onChange={(e) => setSavingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
                if (e.key === 'Escape') setShowSaveModal(false);
              }}
            />
            <div className="tpl-modal-btns">
              <button className="tpl-modal-cancel" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="tpl-modal-save" onClick={handleConfirmSave} disabled={!savingName.trim()}>Save</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
