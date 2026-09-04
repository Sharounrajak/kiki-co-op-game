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

const rooms = {};
const monopolyRooms = {};

io.on('connection', (socket) => {
  // 1. REGISTER GUESS WHO HANDLERS
  registerGuessHandlers(io, socket);

  // 2. MONOPOLY ROOM & SLOT MANAGERS
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
        socket.emit("monopoly_slot_assigned", { slotId: '0' });
      } else if (!mRoom.slots['1'] && mRoom.slots['0'] !== socket.id) {
        mRoom.slots['1'] = socket.id;
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
    }

    rooms[room].players[socket.id] = { id: socket.id, name: username || 'Player' };
    io.in(room).emit("room_data", { roomState: rooms[room], hostId: rooms[room].host });
  });

  socket.on("send_draw", (data) => socket.to(data.room).emit("receive_draw", data));
  socket.on("clear_canvas", (room) => socket.to(room).emit("receive_clear"));

  socket.on("disconnect", () => {
    Object.keys(monopolyRooms).forEach(code => {
      if (monopolyRooms[code].slots['0'] === socket.id) monopolyRooms[code].slots['0'] = null;
      if (monopolyRooms[code].slots['1'] === socket.id) monopolyRooms[code].slots['1'] = null;
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Unified Game Server running on port ${PORT}`));