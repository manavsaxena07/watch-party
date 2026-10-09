import {
    assignRole,
    removeUser,
    transferHost
} from "../services/roleService";


function RoomMembers({
    room,
    currentUser
}) {


    console.log("CURRENT USER:", currentUser);
    console.log("USERS:", room.users);





    function makeModerator(user) {

        assignRole(
            room.roomId,
            user.socketId,
            "Moderator"
        );

    }





    function makeParticipant(user) {

        assignRole(
            room.roomId,
            user.socketId,
            "Participant"
        );

    }





    function removeMember(user) {

        console.log("REMOVE CLICKED");


        removeUser(
            room.roomId,
            user.socketId
        );

    }





    function giveHost(user) {

        transferHost(
            room.roomId,
            user.socketId
        );

    }







    return (

        <div className="
            w-72
            bg-gray-900
            p-5
            rounded-2xl
            shadow-xl
            overflow-hidden
        ">



            <h2 className="
                text-xl
                font-bold
                text-white
                mb-5
            ">
                👥 Members ({room.users.length})
            </h2>






            {
                room.users.map(
                    (user)=>(


                        <div

                            key={user.socketId}

                            className={`
                                p-4
                                mb-4
                                rounded-xl
                                border
                                transition

                                ${
                                    currentUser?.socketId === user.socketId

                                    ?

                                    "bg-blue-600 border-blue-300"

                                    :

                                    "bg-gray-800 border-gray-700"
                                }
                            `}

                        >




                            <div className="
                                flex
                                justify-between
                                items-center
                            ">


                                <div className="
                                    min-w-0
                                ">


                                    <h4 className="
                                        text-white
                                        font-semibold
                                        truncate
                                    ">


                                        {
                                            user.role === "Host"
                                            ?
                                            "👑"
                                            :
                                            user.role === "Moderator"
                                            ?
                                            "🛡️"
                                            :
                                            "👤"
                                        }


                                        {" "}

                                        {user.username}





                                        {
                                            currentUser?.socketId === user.socketId
                                            &&
                                            (
                                                <span className="
                                                    ml-2
                                                    text-green-300
                                                    text-xs
                                                ">
                                                    (You)
                                                </span>
                                            )
                                        }


                                    </h4>





                                    <small className="
                                        text-gray-300
                                    ">
                                        {user.role}
                                    </small>



                                </div>



                            </div>









                            {
                                currentUser?.role === "Host"
                                &&
                                user.socketId !== currentUser.socketId
                                &&



                                <div className="
                                    mt-4
                                    flex
                                    flex-col
                                    gap-2
                                ">






                                    {
                                        user.role === "Participant"

                                        ?

                                        <button

                                            onClick={() =>
                                                makeModerator(user)
                                            }

                                            className="
                                                bg-blue-100
                                                text-black
                                                py-2
                                                rounded-lg
                                                hover:bg-blue-200
                                                transition
                                            "
                                        >
                                            🛡️ Make Moderator
                                        </button>


                                        :


                                        <button

                                            onClick={() =>
                                                makeParticipant(user)
                                            }

                                            className="
                                                bg-blue-100
                                                text-black
                                                py-2
                                                rounded-lg
                                                hover:bg-blue-200
                                                transition
                                            "
                                        >
                                            👤 Remove Moderator
                                        </button>


                                    }








                                    <button

                                        onClick={() =>
                                            removeMember(user)
                                        }

                                        className="
                                            bg-red-200
                                            text-black
                                            py-2
                                            rounded-lg
                                            hover:bg-red-300
                                            transition
                                        "

                                    >
                                        ❌ Remove User
                                    </button>









                                    <button

                                        onClick={() =>
                                            giveHost(user)
                                        }

                                        className="
                                            bg-yellow-200
                                            text-black
                                            py-2
                                            rounded-lg
                                            hover:bg-yellow-300
                                            transition
                                        "

                                    >
                                        👑 Transfer Host
                                    </button>




                                </div>

                            }





                        </div>


                    )
                )
            }




        </div>

    );

}



export default RoomMembers;