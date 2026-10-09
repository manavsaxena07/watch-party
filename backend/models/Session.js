const mongoose = require("mongoose");


const sessionSchema = new mongoose.Schema({

    userId:{
        type:String
    },


    roomId:{
        type:String
    },


    joinedAt:{
        type:Date,
        default:Date.now
    },


    leftAt:{
        type:Date
    }


});


module.exports = mongoose.model(
    "Session",
    sessionSchema
);