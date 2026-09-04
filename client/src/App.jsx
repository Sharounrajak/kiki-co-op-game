import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './pages/Home';
import Canvas from './pages/Canvas';
import Guess from './pages/GuessGameBoard';
import Monopoly from './pages/MonopolyGame';

// Replace http://localhost:3001 with your Render URL
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://kiki-co-op-game.onrender.com' 
  : 'http://localhost:3001';

const socket = io.connect(SOCKET_URL);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/draw/:room" element={<Canvas socket={socket} />} />
          <Route path="/guess/:room" element={<Guess socket={socket} />} />
          <Route path="/monopoly/:room" element={<Monopoly socket={socket} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;