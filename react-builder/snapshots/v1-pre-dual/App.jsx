import './styles/main.css';
import Topbar from './components/Topbar/Topbar';
import Sidebar from './components/Sidebar/Sidebar';
import Canvas from './components/Canvas/Canvas';
import Panel from './components/Panel/Panel';
import BottomBar from './components/BottomBar/BottomBar';

export default function App() {
  return (
    <div className="app">
      <Topbar />
      <div className="builder">
        <div className="sidebar-zone">
          <Sidebar />
        </div>
        <div className="builder-center">
          <Canvas />
          <BottomBar />
        </div>
        <Panel />
      </div>
    </div>
  );
}
