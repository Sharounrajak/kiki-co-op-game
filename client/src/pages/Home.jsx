import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [selectedGame, setSelectedGame] = useState("draw");
  const [copied, setCopied] = useState(false);

  // Auto-fill room code from URL query parameter (Invite Link flow)
  useEffect(() => {
    const urlRoom = searchParams.get('room');
    if (urlRoom) {
      setRoom(urlRoom.toUpperCase());
    }
  }, [searchParams]);

  const generateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoom(code);
  };

  const shareableLink = room ? `${window.location.origin}/?room=${room}` : "";

  const handleCopyLink = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = (e) => {
    e.preventDefault();
    if (!room) return alert("Please enter or generate a room code!");
    const name = username.trim() || "KiKi";

    if (socket) {
      socket.emit("join_room", { room, username: name, gameType: selectedGame });
    }

    navigate(`/${selectedGame}/${room}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="arcade-dashboard">
      <header className="arcade-header">
        <div className="brand">
          <span className="logo-icon">🕹️</span>
          <h1>Co-Op with KiKi</h1>
        </div>
        <div className="status-pill">
          <span className="online-dot"></span> YOU & ME
        </div>
      </header>

      <main className="dashboard-content">
        <div className="hero-banner">
          <h2>Co-Op with KiKi 🎮</h2>
          <p>Doodle, guess, battle, and hang out in real-time together!</p>
        </div>

        <div className="interactive-grid">
          {/* Session Controls */}
          <div className="setup-card">
            <h3>1. Session Controls</h3>
            <form onSubmit={handleLaunch} className="setup-form">
              <div className="input-group">
                <label>YOUR NAME</label>
                <input 
                  type="text" 
                  placeholder="KiKi..." 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength="12"
                />
              </div>

              <div className="input-group">
                <label>ROOM CODE</label>
                <div className="code-input-row">
                  <input 
                    type="text" 
                    placeholder="ABCD" 
                    value={room} 
                    onChange={(e) => setRoom(e.target.value.toUpperCase())}
                    maxLength="6"
                  />
                  <button type="button" className="btn-secondary" onClick={generateRoom}>
                    ⚡ Auto Code
                  </button>
                </div>
              </div>

              {room && (
                <div className="input-group" style={{ marginTop: '10px' }}>
                  <label>INVITE LINK</label>
                  <div className="code-input-row">
                    <input type="text" readOnly value={shareableLink} />
                    <button type="button" className="btn-secondary" onClick={handleCopyLink}>
                      {copied ? '✅ Copied!' : '📋 Copy Link'}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary-launch" style={{ marginTop: '15px' }}>
                LAUNCH GAME NIGHT 🚀
              </button>
            </form>
          </div>

          {/* Game Selection Cards */}
          <div className="games-card">
            <h3>2. Select Game Mode</h3>
            <div className="game-cards-wrapper">  
              <div 
                className={`game-selector-box ${selectedGame === 'draw' ? 'selected' : ''}`}
                onClick={() => setSelectedGame('draw')}
              >
                <div className="box-badge">SKRIBBL STYLE</div>
                <div className="box-header">
                  <span className="box-icon">✏️</span>
                  <h4>Pencil Doodle & Guess</h4>
                </div>
                <p className="game-desc">
                  Turn-based sketch guessing with custom timers, hints, and drawing canvas tools.
                </p>
                <div className="how-to-play">
                  <strong>HOW TO PLAY:</strong> One person draws a secret word on canvas while the other guesses in real time!
                </div>
              </div>

              <div 
                className={`game-selector-box ${selectedGame === 'guess' ? 'selected' : ''}`}
                onClick={() => setSelectedGame('guess')}
              >
                <div className="box-badge">CARD GAME</div>
                <div className="box-header">
                  <span className="box-icon">🔍</span>
                  <h4>Guess the Character</h4>
                </div>
                <p className="game-desc">
                  Narrow down secret characters across Formula 1 drivers, anime, and custom card decks.
                </p>
                <div className="how-to-play">
                  <strong>HOW TO PLAY:</strong> Ask yes/no trait questions to eliminate wrong cards and guess hidden cards!
                </div>
              </div>

              <div 
                className={`game-selector-box ${selectedGame === 'monopoly' ? 'selected' : ''}`}
                onClick={() => setSelectedGame('monopoly')}
              >
                <div className="box-badge">BOARD GAME</div>
                <div className="box-header">
                  <span className="box-icon">🎩</span>
                  <h4>Monopoly Canvas</h4>
                </div>
                <p className="game-desc">
                  Roll dice, acquire real estate, collect rents, and run your rival into bankruptcy.
                </p>
                <div className="how-to-play">
                  <strong>HOW TO PLAY:</strong> Take turns rolling dice, buying properties, and out-investing your opponent to win!
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;