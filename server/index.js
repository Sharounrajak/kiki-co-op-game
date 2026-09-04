import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerGuessHandlers } from './guessServer.js';

const app = express();
app.use(cors());

// Health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};

// EXPANDED WORD BANK
const WORD_BANK = [
  // F1 & Racing
  "Formula 1", "Ferrari", "Pit Stop", "Race Car", "Helmet", "Red Bull", "Circuit", "Tire",
  // Gaming & Tech
  "Pikachu", "Pokemon", "Laptop", "Headphones", "Camera", "Console", "Joystick", "Keyboard", "Pixel Art", "Monaco Editor",
  // Food & Drinks
  "Pizza", "Coffee", "Burger", "Sushi", "Taco", "Ice Cream", "Donut", "Pancake", "Ramen", "Popcorn",
  // Objects & Art
  "Guitar", "Pencil", "Bicycle", "Starry Night", "Painting", "Canvas", "Brush", "Telescope", "Clock", "Compass",
  // Animals & Nature
  "Cat", "Dragon", "Panda", "Penguin", "Volcano", "Waterfall", "Mountain", "Sunflower", "Eagle", "Shark",
  // World Places & Landmarks
  "Nepal", "Castle", "Pyramid", "Eiffel Tower", "Statue of Liberty", "Bridge", "Island", "Lighthouse",
  // Vehicles & Space
  "Rocket", "Spaceship", "Airplane", "Helicopter", "Submarine", "Skateboard", "Hot Air Balloon",
  // Miscellaneous
  "Wizard", "Treasure", "Microphone", "Diamond", "Anchor", "Magnet", "Lantern", "Trophy"
];

const getRandomWords = (count = 3) => {
  return [...WORD_BANK].sort(() => 0.5 - Math.random()).slice(0, count);
};

const endTurn = (roomCode, reason) => {
  const r = rooms[roomCode];
  if (!r) return;

  if (r.interval) {
    clearInterval(r.interval);
    r.interval = null;
  }
  r.gameState = 'round_end';

  io.in(roomCode).emit("round_over", {
    reason,
    secretWord: r.secretWord,
    scores: r.scores,
    currentRound: r.currentRound,
    totalRounds: r.settings.totalRounds
  });

  setTimeout(() => {
    advanceTurn(roomCode);
  }, 5000);
};

const advanceTurn = (roomCode) => {
  const r = rooms[roomCode];
  if (!r) return;

  r.playerQueue = Object.keys(r.players);
  if (r.playerQueue.length === 0) {
    if (r.interval) clearInterval(r.interval);
    delete rooms[roomCode];
    return;
  }

  r.drawerIndex += 1;

  if (r.drawerIndex >= r.playerQueue.length) {
    r.drawerIndex = 0;
    r.currentRound += 1;
  }

  if (r.currentRound > (r.settings.totalRounds || 3)) {
    r.gameState = 'game_over';
    io.in(roomCode).emit("game_over", { scores: r.scores, players: r.players });
    return;
  }

  r.currentDrawer = r.playerQueue[r.drawerIndex];
  r.gameState = 'selecting_word';
  r.secretWord = '';
  r.wordOptions = getRandomWords(3);

  io.in(roomCode).emit("turn_setup", {
    drawerId: r.currentDrawer,
    gameState: r.gameState,
    wordOptions: r.wordOptions,
    currentRound: r.currentRound,
    totalRounds: r.settings.totalRounds
  });
};

