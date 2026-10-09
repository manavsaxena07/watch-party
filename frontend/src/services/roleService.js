import socket from "../socket";


// =====================
// ASSIGN ROLE
// =====================

export function assignRole(
    roomId,
    targetSocketId,
    role
){

    socket.emit(
        "assign_role",
        {
            roomId,
            targetSocketId,
            role
        }
    );

}




// =====================
// REMOVE USER
// =====================

export function removeUser(
    roomId,
    targetSocketId
){

    socket.emit(
        "remove_user",
        {
            roomId,
            targetSocketId
        }
    );

}




// =====================
// TRANSFER HOST
// =====================

export function transferHost(
    roomId,
    targetSocketId
){

    socket.emit(
        "transfer_host",
        {
            roomId,
            targetSocketId
        }
    );

}