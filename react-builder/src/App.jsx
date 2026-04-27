import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './styles/main.css';
import { useStore } from './store/useStore';
import { useNav } from './store/useNav';
import Topbar from './components/Topbar/Topbar';
import Canvas from './components/Canvas/Canvas';
import Panel from './components/Panel/Panel';
import Checklist from './components/Checklist/Checklist';
import BottomBar from './components/BottomBar/BottomBar';
import TemplatesPanel from './components/TemplatesPanel/TemplatesPanel';
import Dashboard from './components/Dashboard/Dashboard';
import TestModal from './components/Modals/TestModal';
import IntegrateModal from './components/Modals/IntegrateModal';

export default function App() {
  const activeId      = useStore((s) => s.activeId);
  const loadWorkflow  = useStore((s) => s.loadWorkflow);
  const createWorkflow = useStore((s) => s.createWorkflow);
  const saveWorkflow  = useStore((s) => s.saveWorkflow);
  const workflowId    = useStore((s) => s.workflowId);
  const obPipeline    = useStore((s) => s.obPipeline);
  const authPipeline  = useStore((s) => s.authPipeline);

  const page     = useNav((s) => s.page);
  const setPage  = useNav((s) => s.setPage);

  // Map nav page to dashboard mode
  const dashMode = page === 'demo' ? 'demo' : page === 'developer' ? 'developer' : 'flows';

  const [testModal, setTestModal]           = useState(null); // workflowId or 'current'
  const [integrateModal, setIntegrateModal] = useState(null);

  // Always start from dashboard
  useEffect(() => {
    localStorage.removeItem('shareid_active_workspace');
    setPage('dashboard');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes modals
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setTestModal(null); setIntegrateModal(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOpen   = (id) => { loadWorkflow(id); setPage('builder'); };
  const handleCreate = (name) => { createWorkflow(name); setPage('builder'); };
  const handleBack   = () => { saveWorkflow(); localStorage.removeItem('shareid_active_workspace'); setPage('dashboard'); };

  // Get workflow data for modals (from dashboard = by id, from builder = current)
  const getWorkflowData = (id) => {
    if (!id || id === 'current') {
      return { name: useStore.getState().workflowName, ob: obPipeline, auth: authPipeline };
    }
    const list = JSON.parse(localStorage.getItem('shareid_workspaces') || '[]');
    const wf = list.find((w) => w.id === id);
    return wf ? { name: wf.name, ob: wf.flows?.onboarding?.pipeline || [], auth: wf.flows?.auth?.pipeline || [] } : null;
  };

  if (page === 'dashboard' || page === 'demo' || page === 'developer') {
    return (
      <>
        <Dashboard
          mode={dashMode}
          onOpen={handleOpen}
          onCreate={handleCreate}
          onTest={(id) => setTestModal(id)}
          onIntegrate={(id) => setIntegrateModal(id)}
        />
        {testModal && createPortal(
          <TestModal data={getWorkflowData(testModal)} onClose={() => setTestModal(null)} />,
          document.body
        )}
        {integrateModal && createPortal(
          <IntegrateModal data={getWorkflowData(integrateModal)} onClose={() => setIntegrateModal(null)} />,
          document.body
        )}
      </>
    );
  }

  return (
    <div className="app">
      <Topbar
        onBack={handleBack}
        onTest={() => setTestModal('current')}
        onIntegrate={() => setIntegrateModal('current')}
      />
      <div className="builder">
        <div className="builder-center">
          <Canvas />
          <BottomBar />
        </div>
      </div>
      <div className="right-sidebar">
        {activeId !== null ? <Panel /> : <Checklist />}
      </div>
      <TemplatesPanel />
      {testModal && createPortal(
        <TestModal data={getWorkflowData(testModal)} onClose={() => setTestModal(null)} />,
        document.body
      )}
      {integrateModal && createPortal(
        <IntegrateModal data={getWorkflowData(integrateModal)} onClose={() => setIntegrateModal(null)} />,
        document.body
      )}
    </div>
  );
}
