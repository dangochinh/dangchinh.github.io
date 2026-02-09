import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import HostRoom from './pages/HostRoom';
import PlayerRoom from './pages/PlayerRoom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostRoom />} />
          <Route path="/play" element={<PlayerRoom />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
