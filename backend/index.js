const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=> res.send('Backend OK'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET","POST"] }
});

let rooms = {};

function getRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const createHandler = (data) => {
    const username = data?.username || data?.name || "Manav";
    const roomCode = getRoomCode();
    socket.join(roomCode);
    rooms[roomCode] = {
      code: roomCode,
      users: [{ id: socket.id, username, isHost: true }],
      videoUrl: "",
      playing: false,
      currentTime: 0
    };
    console.log(`Room created: ${roomCode} by ${username}`);
    // jitne bhi naam frontend sun sakta hai sab bhej do
    socket.emit("roomCreated", roomCode);
    socket.emit("room-created", roomCode);
    socket.emit("room-joined", { roomCode, users: rooms[roomCode].users });
    socket.emit("roomJoined", { roomCode, roomId: roomCode, users: rooms[roomCode].users });
    socket.emit("updateUsers", rooms[roomCode].users);
    socket.emit("joinedRoom", rooms[roomCode]);
  };

  socket.on("createRoom", createHandler);
  socket.on("create-room", createHandler);

  socket.on("joinRoom", ({ roomCode, username }) => {
    const code = (roomCode || "").toUpperCase();
    if (!rooms[code]) {
      socket.emit("error", "Room not found");
      socket.emit("room-error", "Room not found");
      return;
    }
    socket.join(code);
    rooms[code].users.push({ id: socket.id, username });
    socket.emit("roomJoined", { roomCode: code, users: rooms[code].users });
    socket.emit("room-joined", { roomCode: code, users: rooms[code].users });
    socket.emit("joinedRoom", rooms[code]);
    io.to(code).emit("updateUsers", rooms[code].users);
    io.to(code).emit("userJoined", rooms[code].users);
    console.log(`${username} joined ${code}`);
  });

  socket.on("join-room", (data) => {
    const code = (data?.roomCode || data?.code || "").toUpperCase();
    const username = data?.username || "Guest";
    if (!rooms[code]) {
      socket.emit("room-error", "Room not found");
      return;
    }
    socket.join(code);
    rooms[code].users.push({ id: socket.id, username });
    socket.emit("room-joined", { roomCode: code, users: rooms[code].users });
    io.to(code).emit("updateUsers", rooms[code].users);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const code in rooms) {
      rooms[code].users = rooms[code].users.filter(u => u.id!== socket.id);
      io.to(code).emit("updateUsers", rooms[code].users);
    }
  });
});

server.listen(8000, () => console.log("Server running on port 8000"));