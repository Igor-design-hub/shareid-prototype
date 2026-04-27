import { useState } from 'react';

const PLATFORMS = [
  { key: 'react',   l: 'React',         type: 'web' },
  { key: 'angular', l: 'Angular',        type: 'web' },
  { key: 'nestjs',  l: 'Nest JS',        type: 'web' },
  { key: 'kotlin',  l: 'Android (Kotlin)', type: 'mobile' },
  { key: 'java',    l: 'Android (Java)', type: 'mobile' },
  { key: 'swift',   l: 'iOS (Swift)',    type: 'mobile' },
  { key: 'flutter', l: 'Flutter',        type: 'mobile' },
  { key: 'rn',      l: 'React Native',   type: 'mobile' },
];

function buildTokenCode(platform) {
  const base = `const SHAREID_API_KEY = 'YOUR_API_KEY';
const SHAREID_HASH   = 'YOUR_BUSINESS_HASH';`;

  if (platform === 'react' || platform === 'angular') {
    return `${base}

// Initialize ShareID
import { ShareID } from '@shareid/web-sdk';

const sdk = new ShareID({
  apiKey: SHAREID_API_KEY,
  businessHash: SHAREID_HASH,
});`;
  }
  if (platform === 'nestjs') {
    return `${base}

// Install: npm install @shareid/node-sdk
import { ShareIDClient } from '@shareid/node-sdk';

const client = new ShareIDClient({
  apiKey: SHAREID_API_KEY,
  businessHash: SHAREID_HASH,
});`;
  }
  if (platform === 'kotlin') {
    return `val SHAREID_API_KEY = "YOUR_API_KEY"
val SHAREID_HASH   = "YOUR_BUSINESS_HASH"

// In build.gradle:
// implementation 'com.shareid:android-sdk:latest'

val sdk = ShareID.Builder(context)
  .apiKey(SHAREID_API_KEY)
  .businessHash(SHAREID_HASH)
  .build()`;
  }
  if (platform === 'java') {
    return `String SHAREID_API_KEY = "YOUR_API_KEY";
String SHAREID_HASH   = "YOUR_BUSINESS_HASH";

// In build.gradle:
// implementation 'com.shareid:android-sdk:latest'

ShareID sdk = new ShareID.Builder(context)
  .apiKey(SHAREID_API_KEY)
  .businessHash(SHAREID_HASH)
  .build();`;
  }
  if (platform === 'swift') {
    return `let SHAREID_API_KEY = "YOUR_API_KEY"
let SHAREID_HASH   = "YOUR_BUSINESS_HASH"

// In Podfile:
// pod 'ShareIDSDK'

let sdk = ShareID(
  apiKey: SHAREID_API_KEY,
  businessHash: SHAREID_HASH
)`;
  }
  if (platform === 'flutter') {
    return `const SHAREID_API_KEY = 'YOUR_API_KEY';
const SHAREID_HASH   = 'YOUR_BUSINESS_HASH';

// In pubspec.yaml:
// shareid_flutter_sdk: ^latest

final sdk = ShareID(
  apiKey: SHAREID_API_KEY,
  businessHash: SHAREID_HASH,
);`;
  }
  if (platform === 'rn') {
    return `const SHAREID_API_KEY = 'YOUR_API_KEY';
const SHAREID_HASH   = 'YOUR_BUSINESS_HASH';

// Install: npm install @shareid/react-native-sdk

import ShareID from '@shareid/react-native-sdk';

const sdk = new ShareID({
  apiKey: SHAREID_API_KEY,
  businessHash: SHAREID_HASH,
});`;
  }
  return base;
}

function buildFlowCode(platform, ob, auth) {
  const obSteps = (ob || []).map((s) => {
    if (s.type === 'doc' && s.config) return `  idv_level: '${s.config.v}'`;
    if (s.type === 'face' && s.config) return `  face_idv: '${s.config.v}'`;
    if (s.type === 'ext') return `  issuance: true`;
    return null;
  }).filter(Boolean);

  const authSteps = (auth || []).map((s) => {
    if (s.type === 'auth' && s.config) return `  auth_method: '${s.config.v}'`;
    return null;
  }).filter(Boolean);

  const allSteps = [...obSteps, ...authSteps];

  if (platform === 'react' || platform === 'angular' || platform === 'nestjs' || platform === 'rn') {
    return `sdk.startFlow({
${allSteps.length ? allSteps.join(',\n') : '  // no modules configured yet'}
  callback: 'https://yourdomain.com/shareid/callback',
});`;
  }
  if (platform === 'kotlin') {
    return `sdk.startFlow(
  ShareIDFlow.Builder()${allSteps.length ? '\n    ' + allSteps.map(s => `.option(${s.trim()})`).join('\n    ') : ''}
    .callback("https://yourdomain.com/shareid/callback")
    .build()
)`;
  }
  if (platform === 'swift') {
    return `sdk.startFlow(
  ShareIDFlow(
    callback: "https://yourdomain.com/shareid/callback"
  )
)`;
  }
  return `sdk.startFlow(callback: "https://yourdomain.com/shareid/callback");`;
}

export default function IntegrateModal({ data, onClose }) {
  const [platform, setPlatform] = useState('react');
  const [copied, setCopied] = useState(null);

  if (!data) return null;

  const tokenCode    = buildTokenCode(platform);
  const flowCode     = buildFlowCode(platform, data.ob, data.auth);
  const webPlatforms = PLATFORMS.filter((p) => p.type === 'web');
  const mobPlatforms = PLATFORMS.filter((p) => p.type === 'mobile');

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <div className="modal-title">Integrate your flow</div>
            <div className="modal-sub">{data.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Platform picker */}
        <div className="modal-plat-wrap">
          <div className="modal-plat-group">
            <div className="modal-plat-label">Web</div>
            <div className="modal-plat-row">
              {webPlatforms.map((p) => (
                <button key={p.key} className={`modal-plat-btn${platform === p.key ? ' on' : ''}`} onClick={() => setPlatform(p.key)}>{p.l}</button>
              ))}
            </div>
          </div>
          <div className="modal-plat-group">
            <div className="modal-plat-label">Mobile</div>
            <div className="modal-plat-row">
              {mobPlatforms.map((p) => (
                <button key={p.key} className={`modal-plat-btn${platform === p.key ? ' on' : ''}`} onClick={() => setPlatform(p.key)}>{p.l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Code blocks */}
        <div className="modal-section">
          <div className="modal-code-hd">
            <div className="modal-section-title">API credentials</div>
            <button className="modal-copy-btn" onClick={() => copy(tokenCode, 'token')}>{copied === 'token' ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="modal-code-block">{tokenCode}</pre>
        </div>

        <div className="modal-section">
          <div className="modal-code-hd">
            <div className="modal-section-title">Start your flow</div>
            <button className="modal-copy-btn" onClick={() => copy(flowCode, 'flow')}>{copied === 'flow' ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="modal-code-block">{flowCode}</pre>
        </div>
      </div>
    </div>
  );
}
