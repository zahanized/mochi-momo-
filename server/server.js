require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const managerRoutes = require('./routes/managerRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

connectDB();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/api/manager', managerRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('joinRoom', ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;
    console.log(`${userName} joined room ${roomId}`);

    socket.to(roomId).emit('userJoined', { userName });
  });

  socket.on('sendMessage', ({ roomId, message, userName }) => {
    io.to(roomId).emit('receiveMessage', {
      message,
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.data.roomId) {
      socket.to(socket.data.roomId).emit('userLeft', {
        userName: socket.data.userName,
      });
    }
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});