const mongoose = require("mongoose");


const roomSchema = new mongoose.Schema({

    roomId:{
        type:String,
        required:true,
        unique:true
    },


    host:{
        type:String,
        required:true
    },


    video:{
        videoId:{
            type:String,
            default:null
        },


        currentTime:{
            type:Number,
            default:0
        },


        isPlaying:{
            type:Boolean,
            default:false
        }

    },


    users:[
        {
            username:String,

            socketId:String,

            role:{
                type:String,
                enum:[
                    "Host",
                    "Participant",
                    "Moderator"
                ],
                default:"Participant"
            }
        }
    ]

},


{
    timestamps:true
});


module.exports = mongoose.model(
    "Room",
    roomSchema
);