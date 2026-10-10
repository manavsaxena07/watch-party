module.exports = (io, socket, rooms) => {
  // Video change
  socket.on("change_video", ({ roomCode, videoId }) => {
    if (rooms[roomCode]) {
      rooms[roomCode].videoId = videoId;
      io.to(roomCode).emit("video_changed", { videoId });
      console.log(`Video changed in ${roomCode}: ${videoId}`);
    }
  });

  // Play / Pause / Seek Sync
  socket.on("player_action", ({ roomCode, action, time }) => {
    // action = "play", "pause", "seek"
    socket.to(roomCode).emit("player_action", { action, time });
  });
};
