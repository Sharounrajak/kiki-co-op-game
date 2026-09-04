const BACKEND_FALLBACK_CATEGORIES = {
  f1: {
    cards: [
      { id: 'lh44', name: 'Lewis Hamilton' },
      { id: 'mv1', name: 'Max Verstappen' },
      { id: 'cl16', name: 'Charles Leclerc' },
      { id: 'ln4', name: 'Lando Norris' }
    ]
  }
};

const rooms = {};

export function registerGuessHandlers(io, socket) {
  // 1. JOIN ROOM
  socket.on('join_guess_room', ({ room, username }) => {
    const roomCode = room || 'default';
    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = {
        roomCode,
        gameState: 'lobby',
        hostId: socket.id,
        categoryKey: 'f1',
        players: [],
        playerPicks: {},
        currentTurnIndex: 0,
        selectionTimeout: null
      };
    }

    const currentRoom = rooms[roomCode];
    const existingPlayer = currentRoom.players.find((p) => p.id === socket.id);
    if (!existingPlayer) {
      currentRoom.players.push({ id: socket.id, name: username || 'Player' });
    }

    io.to(roomCode).emit('guess_room_state', {
      roomState: {
        gameState: currentRoom.gameState,
        hostId: currentRoom.hostId,
        categoryKey: currentRoom.categoryKey,
        players: currentRoom.players
      }
    });
  });

  // 2. UPDATE CATEGORY
  socket.on('update_category', ({ room, categoryKey }) => {
    const currentRoom = rooms[room];
    if (!currentRoom) return;

    currentRoom.categoryKey = categoryKey;
    io.to(room).emit('category_updated', { categoryKey });
  });

  // 3. START SELECTION PHASE
  socket.on('start_character_selection', (roomCode) => {
    const currentRoom = rooms[roomCode];
    if (!currentRoom) return;

    currentRoom.gameState = 'selecting';
    currentRoom.playerPicks = {};

    io.to(roomCode).emit('selection_phase_started', { timer: 10 });

    if (currentRoom.selectionTimeout) {
      clearTimeout(currentRoom.selectionTimeout);
    }

    currentRoom.selectionTimeout = setTimeout(() => {
      const activeRoom = rooms[roomCode];
      if (!activeRoom) return;

      const categoryData = BACKEND_FALLBACK_CATEGORIES[activeRoom.categoryKey] || BACKEND_FALLBACK_CATEGORIES.f1;
      const deck = categoryData?.cards || [];

      activeRoom.players.forEach((p) => {
        if (!activeRoom.playerPicks[p.id] && deck.length) {
          const randomIndex = Math.floor(Math.random() * deck.length);
          activeRoom.playerPicks[p.id] = deck[randomIndex];
        }
      });

      activeRoom.gameState = 'playing';
      activeRoom.currentTurnIndex = 0;
      const startingPlayerId = activeRoom.players[0]?.id || '';

      io.to(roomCode).emit('match_started', {
        currentTurnPlayerId: startingPlayerId,
        playerPicks: activeRoom.playerPicks
      });
    }, 10000);
  });

  // 4. MANUAL CARD SELECTION
  socket.on('select_card', ({ room, card }) => {
    const currentRoom = rooms[room];
    if (currentRoom) {
      currentRoom.playerPicks[socket.id] = card;
    }
  });

  // 5. QUESTION HANDLING WITH TURN ROTATION
  socket.on('ask_question', ({ room, questionText, answer }) => {
    const currentRoom = rooms[room];
    if (!currentRoom) return;

    currentRoom.currentTurnIndex = (currentRoom.currentTurnIndex + 1) % currentRoom.players.length;
    const nextPlayerId = currentRoom.players[currentRoom.currentTurnIndex]?.id;

    io.to(room).emit('question_result', {
      askedBy: socket.id,
      questionText,
      answer,
      nextTurnPlayerId: nextPlayerId
    });
  });

  // 6. MAKE GUESS AND END GAME
  socket.on('make_guess', ({ room, isCorrect }) => {
    const currentRoom = rooms[room];
    if (!currentRoom) return;

    currentRoom.gameState = 'game_over';
    
    let winnerId = socket.id;
    if (!isCorrect) {
      const opponent = currentRoom.players.find(p => p.id !== socket.id);
      if (opponent) winnerId = opponent.id;
    }

    const winnerObj = currentRoom.players.find(p => p.id === winnerId);

    io.to(room).emit('guess_outcome', {
      guessedBy: socket.id,
      winnerId,
      winnerName: winnerObj?.name || 'Opponent'
    });
  });

  // 7. RESET LOBBY
  socket.on('reset_guess_lobby', (roomCode) => {
    const currentRoom = rooms[roomCode];
    if (!currentRoom) return;

    currentRoom.gameState = 'lobby';
    currentRoom.playerPicks = {};

    io.to(roomCode).emit('guess_room_state', {
      roomState: {
        gameState: currentRoom.gameState,
        hostId: currentRoom.hostId,
        categoryKey: currentRoom.categoryKey,
        players: currentRoom.players
      }
    });
  });

  // 8. DISCONNECT HANDLER
  socket.on('disconnect', () => {
    Object.keys(rooms).forEach((roomCode) => {
      const currentRoom = rooms[roomCode];
      currentRoom.players = currentRoom.players.filter((p) => p.id !== socket.id);

      if (currentRoom.players.length === 0) {
        if (currentRoom.selectionTimeout) clearTimeout(currentRoom.selectionTimeout);
        delete rooms[roomCode];
      } else {
        if (currentRoom.hostId === socket.id) {
          currentRoom.hostId = currentRoom.players[0].id;
        }
        io.to(roomCode).emit('guess_room_state', {
          roomState: {
            gameState: currentRoom.gameState,
            hostId: currentRoom.hostId,
            categoryKey: currentRoom.categoryKey,
            players: currentRoom.players
          }
        });
      }
    });
  });
}