const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Backend Running OK'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join_room", ({ roomId, username }) => {
    if (!roomId ||!username) return;
    roomId = roomId.toUpperCase();
    if (!rooms[roomId]) {
      rooms[roomId] = { videoId: "", playState: "paused", currentTime: 0, participants: {} };
      rooms[roomId].participants[socket.id] = { username, userId: socket.id, role: "Host" };
    } else {
      rooms[roomId].participants[socket.id] = { username, userId: socket.id, role: "Participant" };
    }
    socket.join(roomId);
    socket.emit("sync_state", {
      videoId: rooms[roomId].videoId,
      playState: rooms[roomId].playState,
      currentTime: rooms[roomId].currentTime
    });
    io.to(roomId).emit("user_joined", {
      username, userId: socket.id,
      role: rooms[roomId].participants[socket.id].role,
      participants: Object.values(rooms[roomId].participants)
    });
  });

  socket.on("leave_room", ({ roomId }) => {
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (rooms[roomId]?.participants[socket.id]) {
      const left = rooms[roomId].participants[socket.id];
      delete rooms[roomId].participants[socket.id];
      socket.leave(roomId);
      io.to(roomId).emit("user_left", {
        username: left.username,
        userId: socket.id,
        participants: Object.values(rooms[roomId].participants)
      });
    }
  });

  function isHostOrModerator(roomId) {
    const p = rooms[roomId]?.participants[socket.id];
    return p && (p.role === "Host" || p.role === "Moderator");
  }

  socket.on("play", (data = {}) => {
    let roomId = data.roomId;
    if (!roomId) { for (const r in rooms) if (rooms[r].participants[socket.id]) { roomId = r; break; } }
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (isHostOrModerator(roomId)) {
      if (data.time!== undefined) rooms[roomId].currentTime = data.time;
      rooms[roomId].playState = "playing";
      io.to(roomId).emit("sync_state", {
        videoId: rooms[roomId].videoId,
        playState: "playing",
        currentTime: rooms[roomId].currentTime
      });
    }
  });

  socket.on("pause", (data = {}) => {
    let roomId = data.roomId;
    if (!roomId) { for (const r in rooms) if (rooms[r].participants[socket.id]) { roomId = r; break; } }
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (isHostOrModerator(roomId)) {
      if (data.time!== undefined) rooms[roomId].currentTime = data.time;
      rooms[roomId].playState = "paused";
      io.to(roomId).emit("sync_state", {
        videoId: rooms[roomId].videoId,
        playState: "paused",
        currentTime: rooms[roomId].currentTime
      });
    }
  });

  socket.on("seek", ({ roomId, time }) => {
    if (!roomId) { for (const r in rooms) if (rooms[r].participants[socket.id]) { roomId = r; break; } }
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (isHostOrModerator(roomId)) {
      rooms[roomId].currentTime = time;
      io.to(roomId).emit("sync_state", {
        videoId: rooms[roomId].videoId,
        playState: rooms[roomId].playState,
        currentTime: time
      });
    }
  });

  socket.on("change_video", ({ roomId, videoId }) => {
    if (!roomId) { for (const r in rooms) if (rooms[r].participants[socket.id]) { roomId = r; break; } }
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (isHostOrModerator(roomId)) {
      rooms[roomId].videoId = videoId;
      rooms[roomId].currentTime = 0;
      rooms[roomId].playState = "paused";
      io.to(roomId).emit("sync_state", { videoId, playState: "paused", currentTime: 0 });
    }
  });

  socket.on("assign_role", ({ roomId, userId, role }) => {
    if (!roomId) { for (const r in rooms) if (rooms[r].participants[socket.id]?.role === "Host") { roomId = r; break; } }
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (rooms[roomId]?.participants[socket.id]?.role === "Host" && rooms[roomId].participants[userId]) {
      rooms[roomId].participants[userId].role = role;
      io.to(roomId).emit("role_assigned", {
        userId, username: rooms[roomId].participants[userId].username, role,
        participants: Object.values(rooms[roomId].participants)
      });
    }
  });

  socket.on("remove_participant", ({ roomId, userId }) => {
    if (!roomId) { for (const r in rooms) if (rooms[r].participants[socket.id]?.role === "Host") { roomId = r; break; } }
    if (!roomId) return;
    roomId = roomId.toUpperCase();
    if (rooms[roomId]?.participants[socket.id]?.role === "Host" && rooms[roomId].participants[userId]) {
      const target = io.sockets.sockets.get(userId);
      if (target) target.leave(roomId);
      delete rooms[roomId].participants[userId];
      io.to(roomId).emit("participant_removed", { userId, participants: Object.values(rooms[roomId].participants) });
      io.to(userId).emit("participant_removed", { userId, participants: [] });
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId].participants[socket.id]) {
        const left = rooms[roomId].participants[socket.id];
        delete rooms[roomId].participants[socket.id];
        io.to(roomId).emit("user_left", {
          username: left.username,
          userId: socket.id,
          participants: Object.values(rooms[roomId].participants)
        });
      }
    }
  });
});

server.listen(process.env.PORT || 8000, () => console.log("Server running on", process.env.PORT || 8000));