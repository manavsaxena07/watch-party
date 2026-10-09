const {
    getRoom
} = require("../rooms/roomManager");



function roleEvent(io, socket) {




// =========================
// ASSIGN ROLE
// Host -> Participant / Moderator
// =========================


socket.on(
    "assign_role",
    ({ roomId, targetSocketId, role }) => {


        roomId =
        roomId.trim().toUpperCase();



        const room =
        getRoom(roomId);



        if(!room)
            return;



        const user =
        room.users.find(
            u => u.socketId === socket.id
        );



        if(!user)
            return;



        if(user.role !== "Host")
            return;




        const targetUser =
        room.users.find(
            u => u.socketId === targetSocketId
        );



        if(!targetUser)
            return;



        if(
            role !== "Moderator" &&
            role !== "Participant"
        ){
            return;
        }




        targetUser.role =
        role;




        io.to(roomId).emit(
            "room_updated",
            room
        );




        console.log(
            "Role changed:",
            targetUser.username,
            role
        );


    }
);









// =========================
// REMOVE USER
// Host removes user
// =========================


socket.on(
    "remove_user",
    ({ roomId, targetSocketId }) => {


        roomId =
        roomId.trim().toUpperCase();




        const room =
        getRoom(roomId);



        if(!room)
            return;




        const user =
        room.users.find(
            u => u.socketId === socket.id
        );



        if(
            !user ||
            user.role !== "Host"
        )
            return;





        if(targetSocketId === socket.id)
            return;





        const targetUser =
        room.users.find(
            u => u.socketId === targetSocketId
        );



        if(!targetUser)
            return;





        // Remove user from room data

        room.users =
        room.users.filter(
            u => u.socketId !== targetSocketId
        );





        // Send remove event once

        io.to(targetSocketId).emit(
            "removed_from_room"
        );





        // Remove socket from room

        const targetSocket =
        io.sockets.sockets.get(
            targetSocketId
        );



        if(targetSocket){

            targetSocket.leave(
                roomId
            );

        }





        // Update remaining members

        io.to(roomId).emit(
            "room_updated",
            room
        );




        console.log(
            "User removed:",
            targetUser.username
        );


    }
);









// =========================
// TRANSFER HOST
// =========================


socket.on(
    "transfer_host",
    ({ roomId, targetSocketId }) => {


        roomId =
        roomId.trim().toUpperCase();




        const room =
        getRoom(roomId);



        if(!room)
            return;





        const currentHost =
        room.users.find(
            u => u.socketId === socket.id
        );



        if(
            !currentHost ||
            currentHost.role !== "Host"
        )
            return;






        const newHost =
        room.users.find(
            u => u.socketId === targetSocketId
        );



        if(!newHost)
            return;






        currentHost.role =
        "Participant";



        newHost.role =
        "Host";



        room.host =
        targetSocketId;







        io.to(roomId).emit(
            "room_updated",
            room
        );






        console.log(
            "Host transferred:",
            newHost.username
        );


    }
);



}



module.exports = roleEvent;