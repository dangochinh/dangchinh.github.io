import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostRoom from './pages/HostRoom';
import PlayerRoom from './pages/PlayerRoom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/host/:roomId" element={<HostRoom />} />
                <Route path="/room/:roomId" element={<PlayerRoom />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
