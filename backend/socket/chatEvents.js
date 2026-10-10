module.exports = (io, socket, rooms) => {
  socket.on("send_message", ({ roomCode, roomId, message, username }) => {
    const finalId = (roomCode || roomId || "").toUpperCase();
    if (!finalId) return;
    io.to(finalId).emit("receive_message", { 
      message, 
      username, 
      userId: socket.id 
    });
  });
};
