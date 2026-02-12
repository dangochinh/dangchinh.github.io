import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostRoom from './pages/HostRoom';
import PlayerRoom from './pages/PlayerRoom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:roomId/host" element={<HostRoom />} />
                <Route path="/:roomId/play" element={<PlayerRoom />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
