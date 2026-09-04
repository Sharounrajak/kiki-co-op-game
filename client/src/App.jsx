import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Home from './pages/Home';
import Canvas from './pages/Canvas';
import Guess from './pages/GuessGameBoard';
import Monopoly from './pages/MonopolyGame';

const socket = io.connect("http://localhost:3001");

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