require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const managerRoutes = require('./routes/managerRoutes');
const roomRoutes = require('./routes/roomRoutes');
const pomodoroRoutes = require('./routes/pomodoroRoutes');
const scratchpadRoutes = require('./routes/scratchpadRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io);

connectDB();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/timer', pomodoroRoutes);
app.use('/api/scratchpad', scratchpadRoutes);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('joinRoom', ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;
    console.log(`${userName} joined room ${roomId}`);

    socket.to(roomId).emit('userJoined', { userName });

    // Hand the newcomer everyone's current availability status (FR-3.12-1)
    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    const existingStatuses = [];
    if (roomSockets) {
      for (const socketId of roomSockets) {
        if (socketId === socket.id) continue;
        const other = io.sockets.sockets.get(socketId);
        if (other?.data?.status) {
          existingStatuses.push({ userName: other.data.userName, status: other.data.status });
        }
      }
    }
    socket.emit('existingStatuses', existingStatuses);
  });

  socket.on('setStatus', ({ roomId, userName, status }) => {
    socket.data.status = status;
    socket.to(roomId).emit('statusUpdate', { userName, status });
  });

  socket.on('sendMessage', ({ roomId, message, userName }) => {
    io.to(roomId).emit('receiveMessage', {
      message,
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('videoReady', ({ roomId, peerId, userName }) => {
    socket.data.peerId = peerId;

    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    const existingPeers = [];
    if (roomSockets) {
      for (const socketId of roomSockets) {
        if (socketId === socket.id) continue;
        const other = io.sockets.sockets.get(socketId);
        if (other?.data?.peerId) {
          existingPeers.push({ peerId: other.data.peerId, userName: other.data.userName });
        }
      }
    }

    socket.emit('existingPeers', existingPeers);
    socket.to(roomId).emit('newPeer', { peerId, userName });
  });

  socket.on('leaveRoom', ({ roomId, userName }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('userLeft', { userName });
    if (socket.data.peerId) {
      socket.to(roomId).emit('peerLeft', { peerId: socket.data.peerId });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.data.roomId) {
      socket.to(socket.data.roomId).emit('userLeft', {
        userName: socket.data.userName,
      });
      if (socket.data.peerId) {
        socket.to(socket.data.roomId).emit('peerLeft', { peerId: socket.data.peerId });
      }
    }
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});