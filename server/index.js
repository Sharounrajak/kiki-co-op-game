import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerGuessHandlers } from './guessServer.js';

const app = express();
app.use(cors());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const WORD_BANK = [
  "Elephant", "Giraffe", "Penguin", "Kangaroo", "Octopus", "Flamingo", "Chimpanzee", 
  "Dolphin", "Crocodile", "Cheetah", "Peacock", "Hedgehog", "Chameleon", "Squirrel",
  "Pizza", "Hamburger", "Sushi", "Ice Cream", "Taco", "Pancake", "Spaghetti", 
  "Watermelon", "Donut", "Pineapple", "Croissant", "Avocado", "Popcorn", "Cupcake",
  "Guitar", "Telescope", "Umbrella", "Headphones", "Backpack", "Sunglasses", "Flashlight",
  "Hourglass", "Typewriter", "Microwave", "Submarine", "Skateboard", "Helicopter", "Compass",
  "Volcano", "Waterfall", "Pyramid", "Lighthouse", "Castle", "Rainforest", "Glacier",
  "Island", "Desert", "Space Station", "Windmill", "Graveyard", "Cave", "Bridge",
  "Dragon", "Unicorn", "Superhero", "Wizard", "Zombie", "Robot", "Alien", 
  "Pirate", "Vampire", "Ninja", "Ghost", "Monster", "Mermaid", "Mummy",
  "Dancing", "Fishing", "Skydiving", "Camping", "Cooking", "Juggling", "Climbing",
  "Painting", "Sleeping", "Surfing", "Bowling", "Boxing", "Gardening", "Singing"
];

const rooms = {};
const monopolyRooms = {};

const getRandomWords = (count = 3) => {
  const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateInitialMask = (word) => {
  return word.split('').map(char => (char === ' ' ? ' ' : '_')).join(' ');
};

const revealHintLetter = (word, currentMasked) => {
  const maskArray = currentMasked.split(' ');
  const unrevealedIndices = [];

  for (let i = 0; i < word.length; i++) {
    if (word[i] !== ' ' && maskArray[i] === '_') {
      unrevealedIndices.push(i);
    }
  }

  if (unrevealedIndices.length === 0) return currentMasked;

  const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
  maskArray[randomIndex] = word[randomIndex];

  return maskArray.join(' ');
};

// LOGIC FIX: Clone the room and only delete the interval to prevent stripping game data
const getSanitizedRoomState = (room) => {
  const sanitized = { ...room };
  delete sanitized.interval; 
  return sanitized;
};

const startNextTurn = (roomCode) => {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.interval) clearInterval(room.interval);

  if (room.drawerIndex >= room.playerQueue.length) {
    room.drawerIndex = 0;
    room.currentRound += 1;
  }

  if (room.currentRound > room.settings.totalRounds) {
    room.gameState = 'game_over';
    io.in(roomCode).emit('game_over', {
      scores: room.scores,
      players: room.players
    });
    return;
  }

  const currentDrawerId = room.playerQueue[room.drawerIndex];
  room.currentDrawer = currentDrawerId;
  room.gameState = 'selecting_word';
  room.wordOptions = getRandomWords(3);
  room.guessedPlayers = [];

  io.in(roomCode).emit('turn_setup', {
    drawerId: currentDrawerId,
    gameState: 'selecting_word',
    wordOptions: room.wordOptions,
    currentRound: room.currentRound,
    totalRounds: room.settings.totalRounds
  });
};

const startTurnTimer = (roomCode) => {
  const room = rooms[roomCode];
  if (!room) return;

  room.gameState = 'drawing';
  const timeLimit = room.settings.timeLimit || 60;
  room.timer = timeLimit;

  room.maskedWord = generateInitialMask(room.secretWord);
  room.hintsGiven = 0;

  const hintInterval = Math.floor(timeLimit / 4);

  io.in(roomCode).emit('round_start', {
    drawerId: room.currentDrawer,
    maskedWord: room.maskedWord,
    timeLimit: room.timer
  });

  room.interval = setInterval(() => {
    room.timer -= 1;

    const timeElapsed = timeLimit - room.timer;

    if (
      room.hintsGiven < 3 &&
      timeElapsed > 0 &&
      timeElapsed % hintInterval === 0 &&
      room.timer > 5
    ) {
      room.maskedWord = revealHintLetter(room.secretWord, room.maskedWord);
      room.hintsGiven += 1;
    }

    io.in(roomCode).emit('timer_tick', {
      time: room.timer,
      maskedWord: room.maskedWord
    });

    if (room.timer <= 0) {
      clearInterval(room.interval);
      endTurn(roomCode, "Time's up!");
    }
  }, 1000);
};

const endTurn = (roomCode, reason) => {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.interval) clearInterval(room.interval);
  room.gameState = 'round_end';

  io.in(roomCode).emit('round_over', {
    reason,
    secretWord: room.secretWord,
    scores: room.scores,
    currentRound: room.currentRound,
    totalRounds: room.settings.totalRounds
  });

  room.drawerIndex += 1;

  setTimeout(() => {
    if (rooms[roomCode]) {
      startNextTurn(roomCode);
    }
  }, 4000);
};

