import { create } from 'zustand';
import { TEMPLATES, getTok } from '../data/modules';

const genId = (type) => `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const uid = () => 'w_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

const readWorkspaces = () => JSON.parse(localStorage.getItem('shareid_workspaces') || '[]');
const writeWorkspaces = (list) => localStorage.setItem('shareid_workspaces', JSON.stringify(list));

const blankStep = (type) => ({
  id: genId(type),
  type,
  config: null,
  fb: null,
  addons: {},
  intOpts: {},
  docRole: null,
  coherence: {},
});

// History snapshot = { ob, auth }
const pushHistory = (past, ob, auth) => [...past.slice(-30), { ob, auth }];

const getPipeline = (state, flow) => flow === 'ob' ? state.obPipeline : state.authPipeline;
const pipelineKey = (flow) => flow === 'ob' ? 'obPipeline' : 'authPipeline';

export const useStore = create((set, get) => ({
  // ── State ───────────────────────────────────────────────────────────────────
  obPipeline: [],
  authPipeline: [],
  activeId: null,
  workflowId: null,
  workflowName: 'Untitled workflow',
  canvasTrigger: null,  // 'ob' | 'auth' | null
  canvasHighlight: null, // stepId | 'ob-add' | 'auth-add' | null
  dragHint: null, // 'ob' | 'auth' | null
  past: [],
  future: [],
  zoom: 1,
  isDirty: false,
  lastSavedAt: null,
  scratchMode: false,
  savedTemplates: JSON.parse(localStorage.getItem('savedTemplates') || '[]'),

  // ── Selectors ───────────────────────────────────────────────────────────────
  getActiveStep: () => {
    const { obPipeline, authPipeline, activeId } = get();
    return [...obPipeline, ...authPipeline].find((s) => s.id === activeId) ?? null;
  },

  getActiveFlow: () => {
    const { obPipeline, authPipeline, activeId } = get();
    if (obPipeline.find((s) => s.id === activeId)) return 'ob';
    if (authPipeline.find((s) => s.id === activeId)) return 'auth';
    return null;
  },

  getActivePipeline: () => {
    const { obPipeline, authPipeline, activeId } = get();
    if (obPipeline.find((s) => s.id === activeId)) return obPipeline;
    if (authPipeline.find((s) => s.id === activeId)) return authPipeline;
    return [];
  },

  totalTokens: (flow) => {
    const state = get();
    const pl = getPipeline(state, flow);
    return pl.reduce((sum, s) => sum + getTok(s), 0);
  },

  isValid: (flow) => {
    const state = get();
    const pipeline = getPipeline(state, flow);
    if (!pipeline.length) return false;
    const docSteps = pipeline.filter((s) => s.type === 'doc');
    return pipeline.every((s) => {
      if (s.type === 'ext') return Object.keys(s.addons ?? {}).length > 0;
      if (s.type === 'int') return true;
      if (s.type === 'doc' && docSteps.length > 1 && docSteps.indexOf(s) > 0) {
        return !!s.config && !!s.docRole;
      }
      return !!s.config;
    });
  },

  // ── Pipeline actions ─────────────────────────────────────────────────────────
  addStep: (type, flow = 'ob', initialData = {}, skipSetActive = false) => {
    const state = get();
    const { past, obPipeline, authPipeline } = state;
    const pipeline = getPipeline(state, flow);
    const key = pipelineKey(flow);

    const docCount = pipeline.filter((s) => s.type === 'doc').length;
    if (type !== 'doc' && pipeline.find((s) => s.type === type)) return;
    if (type === 'doc' && docCount >= 2) return;

    const step = { ...blankStep(type), ...initialData };
    let next;
    if (type === 'doc' && docCount === 1) {
      const firstDocIdx = pipeline.findIndex((s) => s.type === 'doc');
      next = [...pipeline];
      next.splice(firstDocIdx + 1, 0, step);
    } else {
      next = [...pipeline, step];
    }

    set({
      [key]: next,
      activeId: skipSetActive ? state.activeId : step.id,
      past: pushHistory(past, obPipeline, authPipeline),
      future: [],
      isDirty: true,
    });
  },

  addBackupDoc: (role = null, flow = 'ob', initialData = {}) => {
    const state = get();
    const { past, obPipeline, authPipeline } = state;
    const pipeline = getPipeline(state, flow);
    const key = pipelineKey(flow);

    const docSteps = pipeline.filter((s) => s.type === 'doc');
    if (!docSteps.length || docSteps.length >= 2) return;

    const step = { ...blankStep('doc'), docRole: role, ...initialData };
    const firstDocIdx = pipeline.findIndex((s) => s.type === 'doc');
    const next = [...pipeline];
    next.splice(firstDocIdx + 1, 0, step);

    set({
      [key]: next,
      activeId: step.id,
      past: pushHistory(past, obPipeline, authPipeline),
      future: [],
      isDirty: true,
    });
  },

  removeStep: (id) => {
    const { obPipeline, authPipeline, activeId, past } = get();
    const inOb = obPipeline.some((s) => s.id === id);
    const key = inOb ? 'obPipeline' : 'authPipeline';
    const pipeline = inOb ? obPipeline : authPipeline;
    const next = pipeline.filter((s) => s.id !== id);
    set({
      [key]: next,
      activeId: activeId === id ? null : activeId,
      past: pushHistory(past, obPipeline, authPipeline),
      future: [],
      isDirty: true,
    });
  },

  updateStep: (id, patch) => {
    const { obPipeline, authPipeline, past } = get();
    const inOb = obPipeline.some((s) => s.id === id);
    const key = inOb ? 'obPipeline' : 'authPipeline';
    const pipeline = inOb ? obPipeline : authPipeline;
    set({
      [key]: pipeline.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      past: pushHistory(past, obPipeline, authPipeline),
      future: [],
      isDirty: true,
    });
  },

  setActive: (id) => set({ activeId: id }),
  triggerCanvas: (action, highlight) => set({ canvasTrigger: action, activeId: null, canvasHighlight: highlight ?? null }),
  clearCanvasTrigger: () => set({ canvasTrigger: null }),
  setCanvasHighlight: (id) => set({ canvasHighlight: id }),
  clearCanvasHighlight: () => set({ canvasHighlight: null }),
  setDragHint: (v) => set({ dragHint: v }),
  setScratchMode: (v) => set({ scratchMode: v }),

  reorderSteps: (fromIdx, toIdx, flow = 'ob') => {
    const state = get();
    const { past, obPipeline, authPipeline } = state;
    const pipeline = getPipeline(state, flow);
    const key = pipelineKey(flow);
    const next = [...pipeline];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    set({ [key]: next, past: pushHistory(past, obPipeline, authPipeline), future: [], isDirty: true });
  },

  // ── Templates ────────────────────────────────────────────────────────────────
  applyTemplate: (templateName, flow = 'ob') => {
    const state = get();
    const { past, obPipeline, authPipeline } = state;
    const key = pipelineKey(flow);
    const tpl = TEMPLATES.find((t) => t.name === templateName);
    if (!tpl) return;
    const next = tpl.pipeline.map((step) => ({
      ...step,
      id: genId(step.type),
      addons: step.addons ?? {},
      intOpts: step.intOpts ?? {},
      docRole: step.docRole ?? null,
      coherence: step.coherence ?? {},
    }));
    const nextAuth = tpl.auth
      ? tpl.auth.map((step) => ({
          ...step,
          id: genId(step.type),
          addons: step.addons ?? {},
          intOpts: step.intOpts ?? {},
          docRole: null,
          coherence: {},
        }))
      : authPipeline;
    set({ [key]: next, authPipeline: nextAuth, activeId: null, past: pushHistory(past, obPipeline, authPipeline), future: [], isDirty: true });
  },

  clearPipeline: (flow = 'ob') => {
    const state = get();
    const { past, obPipeline, authPipeline } = state;
    const key = pipelineKey(flow);
    set({ [key]: [], activeId: null, past: pushHistory(past, obPipeline, authPipeline), future: [], isDirty: true });
  },

  // ── Undo / Redo ──────────────────────────────────────────────────────────────
  undo: () => {
    const { past, obPipeline, authPipeline, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      obPipeline: prev.ob,
      authPipeline: prev.auth,
      future: [{ ob: obPipeline, auth: authPipeline }, ...future],
      activeId: null,
      isDirty: true,
    });
  },

  redo: () => {
    const { past, obPipeline, authPipeline, future } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      past: [...past, { ob: obPipeline, auth: authPipeline }],
      obPipeline: next.ob,
      authPipeline: next.auth,
      future: future.slice(1),
      activeId: null,
      isDirty: true,
    });
  },

  // ── Saved templates ──────────────────────────────────────────────────────────
  saveCurrentAsTemplate: (name) => {
    const { obPipeline, authPipeline, savedTemplates } = get();
    const entry = { name, pipeline: obPipeline, auth: authPipeline, savedAt: Date.now() };
    const next = [...savedTemplates.filter(t => t.name !== name), entry];
    localStorage.setItem('savedTemplates', JSON.stringify(next));
    set({ savedTemplates: next });
  },

  deleteSavedTemplate: (name) => {
    const { savedTemplates } = get();
    const next = savedTemplates.filter(t => t.name !== name);
    localStorage.setItem('savedTemplates', JSON.stringify(next));
    set({ savedTemplates: next });
  },

  applySavedTemplate: (entry) => {
    const { past, obPipeline, authPipeline } = get();
    const nextOb = entry.pipeline.map(s => ({ ...s, id: genId(s.type) }));
    const nextAuth = entry.auth.map(s => ({ ...s, id: genId(s.type) }));
    set({ obPipeline: nextOb, authPipeline: nextAuth, activeId: null,
      past: [...past.slice(-30), { ob: obPipeline, auth: authPipeline }], future: [], isDirty: true });
  },

  // ── Zoom ─────────────────────────────────────────────────────────────────────
  setZoom: (z) => set({ zoom: Math.min(2, Math.max(0.25, Math.round(z * 100) / 100)) }),

  // ── Save ─────────────────────────────────────────────────────────────────────
  markSaved: () => {
    // Persist to localStorage workspace if one is open
    const state = get();
    if (state.workflowId) {
      const list = readWorkspaces();
      const idx = list.findIndex((w) => w.id === state.workflowId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          name: state.workflowName,
          updatedAt: Date.now(),
          flows: {
            onboarding: { pipeline: state.obPipeline },
            auth: { pipeline: state.authPipeline },
          },
        };
        writeWorkspaces(list);
      }
    }
    set({ isDirty: false, lastSavedAt: Date.now() });
  },

  // ── Workflow name ────────────────────────────────────────────────────────────
  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),

  // ── Workflow CRUD ─────────────────────────────────────────────────────────────
  loadWorkflow: (id) => {
    const list = readWorkspaces();
    const wf = list.find((w) => w.id === id);
    if (!wf) return;
    sessionStorage.setItem('shareid_active_workspace', id);
    set({
      workflowId: wf.id,
      workflowName: wf.name,
      obPipeline: wf.flows?.onboarding?.pipeline ?? [],
      authPipeline: wf.flows?.auth?.pipeline ?? [],
      activeId: null,
      past: [],
      future: [],
      isDirty: false,
      lastSavedAt: null,
    });
  },

  saveWorkflow: () => {
    const state = get();
    if (!state.workflowId) return;
    const list = readWorkspaces();
    const idx = list.findIndex((w) => w.id === state.workflowId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        name: state.workflowName,
        updatedAt: Date.now(),
        flows: {
          onboarding: { pipeline: state.obPipeline },
          auth: { pipeline: state.authPipeline },
        },
      };
      writeWorkspaces(list);
    }
    set({ isDirty: false, lastSavedAt: Date.now() });
  },

  createWorkflow: (name) => {
    const id = uid();
    const now = Date.now();
    const entry = {
      id,
      name: name || 'Untitled workflow',
      createdAt: now,
      updatedAt: now,
      flows: { onboarding: { pipeline: [] }, auth: { pipeline: [] } },
    };
    const list = readWorkspaces();
    writeWorkspaces([...list, entry]);
    sessionStorage.setItem('shareid_active_workspace', id);
    set({
      workflowId: id,
      workflowName: entry.name,
      obPipeline: [],
      authPipeline: [],
      activeId: null,
      past: [],
      future: [],
      isDirty: false,
      lastSavedAt: null,
    });
  },
}));
