const moongose = require("mongoose");
const Schema = moongose.Schema;

const chatSchema = new Schema({
    user1: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    user2: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    chat_type: {
        type:String,
        default : "single"
    }


});

let Chat = moongose.model("chat", chatSchema);

module.exports = Chat;
