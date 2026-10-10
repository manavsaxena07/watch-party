const { rooms, generateRoomCode } = require("../rooms/roomManager");

module.exports = (io, socket) => {

  const createHandler = ({ username }) => {
    if (!username) username = "Guest";
    const roomId = generateRoomCode();
    rooms[roomId] = { videoId: "", playState: "paused", currentTime: 0, participants: {} };
    rooms[roomId].participants[socket.id] = { username, userId: socket.id, role: "Host" };
    socket.join(roomId);
    console.log(`Room Created ${roomId} by ${username}`);
    socket.emit("roomCreated", { roomId, roomCode: roomId });
  };

  const joinHandler = ({ roomId, roomCode, username }) => {
    const finalId = (roomId || roomCode || "").toUpperCase().trim();
    if (!rooms[finalId]) {
      socket.emit("room-error", "Room not found");
      return;
    }
    rooms[finalId].participants[socket.id] = { username, userId: socket.id, role: "Participant" };
    socket.join(finalId);
    socket.emit("sync_state", rooms[finalId]);
    socket.emit("roomJoined", { roomId: finalId, roomCode: finalId });
    io.to(finalId).emit("user_joined", { username, userId: socket.id, participants: Object.values(rooms[finalId].participants) });
  };

  socket.on("createRoom", createHandler);
  socket.on("create_room", createHandler);

  socket.on("joinRoom", joinHandler);
  socket.on("join_room", joinHandler);
};
