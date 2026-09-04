  import React, { useState, useEffect } from 'react';
  import { GAME_CATEGORIES } from '../data/gameData';
  import './GuessGameBoard.css';

  export default function GuessGameBoard({ socket, roomCode, currentUser }) {
    const activeRoomCode = roomCode || '3DQN';
    const activeUser = currentUser || 'Doodler';

    const [categoryKey, setCategoryKey] = useState("f1");
    const [gameState, setGameState] = useState('lobby'); 
    const [isHost, setIsHost] = useState(true);
    const [players, setPlayers] = useState([{ id: 'p1', name: `${activeUser} (You)` }, { id: 'p2', name: 'Bot Rival' }]);
    
    const currentCategoryObj = GAME_CATEGORIES[categoryKey] || GAME_CATEGORIES.f1;
    const [deckCards, setDeckCards] = useState(currentCategoryObj.cards || []);
    const [questions, setQuestions] = useState(currentCategoryObj.questions || []);

    const [timer, setTimer] = useState(10);
    const [myPick, setMyPick] = useState(null);
    const [currentTurnId, setCurrentTurnId] = useState('p1');
    const [eliminatedCardIds, setEliminatedCardIds] = useState([]);
    const [matchLogs, setMatchLogs] = useState([]);
    const [winnerInfo, setWinnerInfo] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
      if (!socket) return;

      socket.emit("join_guess_room", {
        room: activeRoomCode,
        username: activeUser,
        isCreator: true
      });

      socket.on("guess_room_state", ({ roomState }) => {
        setGameState(roomState.gameState || 'lobby');
        setPlayers(roomState.players?.length ? roomState.players : [{ id: socket.id, name: `${activeUser} (You)` }]);
        const cKey = roomState.categoryKey || 'f1';
        setCategoryKey(cKey);
        setDeckCards(GAME_CATEGORIES[cKey]?.cards || []);
        setQuestions(GAME_CATEGORIES[cKey]?.questions || []);
        setIsHost(socket.id === roomState.hostId || true);
      });

      socket.on("category_updated", ({ categoryKey: newKey }) => {
        setCategoryKey(newKey);
        setDeckCards(GAME_CATEGORIES[newKey]?.cards || []);
        setQuestions(GAME_CATEGORIES[newKey]?.questions || []);
      });

      socket.on("selection_phase_started", (data) => {
        setGameState('selecting');
        setTimer(data.timer || 10);
        setMyPick(null);
      });

      socket.on("match_started", (data) => {
        setGameState('playing');
        setCurrentTurnId(data.currentTurnPlayerId || socket.id || 'p1');
        setEliminatedCardIds([]);
        setMatchLogs(["Match started! Pick your questions carefully."]);
      });

      return () => {
        socket.off("guess_room_state");
        socket.off("category_updated");
        socket.off("selection_phase_started");
        socket.off("match_started");
      };
    }, [socket, activeRoomCode, activeUser]);

    useEffect(() => {
      if (gameState !== 'selecting') return;
      if (timer <= 0) {
        if (!myPick && deckCards.length > 0) {
          setMyPick(deckCards[0]);
        }
        setGameState('playing');
        setMatchLogs(["Card confirmed! Match started."]);
        return;
      }
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }, [gameState, timer, myPick, deckCards]);

    // Monitor Board State for Automatic End of Match
    useEffect(() => {
      if (gameState !== 'playing' || deckCards.length === 0) return;

      // Check if ALL cards have been eliminated
      if (eliminatedCardIds.length >= deckCards.length) {
        setWinnerInfo({ winnerName: 'Nobody (All cards eliminated!)' });
        setGameState('game_over');
      }
    }, [eliminatedCardIds, deckCards, gameState]);

    const handleCategorySelect = (e) => {
      const newKey = e.target.value;
      setCategoryKey(newKey);
      setDeckCards(GAME_CATEGORIES[newKey]?.cards || []);
      setQuestions(GAME_CATEGORIES[newKey]?.questions || []);
      if (socket) {
        socket.emit("update_category", { room: activeRoomCode, categoryKey: newKey });
      }
    };

    const handleStartGame = () => {
      if (socket) {
        socket.emit("start_character_selection", activeRoomCode);
      } else {
        setGameState('selecting');
        setTimer(10);
      }
    };

    const handleAskQuestion = (q) => {
      const hasTrait = Boolean(myPick?.traits && myPick.traits[q.traitKey]);
      const answer = hasTrait ? "YES" : "NO";

      const toEliminate = deckCards
        .filter(card => {
          const traitVal = Boolean(card.traits && card.traits[q.traitKey]);
          return answer === "YES" ? !traitVal : traitVal;
        })
        .map(c => c.id);

      const newEliminated = [...new Set([...eliminatedCardIds, ...toEliminate])];
      setEliminatedCardIds(newEliminated);
      setMatchLogs(prev => [`Asked: "${q.text}" ➔ Result: ${answer}`, ...prev]);

      if (socket) {
        socket.emit("ask_question", { room: activeRoomCode, questionId: q.id });
      }
    };

    const handleGuessCharacter = (card) => {
      if (window.confirm(`Are you sure you want to guess ${card.name}?`)) {
        if (myPick && card.id === myPick.id) {
          setWinnerInfo({ winnerName: activeUser });
          setGameState('game_over');
        } else {
          const updatedEliminated = [...new Set([...eliminatedCardIds, card.id])];
          setEliminatedCardIds(updatedEliminated);
          
          if (updatedEliminated.length >= deckCards.length) {
            setWinnerInfo({ winnerName: 'Opponent (You ran out of options!)' });
            setGameState('game_over');
          } else {
            alert("Incorrect guess! Card eliminated from your board.");
          }
        }

        if (socket) {
          socket.emit("make_guess", { room: activeRoomCode, characterId: card.id });
        }
      }
    };

    const isMyTurn = !socket || socket?.id === currentTurnId || currentTurnId === 'p1';

    return (
      <div className="guess-game-wrapper">
        <div className="game-container">
          {/* Mobile Navigation Header */}
          <div className="mobile-top-bar">
            <h1 className="game-title" style={{ fontSize: '1.1rem' }}>GUESS WHO TCG</h1>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? "CLOSE MENU" : "INFO & LOGS"}
            </button>
          </div>

          {/* Mobile Drawer Overlay */}
          {mobileSidebarOpen && (
            <div 
              className="mobile-overlay" 
              onClick={() => setMobileSidebarOpen(false)} 
            />
          )}

          {/* Game Sidebar */}
          <aside className={`game-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h1 className="game-title">GUESS WHO TCG</h1>
              <div className="room-badge">
                <span>ROOM:</span>
                <span className="room-code">{activeRoomCode}</span>
              </div>
            </div>

            <div>
              <div className="section-label">
                <span>PLAYERS ({players.length})</span>
              </div>
              <div className="player-list">
                {players.map((p, idx) => (
                  <div key={p.id || idx} className="player-card">
                    <span>{p.name}</span>
                    {idx === 0 && gameState === 'playing' && (
                      <span className="turn-badge">TURN</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {gameState === 'playing' && (
              <div style={{ borderTop: '2px dashed var(--border-dark)', paddingTop: '0.85rem' }}>
                <span className="section-label" style={{ color: 'var(--primary)' }}>YOUR SECRET CARD</span>
                {myPick ? (
                  <div className="my-pick-card">
                    <img src={myPick.image} alt={myPick.name} className="my-pick-img" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{myPick.name}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-assigned card</div>
                )}
              </div>
            )}

            {gameState === 'playing' && (
              <div style={{ borderTop: '2px dashed var(--border-dark)', paddingTop: '0.85rem' }}>
                <span className="section-label">Game Feed</span>
                <div className="match-logs">
                  {matchLogs.map((log, idx) => (
                    <div key={idx} className="log-entry">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Gameplay Area */}
          <main className="game-main">
            {gameState === 'lobby' && (
              <div className="lobby-viewport">
                <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff' }}>Lobby Setup</h2>
                <div className="lobby-box">
                  <label className="section-label">SELECT CATEGORY</label>
                  <select value={categoryKey} onChange={handleCategorySelect} disabled={!isHost} className="select-input">
                    {Object.values(GAME_CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>

                  {isHost && (
                    <button onClick={handleStartGame} className="btn-primary">START GAME</button>
                  )}
                </div>
              </div>
            )}

            {gameState === 'selecting' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="top-status-bar">
                  <span>SELECT YOUR CARD ({timer}s)</span>
                  <span className="status-badge my-turn">CHOOSE</span>
                </div>
                <div className="cards-grid">
                  {deckCards.map((card) => (
                    <div 
                      key={card.id} 
                      onClick={() => setMyPick(card)} 
                      className={`trading-card ${myPick?.id === card.id ? 'card-selected' : ''}`}
                    >
                      <img src={card.image} alt={card.name} />
                      <div className="card-title">{card.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div className="top-status-bar">
                  <span>Category: <strong>{currentCategoryObj.label}</strong></span>
                  <span className={`status-badge ${isMyTurn ? 'my-turn' : 'opp-turn'}`}>
                    {isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
                  </span>
                </div>

                <div className="cards-grid">
                  {deckCards.map((card) => {
                    const isEliminated = eliminatedCardIds.includes(card.id);
                    return (
                      <div key={card.id} className={`trading-card ${isEliminated ? 'card-eliminated' : ''}`}>
                        <img src={card.image} alt={card.name} />
                        <div className="card-title">{card.name}</div>
                        {!isEliminated && isMyTurn && (
                          <button onClick={() => handleGuessCharacter(card)} className="btn-guess">GUESS</button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="question-console">
                  <div className="section-label">QUESTIONS CONSOLE</div>
                  <div className="questions-grid">
                    {questions.map((q) => (
                      <button key={q.id} disabled={!isMyTurn} onClick={() => handleAskQuestion(q)} className="question-btn">
                        ❓ {q.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState === 'game_over' && (
              <div className="lobby-viewport">
                <h2 style={{ fontSize: '2.5rem', color: '#ffffff' }}>🏆 GAME OVER</h2>
                <p style={{ fontSize: '1.2rem', color: '#ffffff' }}>Result: {winnerInfo?.winnerName || activeUser}</p>
                <button onClick={() => { setGameState('lobby'); setEliminatedCardIds([]); setMyPick(null); }} className="btn-primary">
                  PLAY AGAIN
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }