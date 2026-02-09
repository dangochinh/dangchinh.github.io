import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import HostRoom from './pages/HostRoom';
import PlayerRoom from './pages/PlayerRoom';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:roomId/host" element={<HostRoom />} />
            <Route path="/:roomId/play" element={<PlayerRoom />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}

export default App;
