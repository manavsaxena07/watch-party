const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running ok");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // CREATE ROOM - both names support
  const handleCreate = ({ username }) => {
    if (!username) return;
    const roomId = generateRoomCode();
    rooms[roomId] = { videoId: "", playState: "paused", currentTime: 0, participants: {} };
    rooms[roomId].participants[socket.id] = { username, userId: socket.id, role: "Host" };
    socket.join(roomId);
    console.log(`Room Created ${roomId} by ${username}`);
    socket.emit("roomCreated", { roomId, roomCode: roomId });
    socket.emit("room-created", { roomId, roomCode: roomId });
  };

  socket.on("createRoom", handleCreate);
  socket.on("create_room", handleCreate);
  socket.on("create-room", handleCreate);

  // JOIN ROOM - both names support
  const handleJoin = ({ roomId, roomCode, username }) => {
    const finalId = (roomId || roomCode || "").toUpperCase();
    if (!finalId ||!username) return;
    if (!rooms[finalId]) {
      socket.emit("room-error", "Room not found");
      return;
    }
    rooms[finalId].participants[socket.id] = { username, userId: socket.id, role: "Participant" };
    socket.join(finalId);
    socket.emit("sync_state", {
      videoId: rooms[finalId].videoId,
      playState: rooms[finalId].playState,
      currentTime: rooms[finalId].currentTime,
    });
    socket.emit("roomJoined", { roomId: finalId, roomCode: finalId });
    socket.emit("room-joined", { roomId: finalId, roomCode: finalId });
    io.to(finalId).emit("user_joined", {
      username, userId: socket.id,
      role: rooms[finalId].participants[socket.id].role,
      participants: Object.values(rooms[finalId].participants),
    });
  };

  socket.on("join_room", handleJoin);
  socket.on("joinRoom", handleJoin);
  socket.on("join-room", handleJoin);

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
    // cleanup rooms
    for (const rId in rooms) {
      if (rooms[rId].participants[socket.id]) {
        delete rooms[rId].participants[socket.id];
        io.to(rId).emit("user_left", { userId: socket.id, participants: Object.values(rooms[rId].participants) });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