io.on('connection', (socket) => {
  registerGuessHandlers(io, socket);

  // MONOPOLY HANDLERS
  socket.on("join_monopoly_room", ({ room, username }) => {
    const roomCode = room || 'MONO1';
    socket.join(roomCode);

    if (!monopolyRooms[roomCode]) {
      monopolyRooms[roomCode] = {
        slots: { '0': socket.id, '1': null },
        names: { '0': username || 'Player 1', '1': 'Player 2' }
      };
      socket.emit("monopoly_slot_assigned", { slotId: '0' });
    } else {
      const mRoom = monopolyRooms[roomCode];
      if (!mRoom.slots['0']) {
        mRoom.slots['0'] = socket.id;
        mRoom.names['0'] = username || 'Player 1';
        socket.emit("monopoly_slot_assigned", { slotId: '0' });
      } else if (!mRoom.slots['1'] && mRoom.slots['0'] !== socket.id) {
        mRoom.slots['1'] = socket.id;
        mRoom.names['1'] = username || 'Player 2';
        socket.emit("monopoly_slot_assigned", { slotId: '1' });
      } else if (mRoom.slots['0'] === socket.id) {
        socket.emit("monopoly_slot_assigned", { slotId: '0' });
      } else if (mRoom.slots['1'] === socket.id) {
        socket.emit("monopoly_slot_assigned", { slotId: '1' });
      }
    }
  });

  socket.on("monopoly_state_change", ({ room, state }) => {
    socket.to(room).emit("update_monopoly_state", state);
  });

  // SKRIBBL HANDLERS
  socket.on("join_room", (data) => {
    const { room, username } = typeof data === 'object' ? data : { room: data, username: 'Player' };
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        host: socket.id,
        players: {},
        playerQueue: [],
        drawerIndex: 0,
        settings: { timeLimit: 60, hints: 3, totalRounds: 3 },
        gameState: 'lobby',
        currentDrawer: null,
        secretWord: '',
        maskedWord: '',
        hintsGiven: 0,
        wordOptions: [],
        currentRound: 1,
        scores: {},
        guessedPlayers: [],
        timer: 60,
        interval: null
      };
    }

    rooms[room].players[socket.id] = { id: socket.id, name: username || 'Player' };
    if (!rooms[room].scores[socket.id]) {
      rooms[room].scores[socket.id] = 0;
    }
    if (!rooms[room].playerQueue.includes(socket.id)) {
      rooms[room].playerQueue.push(socket.id);
    }

    io.in(room).emit("room_data", { roomState: getSanitizedRoomState(rooms[room]), hostId: rooms[room].host });
  });

  // CHAT & GUESS SYSTEM LOGIC FIX
  socket.on("send_message", ({ room, message, username }) => {
    const roomState = rooms[room];
    if (!roomState || !message) return;

    const trimmedMsg = message.trim();
    if (trimmedMsg.length === 0) return;

    if (roomState.gameState === 'drawing') {
      const isDrawer = socket.id === roomState.currentDrawer;
      const isCorrectGuess = !isDrawer && 
        trimmedMsg.toLowerCase() === roomState.secretWord.toLowerCase() &&
        !roomState.guessedPlayers.includes(socket.id);

      if (isCorrectGuess) {
        roomState.guessedPlayers.push(socket.id);
        
        const points = Math.max(50, roomState.timer * 10);
        roomState.scores[socket.id] = (roomState.scores[socket.id] || 0) + points;
        
        if (roomState.currentDrawer) {
          roomState.scores[roomState.currentDrawer] = (roomState.scores[roomState.currentDrawer] || 0) + 25;
        }

        io.in(room).emit("receive_message", {
          id: Date.now() + Math.random(),
          system: true,
          text: `🎉 ${username || 'A player'} guessed the word!`
        });

        io.in(room).emit("room_data", { roomState: getSanitizedRoomState(roomState), hostId: roomState.host });

        const totalGuessers = roomState.playerQueue.length - 1;
        if (roomState.guessedPlayers.length >= Math.max(1, totalGuessers)) {
          endTurn(room, "Everyone guessed the word!");
        }
        return;
      }
    }

    io.in(room).emit("receive_message", {
      id: Date.now() + Math.random(),
      username: username || 'Player',
      text: trimmedMsg,
      system: false
    });
  });

  socket.on("update_settings", ({ room, settings }) => {
    if (rooms[room]) {
      rooms[room].settings = settings;
      io.in(room).emit("settings_updated", settings);
    }
  });

  socket.on("start_skribbl", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.gameState = 'selecting_word';
    room.currentRound = 1;
    room.drawerIndex = 0;
    
    Object.keys(room.players).forEach(id => {
      room.scores[id] = 0;
    });

    startNextTurn(roomCode);
  });

  socket.on("word_selected", ({ room, word }) => {
    if (rooms[room]) {
      rooms[room].secretWord = word;
      startTurnTimer(room);
    }
  });

  socket.on("send_draw", (data) => socket.to(data.room).emit("receive_draw", data));
  socket.on("clear_canvas", (room) => socket.to(room).emit("receive_clear"));

  socket.on("reset_to_lobby", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.interval) clearInterval(room.interval);
    room.gameState = 'lobby';
    io.in(roomCode).emit("room_data", { roomState: getSanitizedRoomState(room), hostId: room.host });
  });

  socket.on("disconnect", () => {
    Object.keys(monopolyRooms).forEach(code => {
      if (monopolyRooms[code].slots['0'] === socket.id) monopolyRooms[code].slots['0'] = null;
      if (monopolyRooms[code].slots['1'] === socket.id) monopolyRooms[code].slots['1'] = null;
    });

    Object.keys(rooms).forEach(roomCode => {
      const room = rooms[roomCode];
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        delete room.scores[socket.id];
        room.playerQueue = room.playerQueue.filter(id => id !== socket.id);

        if (Object.keys(room.players).length === 0) {
          if (room.interval) clearInterval(room.interval);
          delete rooms[roomCode];
        } else {
          if (room.host === socket.id) {
            room.host = Object.keys(room.players)[0];
          }
          io.in(roomCode).emit("room_data", { roomState: getSanitizedRoomState(room), hostId: room.host });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Unified Game Server running on port ${PORT}`));  