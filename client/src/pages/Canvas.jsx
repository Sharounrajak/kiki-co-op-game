import React, { useRef, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Configuration from '../components/Configuration';
import Chat from '../components/Chat';
import './Canvas.css';

const Canvas = ({ socket }) => {
  const { room } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("name") || "Doodler";
  const isCreatorParam = searchParams.get("host") === "true";

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [hostId, setHostId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState("lobby");
  const [drawerId, setDrawerId] = useState(null);
  const [wordOptions, setWordOptions] = useState([]);
  const [secretWord, setSecretWord] = useState("");
  const [maskedWord, setMaskedWord] = useState("");
  const [roundReason, setRoundReason] = useState("");
  const [timer, setTimer] = useState(60);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [scores, setScores] = useState({});
  const [players, setPlayers] = useState({});
  const [settings, setSettings] = useState({ timeLimit: 60, hints: 2, totalRounds: 3 });
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#2d3436");
  const [lineWidth, setLineWidth] = useState(4);

  const isMyTurn = socket.id === drawerId;

  useEffect(() => {
    const joinRoomPayload = { room, username, isCreator: isCreatorParam };

    const handleConnect = () => socket.emit("join_room", joinRoomPayload);

    if (socket.connected) handleConnect();
    else socket.on("connect", handleConnect);

    socket.on("room_data", ({ roomState, hostId: currentHostId }) => {
      setHostId(currentHostId);
      setIsHost(socket.id === currentHostId);
      if (roomState.settings) setSettings(roomState.settings);
      if (roomState.scores) setScores(roomState.scores);
      if (roomState.players) setPlayers(roomState.players);
      if (roomState.gameState) setGameState(roomState.gameState);
      if (roomState.currentDrawer) setDrawerId(roomState.currentDrawer);
    });

    socket.on("settings_updated", (newSettings) => setSettings(newSettings));

    socket.on("game_started", ({ drawerId, gameState, wordOptions, currentRound, totalRounds, scores }) => {
      setDrawerId(drawerId);
      setGameState(gameState);
      setWordOptions(wordOptions);
      setCurrentRound(currentRound);
      setTotalRounds(totalRounds);
      if (scores) setScores(scores);
      clearLocalCanvas();
    });

    socket.on("turn_setup", ({ drawerId, gameState, wordOptions, currentRound, totalRounds }) => {
      setDrawerId(drawerId);
      setGameState(gameState);
      setWordOptions(wordOptions);
      setCurrentRound(currentRound);
      setTotalRounds(totalRounds);
      clearLocalCanvas();
    });

    socket.on("round_start", ({ drawerId, maskedWord, timeLimit }) => {
      setDrawerId(drawerId);
      setGameState("drawing");
      setMaskedWord(maskedWord);
      setTimer(timeLimit);
      clearLocalCanvas();
    });

    socket.on("timer_tick", (time) => setTimer(time));

    socket.on("receive_draw", (data) => {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.tool);
    });

    socket.on("receive_clear", () => clearLocalCanvas());

    socket.on("round_over", ({ reason, secretWord, scores, currentRound, totalRounds }) => {
      setGameState("round_end");
      setRoundReason(reason);
      setSecretWord(secretWord);
      setScores(scores);
      setCurrentRound(currentRound);
      setTotalRounds(totalRounds);
    });

    socket.on("game_over", ({ scores, players }) => {
      setGameState("game_over");
      setScores(scores);
      if (players) setPlayers(players);
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("room_data");
      socket.off("settings_updated");
      socket.off("game_started");
      socket.off("turn_setup");
      socket.off("round_start");
      socket.off("timer_tick");
      socket.off("receive_draw");
      socket.off("receive_clear");
      socket.off("round_over");
      socket.off("game_over");
    };
  }, [socket, room, username, isCreatorParam]);

  const drawLine = (x0, y0, x1, y1, strokeColor, strokeSize, currentTool) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    if (currentTool === 'eraser') {
      ctx.strokeStyle = '#fffef0';
      ctx.lineWidth = strokeSize * 3;
    } else {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  };

  const getCoordinates = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  // Calculate touch position relative to canvas size/scaling
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
};

// Use touch action in CSS to prevent screen scrolling while drawing:
// touch-action: none; (Apply this to your canvas element inline or in CSS)
  const startDrawing = (e) => {
    if (!isMyTurn || gameState !== 'drawing') return;
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    lastPos.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawing.current || !isMyTurn || gameState !== 'drawing') return;
    const { x, y } = getCoordinates(e);
    const { x: x0, y: y0 } = lastPos.current;

    drawLine(x0, y0, x, y, color, lineWidth, tool);
    socket.emit("send_draw", { x0, y0, x1: x, y1: y, color, size: lineWidth, tool, room });
    lastPos.current = { x, y };
  };

  const stopDrawing = () => { isDrawing.current = false; };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClear = () => {
    if (!isMyTurn) return;
    clearLocalCanvas();
    socket.emit("clear_canvas", room);
  };

  const handleUpdateSettings = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    socket.emit("update_settings", { room, settings: updated });
  };

  const handleStartGame = () => socket.emit("start_skribbl", room);

  const handleSelectWord = (word) => {
    setSecretWord(word);
    socket.emit("word_selected", { room, word });
  };

  const handleReturnToLobby = () => {
    socket.emit("reset_to_lobby", room);
  };

  const copyHeaderLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/draw/${room}`);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  return (
    <div className="sketchpad-app">
      <header className="sketch-header">
        <div className="header-left">
          <span className="room-badge">ROOM: {room}</span>
          <button className="invite-link-btn" onClick={copyHeaderLink}>
            {copiedHeader ? "✓ Copied" : "🔗 Share"}
          </button>
        </div>

        <div className="word-display">
          {gameState === 'drawing' && (
            isMyTurn ? <span className="secret-word">DRAW: {secretWord}</span> : <span className="masked-word">{maskedWord}</span>
          )}
          {gameState === 'selecting_word' && <span>Choosing Word...</span>}
          {gameState === 'round_end' && <span>Round Intermission</span>}
          {gameState === 'game_over' && <span>Match Over!</span>}
          {gameState === 'lobby' && <span>Lobby Setup</span>}
        </div>

        <div className="header-right">
          <span className="round-badge">R {currentRound}/{totalRounds}</span>
          <span className="timer-badge">⏳ {timer}s</span>
          <button className="mobile-chat-fab" onClick={() => setIsMobileChatOpen(true)}>💬 Chat</button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="doodle-sidebar">
          <h4>SCORES</h4>
          <div className="score-list">
            {Object.entries(scores).map(([id, score]) => (
              <div key={id} className={`score-card ${id === drawerId ? 'drawing-now' : ''}`}>
                <span>{id === socket.id ? `${username} (You)` : (players[id]?.name || 'Player')}</span>
                <strong>{score} pts</strong>
              </div>
            ))}
          </div>
        </aside>

        <main className="paper-sheet">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="responsive-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {gameState === 'lobby' && (
            <Configuration
              room={room}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onStartGame={handleStartGame}
              isHost={isHost}
            />
          )}

          {gameState === 'selecting_word' && isMyTurn && (
            <div className="paper-overlay">
              <h3>Choose a word to draw:</h3>
              <div className="word-buttons">
                {wordOptions.map((word) => (
                  <button key={word} className="word-btn" onClick={() => handleSelectWord(word)}>
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'selecting_word' && !isMyTurn && (
            <div className="paper-overlay">
              <h3>Drawer is picking a word...</h3>
              <span className="pulse-dot-large"></span>
            </div>
          )}

          {gameState === 'round_end' && (
            <div className="paper-overlay">
              <h2>{roundReason}</h2>
              <p>The word was: <strong>{secretWord}</strong></p>
              <div className="intermission-loader">Next turn starting soon...</div>
            </div>
          )}

          {gameState === 'game_over' && (
            <div className="paper-overlay game-over-screen">
              <h2>🏆 MATCH FINISHED 🏆</h2>
              <div className="leaderboard">
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([id, score], idx) => (
                    <div key={id} className={`leaderboard-row rank-${idx + 1}`}>
                      <span>#{idx + 1} {id === socket.id ? `${username} (You)` : (players[id]?.name || 'Player')}</span>
                      <strong>{score} pts</strong>
                    </div>
                  ))}
              </div>
              {isHost && (
                <button className="start-game-btn" onClick={handleReturnToLobby}>
                  🔄 Back to Lobby
                </button>
              )}
            </div>
          )}
        </main>

        <Chat
          socket={socket}
          room={room}
          username={username}
          isDrawer={isMyTurn}
          gameState={gameState}
          isOpen={isMobileChatOpen}
          onClose={() => setIsMobileChatOpen(false)}
        />
      </div>

      {isMyTurn && gameState === 'drawing' && (
        <div className="doodle-toolbar">
          <div className="tool-group">
            <button className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`} onClick={() => setTool('pencil')}>✏️</button>
            <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}>🧹</button>
          </div>
          <div className="palette-group">
            {['#2d3436', '#d63031', '#0984e3', '#00b894', '#fdcb6e', '#e84393'].map((c) => (
              <button key={c} className="color-swatch" style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <input type="range" min="2" max="20" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} />
          <button className="clear-btn" onClick={handleClear}>Clear</button>
        </div>
      )}
    </div>
  );
};

export default Canvas;