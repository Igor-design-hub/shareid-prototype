import { useStore } from '../../store/useStore';

export default function BottomBar() {
  const zoom    = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);
  const undo    = useStore((s) => s.undo);
  const redo    = useStore((s) => s.redo);
  const past    = useStore((s) => s.past);
  const future  = useStore((s) => s.future);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="bottom-toolbar">
      <button className={`bt-btn${canUndo ? '' : ' disabled'}`} onClick={undo} title="Undo (⌘Z)" disabled={!canUndo}>
        <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
          <path d="M3.5 6.5H9a4 4 0 010 8H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 3L1 6.5l2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className={`bt-btn${canRedo ? '' : ' disabled'}`} onClick={redo} title="Redo (⌘⇧Z)" disabled={!canRedo}>
        <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
          <path d="M12.5 6.5H7a4 4 0 000 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.5 3L15 6.5 12.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="bt-sep" />

      <button className="bt-btn" onClick={() => setZoom(zoom - 0.1)} title="Zoom out">
        <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M4 6h4M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
      <button className="bt-zoom-pct" onClick={() => setZoom(1)} title="Reset zoom">
        {zoomPct}%
      </button>
      <button className="bt-btn" onClick={() => setZoom(zoom + 0.1)} title="Zoom in">
        <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6 4v4M4 6h4M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