io.on('connection', (socket) => {
  // 1. REGISTER GUESS WHO HANDLERS
  registerGuessHandlers(io, socket);

  // 2. MONOPOLY CANVAS HANDLERS
  socket.on("join_monopoly_room", ({ room, username }) => {
    socket.join(room);
    socket.to(room).emit("player_joined_monopoly", { id: socket.id, username });
  });

  socket.on("monopoly_state_change", ({ room, state }) => {
    socket.to(room).emit("update_monopoly_state", state);
  });

  // 3. SKRIBBL / CANVAS HANDLERS
  socket.on("join_room", (data) => {
    const { room, username, isCreator } = typeof data === 'object' ? data : { room: data, username: 'Player', isCreator: false };
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        host: socket.id,
        players: {},
        playerQueue: [],
        drawerIndex: 0,
        settings: { timeLimit: 60, hints: 2, totalRounds: 3 },
        gameState: 'lobby',
        currentDrawer: null,
        secretWord: '',
        wordOptions: [],
        currentRound: 1,
        scores: {},
        timer: 60,
        interval: null
      };
    } else if (isCreator || !rooms[room].host || !rooms[room].players[rooms[room].host]) {
      rooms[room].host = socket.id;
    }

    rooms[room].players[socket.id] = { id: socket.id, name: username || 'Player' };
    if (rooms[room].scores[socket.id] === undefined) {
      rooms[room].scores[socket.id] = 0;
    }

    io.in(room).emit("room_data", {
      roomState: rooms[room],
      hostId: rooms[room].host
    });
  });

  socket.on("update_settings", ({ room, settings }) => {
    if (rooms[room] && (rooms[room].host === socket.id || Object.keys(rooms[room].players).length === 1)) {
      rooms[room].settings = { ...rooms[room].settings, ...settings };
      io.in(room).emit("settings_updated", rooms[room].settings);
    }
  });

  socket.on("start_skribbl", (room) => {
    const r = rooms[room];
    if (!r) return;

    r.playerQueue = Object.keys(r.players);
    if (r.playerQueue.length === 0) return;

    r.drawerIndex = 0;
    r.currentRound = 1;
    r.currentDrawer = r.playerQueue[0];
    r.gameState = 'selecting_word';
    r.wordOptions = getRandomWords(3);

    Object.keys(r.players).forEach(id => { r.scores[id] = 0; });

    io.in(room).emit("game_started", {
      drawerId: r.currentDrawer,
      gameState: r.gameState,
      wordOptions: r.wordOptions,
      currentRound: r.currentRound,
      totalRounds: r.settings.totalRounds,
      scores: r.scores
    });
  });

  socket.on("word_selected", ({ room, word }) => {
    const r = rooms[room];
    if (!r) return;

    r.secretWord = word;
    r.gameState = 'drawing';
    r.timer = parseInt(r.settings.timeLimit) || 60;

    io.in(room).emit("round_start", {
      drawerId: r.currentDrawer,
      maskedWord: word.replace(/[a-zA-Z]/g, '_'),
      timeLimit: r.timer
    });

    if (r.interval) clearInterval(r.interval);
    r.interval = setInterval(() => {
      r.timer -= 1;
      io.in(room).emit("timer_tick", r.timer);

      if (r.timer <= 0) {
        endTurn(room, `Time's up! The word was "${r.secretWord}".`);
      }
    }, 1000);
  });

  socket.on("send_draw", (data) => socket.to(data.room).emit("receive_draw", data));
  socket.on("clear_canvas", (room) => socket.to(room).emit("receive_clear"));

  socket.on("send_message", ({ room, message, sender }) => {
    const r = rooms[room];
    if (!r) return;

    const isGuess = r.gameState === 'drawing' && socket.id !== r.currentDrawer;
    
    if (isGuess && message.trim().toLowerCase() === r.secretWord.toLowerCase()) {
      r.scores[socket.id] = (r.scores[socket.id] || 0) + (r.timer * 10);
      io.in(room).emit("correct_guess", { winnerName: sender, word: r.secretWord, scores: r.scores });
      endTurn(room, `🎉 ${sender} guessed the word "${r.secretWord}"!`);
    } else {
      io.in(room).emit("receive_message", { sender, message, isSystem: false, id: Date.now() });
    }
  });

  socket.on("reset_to_lobby", (room) => {
    const r = rooms[room];
    if (!r) return;
    
    if (r.interval) clearInterval(r.interval);
    r.gameState = 'lobby';
    io.in(room).emit("room_data", { roomState: r, hostId: r.host });
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        delete room.scores[socket.id];
        room.playerQueue = room.playerQueue.filter(id => id !== socket.id);

        if (room.host === socket.id) {
          const remainingPlayers = Object.keys(room.players);
          if (remainingPlayers.length > 0) {
            room.host = remainingPlayers[0];
          } else {
            if (room.interval) clearInterval(room.interval);
            delete rooms[roomCode];
            continue;
          }
        }

        io.in(roomCode).emit("room_data", {
          roomState: room,
          hostId: room.host
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Unified Game Server running on port ${PORT}`));