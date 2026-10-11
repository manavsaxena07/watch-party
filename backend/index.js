const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {}; // roomId -> { videoId, isPlaying, currentTime, participants: {} }

io.on('connection', (socket) => {
  console.log('connected', socket.id);

  socket.on('join_room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { videoId: 'dQw4w9WgXcQ', isPlaying: false, currentTime: 0, hostId: socket.id, participants: {} };
    }
    const role = Object.keys(rooms[roomId].participants).length === 0? 'Host' : 'Participant';
    rooms[roomId].participants[socket.id] = { userId: socket.id, username: username || 'User', role };

    // agar pehla user hai to wahi host
    if (role === 'Host') rooms[roomId].hostId = socket.id;

    io.to(roomId).emit('user_joined', { userId: socket.id, username, role, participants: Object.values(rooms[roomId].participants) });
    io.to(roomId).emit('sync_state', rooms[roomId]);
    socket.emit('role_assigned', { role });
  });

  const checkPermission = (roomId, socketId) => {
    const room = rooms[roomId];
    if (!room) return false;
    const user = room.participants[socketId];
    return user && (user.role === 'Host' || user.role === 'Moderator');
  };

  socket.on('play', ({ roomId }) => {
    if (!checkPermission(roomId, socket.id)) return socket.emit('error_msg', 'Only Host/Moderator can control');
    if (rooms[roomId]) { rooms[roomId].isPlaying = true; io.to(roomId).emit('play'); }
  });

  socket.on('pause', ({ roomId }) => {
    if (!checkPermission(roomId, socket.id)) return;
    if (rooms[roomId]) { rooms[roomId].isPlaying = false; io.to(roomId).emit('pause'); }
  });

  socket.on('seek', ({ roomId, time }) => {
    if (!checkPermission(roomId, socket.id)) return;
    if (rooms[roomId]) { rooms[roomId].currentTime = time; io.to(roomId).emit('seek', { time }); }
  });

  socket.on('change_video', ({ roomId, videoId }) => {
    if (!checkPermission(roomId, socket.id)) return;
    if (rooms[roomId]) { rooms[roomId].videoId = videoId; io.to(roomId).emit('sync_state', rooms[roomId]); }
  });

  socket.on('assign_role', ({ roomId, userId, role }) => {
    const room = rooms[roomId];
    if (!room || room.participants[socket.id]?.role!== 'Host') return;
    if (room.participants[userId]) {
      room.participants[userId].role = role;
      io.to(roomId).emit('role_assigned', { userId, username: room.participants[userId].username, role, participants: Object.values(room.participants) });
    }
  });

  socket.on('remove_participant', ({ roomId, userId }) => {
    const room = rooms[roomId];
    if (!room || room.participants[socket.id]?.role!== 'Host') return;
    io.to(userId).emit('participant_removed', { roomId });
    if (room.participants[userId]) delete room.participants[userId];
    io.to(roomId).emit('user_left', { userId, participants: Object.values(room.participants) });
  });

  socket.on('send_message', ({ roomId, message, username }) => {
    io.to(roomId).emit('receive_message', { username, message });
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      if (rooms[roomId].participants[socket.id]) {
        delete rooms[roomId].participants[socket.id];
        io.to(roomId).emit('user_left', { userId: socket.id, participants: Object.values(rooms[roomId].participants) });
      }
    }
  });
});

app.get('/', (req,res)=>res.send('Watch Party Backend Running'));
const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log('Server on '+PORT));