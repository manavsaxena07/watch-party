const roomEvents = require("./roomEvents");
const roleEvent = require("./roleEvent");
const videoEvent = require("./videoEvents");


function socketHandler(io){


    io.on(
        "connection",
        (socket)=>{


            console.log(
                "User Connected:",
                socket.id
            );



            roomEvents(
                io,
                socket
            );


            videoEvent(
                io,
                socket
            );


            roleEvent(
                io,
                socket
            );


            socket.on(
                "disconnect",
                ()=>{


                    console.log(
                        "User Disconnected:",
                        socket.id
                    );


                }
            );



        }
    );


}



module.exports = socketHandler;