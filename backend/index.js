const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {}; // { roomCode: { participants: {socketId: {username, role}}, videoId } }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ roomId, roomCode, username }) => {
    const code = roomCode || roomId;
    socket.join(code);

    if (!rooms[code]) {
      rooms[code] = { participants: {}, videoId: "dQw4w9WgXcQ" };
    }

    // Pehla user Host, baki Participant
    const isFirst = Object.keys(rooms[code].participants).length === 0;
    const role = isFirst? "Host" : "Participant";

    rooms[code].participants[socket.id] = {
      id: socket.id,
      username: username || "Guest",
      role
    };

    // Sabko users ki list bhejo
    io.to(code).emit("user_joined", { participants: Object.values(rooms[code].participants) });
    io.to(code).emit("sync_state", {
      participants: rooms[code].participants,
      videoId: rooms[code].videoId
    });

    // Is user ko uska role batao
    socket.emit("role_assigned", { role, participants: Object.values(rooms[code].participants) });
    console.log(`${username} joined ${code} as ${role}`);
  });

  socket.on("change_video", ({ roomId, roomCode, videoId }) => {
    const code = roomCode || roomId;
    if (rooms[code]) {
      rooms[code].videoId = videoId;
      io.to(code).emit("video_changed", { videoId });
    }
  });

  // YEHI WALA MISSING THA - isse sync hoga
  socket.on("video_action", ({ roomId, roomCode, action, time }) => {
    const code = roomCode || roomId;
    // Host/Moderator ne jo kiya wo sabko bhejo (sender ko chod ke)
    socket.to(code).emit("video_action", { action, time });
  });

  socket.on("send_message", ({ roomId, roomCode, message, username }) => {
    const code = roomCode || roomId;
    socket.to(code).emit("receive_message", { username, message });
  });

  socket.on("make_moderator", ({ roomCode, targetId }) => {
    if (rooms[roomCode] && rooms[roomCode].participants[socket.id]?.role === "Host") {
      if (rooms[roomCode].participants[targetId]) {
        rooms[roomCode].participants[targetId].role = "Moderator";
        io.to(roomCode).emit("role_assigned", { participants: Object.values(rooms[roomCode].participants) });
        io.to(targetId).emit("role_assigned", { role: "Moderator" });
      }
    }
  });

  socket.on("remove_participant", ({ roomCode, targetId }) => {
    if (rooms[roomCode] && rooms[roomCode].participants[socket.id]?.role === "Host") {
      io.to(targetId).emit("participant_removed");
      const targetSocket = io.sockets.sockets.get(targetId);
      if (targetSocket) {
        targetSocket.leave(roomCode);
        delete rooms[roomCode].participants[targetId];
        io.to(roomCode).emit("user_joined", { participants: Object.values(rooms[roomCode].participants) });
      }
    }
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      if (rooms[code].participants[socket.id]) {
        delete rooms[code].participants[socket.id];
        io.to(code).emit("user_joined", { participants: Object.values(rooms[code].participants) });
        if (Object.keys(rooms[code].participants).length === 0) delete rooms[code];
        break;
      }
    }
  });
});

app.get("/", (req, res) => res.send("Watch Party Backend Running"));

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));