import React, { useState, useEffect } from 'react';
import { GAME_CATEGORIES } from '../data/gameData';
import './GuessGameBoard.css';

export default function GuessGameBoard({ socket, roomCode, currentUser }) {
  const activeRoomCode = roomCode || '3DQN';
  const activeUser = currentUser || 'Doodler';

  const [categoryKey, setCategoryKey] = useState("f1");
  const [gameState, setGameState] = useState('lobby'); 
  const [isHost, setIsHost] = useState(true);
  const [players, setPlayers] = useState([]);
  
  const currentCategoryObj = GAME_CATEGORIES[categoryKey] || GAME_CATEGORIES.f1;
  const [deckCards, setDeckCards] = useState(currentCategoryObj.cards || []);
  const [questions, setQuestions] = useState(currentCategoryObj.questions || []);

  const [timer, setTimer] = useState(10);
  const [myPick, setMyPick] = useState(null);
  const [opponentPick, setOpponentPick] = useState(null);
  const [currentTurnId, setCurrentTurnId] = useState('');
  const [eliminatedCardIds, setEliminatedCardIds] = useState([]);
  const [matchLogs, setMatchLogs] = useState([]);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_guess_room", {
      room: activeRoomCode,
      username: activeUser
    });

    socket.on("guess_room_state", ({ roomState }) => {
      setGameState(roomState.gameState || 'lobby');
      setPlayers(roomState.players || []);
      const cKey = roomState.categoryKey || 'f1';
      setCategoryKey(cKey);
      setDeckCards(GAME_CATEGORIES[cKey]?.cards || []);
      setQuestions(GAME_CATEGORIES[cKey]?.questions || []);
      setIsHost(socket.id === roomState.hostId);
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
      setOpponentPick(null);
    });

    socket.on("match_started", ({ currentTurnPlayerId, playerPicks }) => {
      setGameState('playing');
      setCurrentTurnId(currentTurnPlayerId);
      setEliminatedCardIds([]);
      setMatchLogs(["Match started! Eliminate cards and guess your opponent's character!"]);

      if (playerPicks && socket.id) {
        setMyPick(playerPicks[socket.id]);
        const oppId = Object.keys(playerPicks).find(id => id !== socket.id);
        if (oppId) setOpponentPick(playerPicks[oppId]);
      }
    });

    socket.on("question_result", ({ askedBy, questionText, answer, nextTurnPlayerId }) => {
      const isMe = askedBy === socket.id;
      setCurrentTurnId(nextTurnPlayerId);
      setMatchLogs(prev => [`${isMe ? "You" : "Opponent"} asked "${questionText}" ➔ Answer: ${answer}`, ...prev]);
    });

    socket.on("guess_outcome", ({ guessedBy, winnerId, winnerName }) => {
      setWinnerInfo({ winnerName });
      setGameState('game_over');
    });

    return () => {
      socket.off("guess_room_state");
      socket.off("category_updated");
      socket.off("selection_phase_started");
      socket.off("match_started");
      socket.off("question_result");
      socket.off("guess_outcome");
    };
  }, [socket, activeRoomCode, activeUser]);

  useEffect(() => {
    if (gameState !== 'selecting') return;
    if (timer <= 0) {
      if (!myPick && deckCards.length > 0) {
        const autoPick = deckCards[0];
        setMyPick(autoPick);
        if (socket) socket.emit("select_card", { room: activeRoomCode, card: autoPick });
      }
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [gameState, timer, myPick, deckCards, socket, activeRoomCode]);

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
    if (socket) socket.emit("start_character_selection", activeRoomCode);
  };

  const handlePickCard = (card) => {
    setMyPick(card);
    if (socket) socket.emit("select_card", { room: activeRoomCode, card });
  };

  const handleAskQuestion = (q) => {
    if (!socket || socket.id !== currentTurnId || !opponentPick) return;

    const hasTrait = Boolean(opponentPick?.traits && opponentPick.traits[q.traitKey]);
    const answer = hasTrait ? "YES" : "NO";

    const toEliminate = deckCards
      .filter(card => {
        const traitVal = Boolean(card.traits && card.traits[q.traitKey]);
        return answer === "YES" ? !traitVal : traitVal;
      })
      .map(c => c.id);

    setEliminatedCardIds(prev => [...new Set([...prev, ...toEliminate])]);

    socket.emit("ask_question", {
      room: activeRoomCode,
      questionText: q.text,
      answer
    });
  };

  const handleGuessCharacter = (card) => {
    if (!socket || socket.id !== currentTurnId) return;

    if (window.confirm(`Are you sure you want to guess ${card.name}?`)) {
      const isCorrect = opponentPick && card.id === opponentPick.id;
      
      socket.emit("make_guess", {
        room: activeRoomCode,
        characterId: card.id,
        isCorrect
      });
    }
  };

  const isMyTurn = socket && socket.id === currentTurnId;

  return (
    <div className="guess-game-wrapper">
      <div className="game-container">
        <div className="mobile-top-bar">
          <h1 className="game-title" style={{ fontSize: '1.1rem' }}>GUESS WHO TCG</h1>
          <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            {mobileSidebarOpen ? "CLOSE MENU" : "INFO & LOGS"}
          </button>
        </div>

        {mobileSidebarOpen && (
          <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />
        )}

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
              {players.map((p) => (
                <div key={p.id} className="player-card">
                  <span>{p.name} {p.id === socket?.id ? "(You)" : ""}</span>
                  {gameState === 'playing' && p.id === currentTurnId && (
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
                  <button onClick={handleStartGame} disabled={players.length < 2} className="btn-primary">
                    {players.length < 2 ? "WAITING FOR PLAYER 2..." : "START GAME"}
                  </button>
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
                  <div key={card.id} onClick={() => handlePickCard(card)} className={`trading-card ${myPick?.id === card.id ? 'card-selected' : ''}`}>
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
              <p style={{ fontSize: '1.2rem', color: '#ffffff' }}>Winner: {winnerInfo?.winnerName}</p>
              {isHost && (
                <button onClick={() => socket.emit("reset_guess_lobby", activeRoomCode)} className="btn-primary">
                  PLAY AGAIN
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}