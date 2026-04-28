// ─── SVG Icons ────────────────────────────────────────────────────────────────
export const Icons = {
  doc: `<svg viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>`,
  face: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 14c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>`,
  ext: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
  int: `<svg viewBox="0 0 16 16" fill="none"><path d="M2 8h3l2-5 2 10 2-5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>`,
  auth: `<svg viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>`,
};

// ─── Module definitions ───────────────────────────────────────────────────────
export const MODS = {
  doc: {
    name: 'Identity',
    desc: 'Verify user identity',
    iconKey: 'doc',
    paths: {
      document: {
        presets: [
          { group: 'Standard', items: [
            { v: 'basic', l: 'Basic', d: 'OCR scan only', t: 1 },
            { v: 'standard', l: 'Standard', d: 'OCR + liveness proofing', t: 2, rec: true },
          ]},
          { group: 'NFC-Enabled', items: [
            { v: 'nfc_basic', l: 'NFC Basic', d: 'Chip reading + OCR', t: 4, fb: true, fbOpts: ['none', 'video', 'photo'] },
            { v: 'nfc_liveness', l: 'NFC + Liveness', d: 'Chip + liveness detection', t: 5, rec: true, fb: true, fbOpts: ['none', 'photo'] },
            { v: 'nfc_passive', l: 'NFC Passive', d: 'Chip reading without liveness', t: 3 },
          ]},
          { group: 'Trusted Source', items: [
            { v: 'trusted', l: 'Trusted Source', d: 'No mandatory document — only face', t: 1 },
          ]},
        ],
      },
      wallet: {
        presets: [
          { group: null, items: [
            { v: 'eudiw', l: 'EUDIW', d: 'EU Digital Identity Wallet', t: 2 },
            { v: 'mdl', l: 'mDL', d: 'Mobile Driver\'s License', t: 1 },
          ]},
        ],
      },
    },
    defaultPath: 'document',
    securityOpts: [
      { key: 'pad', l: 'PAD', d: 'Presentation Attack Detection', t: 1 },
      { key: 'iad', l: 'IAD', d: 'Injection Attack Detection', t: 1 },
    ],
  },
  face: {
    name: 'Face IDV',
    desc: 'Liveness & face matching',
    iconKey: 'face',
    presets: [
      { group: null, items: [
        { v: 'passive', l: 'Passive liveness', d: 'Silent check, no action needed', t: 1, rec: true },
        { v: 'active', l: 'Active liveness', d: 'User performs action', t: 2 },
        { v: 'match', l: 'Face match only', d: 'Match against existing photo', t: 1 },
      ]},
    ],
  },
  ext: {
    name: 'Issuance',
    desc: 'Issue credentials & attestations',
    iconKey: 'ext',
    chips: [
      { key: 'vc_dl', l: 'Driver\'s License VC', t: 1 },
      { key: 'vc_id', l: 'National ID VC', t: 1 },
      { key: 'vc_passport', l: 'Passport VC', t: 1 },
      { key: 'vc_age', l: 'Age attestation', t: 1 },
    ],
  },
  int: {
    name: 'Integration',
    desc: 'Webhook & data options',
    iconKey: 'int',
    options: [
      { key: 'pii', l: 'Return PII data', d: 'Include extracted personal data in webhook' },
      { key: 'images', l: 'Return images', d: 'Include document images in response' },
      { key: 'audit', l: 'Audit log', d: 'Store full audit trail' },
    ],
  },
  auth: {
    name: 'Authentication',
    desc: 'Re-verify returning users',
    iconKey: 'auth',
    presets: [
      { group: null, items: [
        { v: 'mfa_3', l: 'MFA 3.0', d: 'Active liveness auth', t: 1, rec: true },
        { v: 'eudiw_pid', l: 'EUDIW PID', d: 'EU Digital Wallet', t: 2 },
      ]},
    ],
  },
};

// ─── Templates ────────────────────────────────────────────────────────────────
export const TEMPLATES = [
  {
    name: 'elDas Basic',
    desc: 'OCR scan with passive liveness. Quick onboarding with no NFC hardware required.',
    forWho: ['Consumer apps', 'Loyalty programs'],
    pipeline: [
      { type: 'doc', config: { v: 'basic', l: 'Basic', t: 1, d: 'OCR scan only' }, path: 'document', fb: null, addons: {} },
      { type: 'face', config: { v: 'passive', l: 'Passive liveness', t: 1 }, fb: null, addons: {} },
    ],
    auth: [
      { type: 'auth', config: { v: 'mfa_3', l: 'MFA 3.0', t: 1 }, addons: {}, intOpts: {} },
    ],
  },
  {
    name: 'elDas Substantial',
    desc: 'NFC chip reading with active liveness and credential issuance. Meets eIDAS Substantial.',
    forWho: ['Banking', 'E-government', 'Mobility'],
    pipeline: [
      { type: 'doc', config: { v: 'nfc_liveness', l: 'NFC + Liveness', t: 5 }, path: 'document', fb: 'photo', addons: {} },
      { type: 'face', config: { v: 'active', l: 'Active liveness', t: 2 }, fb: null, addons: {} },
      { type: 'ext', config: null, fb: null, addons: { vc_id: { t: 1, l: 'National ID VC' } } },
    ],
    auth: [
      { type: 'auth', config: { v: 'mfa_3', l: 'MFA 3.0', t: 1 }, addons: {}, intOpts: {} },
    ],
  },
  {
    name: 'elDas Advanced',
    desc: 'Full verification stack with VC issuance, PII export and audit trail. Meets eIDAS High.',
    forWho: ['Healthcare', 'Financial services'],
    pipeline: [
      { type: 'doc', config: { v: 'nfc_liveness', l: 'NFC + Liveness', t: 5 }, path: 'document', fb: 'photo', addons: {} },
      { type: 'face', config: { v: 'active', l: 'Active liveness', t: 2 }, fb: null, addons: {} },
      { type: 'ext', config: null, fb: null, addons: { vc_dl: { t: 1, l: "Driver's License VC" }, vc_id: { t: 1, l: 'National ID VC' } } },
      { type: 'int', config: null, fb: null, addons: {}, intOpts: { pii: true, audit: true } },
    ],
    auth: [
      { type: 'auth', config: { v: 'eudiw_pid', l: 'EUDIW PID', t: 2 }, addons: {}, intOpts: {} },
    ],
  },
];

// ─── Illustration map ─────────────────────────────────────────────────────────
const ILLUST_MAP = {
  'doc:basic':          'illustrations/doc/Basic.svg',
  'doc:standard':       'illustrations/doc/Basic+.svg',
  'doc:nfc_basic':      'illustrations/doc/Substantial.svg',
  'doc:nfc_liveness':   'illustrations/doc/Substantial+.svg',
  'doc:nfc_passive':    'illustrations/doc/Substantial.svg',
  'doc:trusted':        'illustrations/Trusted source.svg',
  'doc:eudiw':          'illustrations/EUDIW Attestation verification.svg',
  'doc:mdl':            'illustrations/Governement Digital Identities.svg',
  'doc':                'illustrations/doc/Basic.svg',
  'face:passive':       'illustrations/face/Basic.svg',
  'face:active':        'illustrations/face/Substantial.svg',
  'face:match':         'illustrations/face/Basic.svg',
  'face':               'illustrations/face/Basic.svg',
  'auth:mfa_3':         'illustrations/MFA 3.0.svg',
  'auth:eudiw_pid':     'illustrations/EUDIW Attestation verification.svg',
  'auth':               'illustrations/MFA 3.0.svg',
  'ext':                'illustrations/Extention - General.svg',
};

export function getIllust(type, variant) {
  if (variant && ILLUST_MAP[`${type}:${variant}`]) return ILLUST_MAP[`${type}:${variant}`];
  return ILLUST_MAP[type] || null;
}

// ─── Preset icon map (designed icons from Figma, node 202:4108) ───────────────
const PRESET_ICON_MAP = {
  'doc:basic':        'preset-icons/doc-basic.svg',
  'doc:standard':     'preset-icons/doc-standard.svg',
  'doc:nfc_basic':    'preset-icons/doc-nfc-basic.svg',
  'doc:nfc_liveness': 'preset-icons/doc-nfc-liveness.svg',
  'doc:nfc_passive':  'preset-icons/doc-nfc-passive.svg',
  'doc:advanced':     'preset-icons/doc-advanced.svg',
  'doc:trusted':      'preset-icons/doc-trusted.svg',
  'doc:eudiw':        'preset-icons/wallet-eudiw.svg',
  'doc:mdl':          'preset-icons/wallet-mdl.svg',
  'face:passive':     'preset-icons/face-basic.svg',
  'face:active':      'preset-icons/face-liveness.svg',
  'face:match':       'preset-icons/face-basic.svg',
  'auth:mfa_3':       null,
  'auth:eudiw_pid':   'preset-icons/wallet-eudiw.svg',
};

export function getPresetIcon(type, variant) {
  const key = variant ? `${type}:${variant}` : type;
  return PRESET_ICON_MAP[key] ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getTok(step) {
  if (step.type === 'ext') {
    return Object.values(step.addons || {}).reduce((sum, v) => sum + (v.t || 0), 0);
  }
  const base = step.config?.t || 0;
  if (step.type === 'doc') {
    const secExtra = Object.values(step.secOpts || {}).reduce((sum, v) => sum + (v.t || 0), 0);
    return base + secExtra;
  }
  return base;
}

export function getStepSub(step) {
  if (step.type === 'doc') {
    const pathLabel = step.path === 'wallet' ? 'Wallet' : 'Document';
    if (step.config) return `${pathLabel} · ${step.config.l}`;
    return pathLabel;
  }
  if (step.config) return step.config.l;
  if (step.type === 'ext') {
    const n = Object.keys(step.addons || {}).length;
    return n ? `${n} add-on${n > 1 ? 's' : ''}` : 'No add-ons selected';
  }
  if (step.type === 'int') {
    const n = Object.keys(step.intOpts || {}).length;
    return n ? `${n} option${n > 1 ? 's' : ''} set` : 'Not configured';
  }
  return 'Not configured';
}
