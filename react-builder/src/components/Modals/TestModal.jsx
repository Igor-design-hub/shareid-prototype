import { useState } from 'react';

const DEVICES = [
  { key: 'web',     l: 'Web' },
  { key: 'ios',     l: 'iOS' },
  { key: 'android', l: 'Android' },
];

// Simple QR placeholder — in production replace with a real QR library
function QRPlaceholder({ value }) {
  return (
    <div style={{ width: 160, height: 160, background: '#f4f5f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#9ca1b5', border: '1px solid #dfe1ea' }}>
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="8" y="8" width="8" height="8" fill="currentColor"/>
        <rect x="28" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="32" y="8" width="8" height="8" fill="currentColor"/>
        <rect x="4" y="28" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="8" y="32" width="8" height="8" fill="currentColor"/>
        <path d="M28 28h4v4h-4zM36 28h4v4h-4zM28 36h4v4h-4zM36 36h4v4h-4z" fill="currentColor"/>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 500 }}>QR preview</span>
    </div>
  );
}

export default function TestModal({ data, onClose }) {
  const [device, setDevice] = useState('web');

  if (!data) return null;
  const hasSteps = (data.ob?.length || 0) + (data.auth?.length || 0) > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <div className="modal-title">Test your flow</div>
            <div className="modal-sub">{data.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {!hasSteps ? (
          <div className="modal-empty">
            <svg viewBox="0 0 48 48" fill="none" width="40" height="40"><rect x="8" y="8" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" opacity=".3"/><rect x="26" y="8" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" opacity=".3"/><rect x="8" y="26" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" opacity=".3"/></svg>
            <div>This workflow has no modules yet.</div>
            <div style={{ fontSize: 12, opacity: .7 }}>Open the builder to configure it first.</div>
          </div>
        ) : (
          <>
            {/* Device selector */}
            <div className="modal-seg">
              {DEVICES.map((d) => (
                <button key={d.key} className={`modal-seg-btn${device === d.key ? ' on' : ''}`} onClick={() => setDevice(d.key)}>
                  {d.l}
                </button>
              ))}
            </div>

            {device === 'web' && (
              <div className="modal-section">
                <div className="modal-section-title">Scan to open in browser</div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                  <QRPlaceholder value="https://demo.shareid.com/flow" />
                </div>
                <div className="modal-hint">
                  Or share this link:
                  <div className="modal-copy-row">
                    <code className="modal-code-inline">https://demo.shareid.com/flow?id={data.name?.toLowerCase().replace(/\s+/g, '-')}</code>
                    <button className="modal-copy-btn" onClick={() => navigator.clipboard.writeText('https://demo.shareid.com/flow')}>Copy</button>
                  </div>
                </div>
              </div>
            )}

            {(device === 'ios' || device === 'android') && (
              <div className="modal-section">
                <div className="modal-section-title">Test on {device === 'ios' ? 'iOS' : 'Android'}</div>
                <div className="modal-mobile-steps">
                  <div className="modal-step">
                    <div className="modal-step-n">1</div>
                    <div>
                      <div className="modal-step-title">Download the Pilote app</div>
                      <div className="modal-step-desc">
                        {device === 'ios'
                          ? 'Available on the App Store — search "ShareID Pilote"'
                          : 'Available on the Play Store — search "ShareID Pilote"'}
                      </div>
                    </div>
                  </div>
                  <div className="modal-step">
                    <div className="modal-step-n">2</div>
                    <div>
                      <div className="modal-step-title">Sign in with your professional email</div>
                      <div className="modal-step-desc">Use the email you used to create this account. Your password was sent by text or email.</div>
                    </div>
                  </div>
                  <div className="modal-step">
                    <div className="modal-step-n">3</div>
                    <div>
                      <div className="modal-step-title">Refresh your profile</div>
                      <div className="modal-step-desc">Pull down to refresh — your flow will appear automatically.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
