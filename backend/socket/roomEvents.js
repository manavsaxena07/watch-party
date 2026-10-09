const {
    createRoom,
    joinRoom,
    getRoom
} = require("../rooms/roomManager");



function roomEvents(io, socket) {



//create room



socket.on("createRoom", ({ username }) => {
  const roomCode = Math.random().toString(36).substring(2,8).toUpperCase();
  console.log("Room Created:", roomCode);
  
  socket.join(roomCode);
  
  const roomData = {
    roomCode: roomCode,
    users: [{ id: socket.id, username, isHost: true }],
    video: { videoId: "", isPlaying: false }
  };
  
  // YE 2 LINE SABSE JARURI HAI - Isi se loading hatega
  socket.emit("roomCreated", roomCode);
  io.to(roomCode).emit("roomUpdated", roomData); 
  socket.emit("roomUpdated", roomData);
});








// =========================
// JOIN ROOM
// =========================


socket.on(
    "join_room",
    ({ roomId, username }) => {


        roomId =
            roomId.trim().toUpperCase();



        const room =
            joinRoom(
                roomId,
                socket.id,
                username
            );



        if (!room) {


            socket.emit(
                "error",
                "Room not found"
            );


            return;

        }





        socket.join(
            roomId
        );






        // Update existing users only

        socket.to(roomId).emit(
            "room_updated",
            room
        );





        // Send joining user data

        socket.emit(
            "join_success",
            room
        );



        socket.emit(
            "room_updated",
            room
        );





        // Send current video state

        socket.emit(
            "sync_state",
            {
                videoId: room.video.videoId,
                currentTime: room.video.currentTime,
                playing: room.video.playing
            }
        );



    }
);









// =========================
// GET ROOM
// =========================


socket.on(
    "get_room",
    ({ roomId }) => {


        roomId =
            roomId.trim().toUpperCase();




        const room =
            getRoom(roomId);



        if (!room) {


            socket.emit(
                "error",
                "Room not found"
            );


            return;

        }





        socket.emit(
            "room_updated",
            room
        );





        socket.emit(
            "sync_state",
            {
                videoId: room.video.videoId,
                currentTime: room.video.currentTime,
                playing: room.video.playing
            }
        );



    }
);





}



module.exports = roomEvents;