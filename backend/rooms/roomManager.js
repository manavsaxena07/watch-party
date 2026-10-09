const generateRoomCode = require("../utils/generateRomeCode");

const rooms = new Map();




// =========================
// CREATE ROOM
// =========================

function createRoom(socketId, username) {


    let roomId = generateRoomCode();



    while(rooms.has(roomId)){

        roomId = generateRoomCode();

    }




    const room = {


        roomId,


        host: socketId,



        users:[

            {
                socketId,

                username: username || "Guest",

                role:"Host"
            }

        ],




        video:{


            videoId:"",

            currentTime:0,

            playing:false


        }


    };




    rooms.set(
        roomId,
        room
    );



    return room;


}









// =========================
// JOIN ROOM
// =========================

function joinRoom(roomId, socketId, username){



    const room =
    rooms.get(roomId);



    if(!room){

        return null;

    }





    const existingUser =
    room.users.find(
        user =>
        user.socketId === socketId
    );





    if(!existingUser){


        room.users.push({

            socketId,


            username: username || "Guest",


            role:"Participant"


        });


    }




    return room;


}









// =========================
// GET ROOM
// =========================


function getRoom(roomId){


    return rooms.get(roomId);


}









// =========================
// DELETE ROOM
// =========================

function deleteRoom(roomId){


    rooms.delete(roomId);


}









// =========================
// UPDATE HOST
// =========================


function updateHost(roomId, newHostId){



    const room =
    rooms.get(roomId);



    if(!room)

        return null;





    room.host =
    newHostId;





    room.users.forEach(
        user => {


            if(user.socketId === newHostId){


                user.role =
                "Host";


            }
            else if(user.role === "Host"){


                user.role =
                "Participant";


            }


        }
    );





    return room;


}









module.exports = {


    createRoom,

    joinRoom,

    getRoom,

    deleteRoom,

    updateHost


};