const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true
    },


    socketId:{
        type:String,
        required:true
    },


    roomId:{
        type:String,
        required:true
    },


    role:{
        type:String,

        enum:[
            "Host",
            "Participant",
            "Moderator"
        ],

        default:"Participant"
    }


},


{
    timestamps:true
});


module.exports = mongoose.model(
    "User",
    userSchema
);