const moongose = require("mongoose");
const Schema = moongose.Schema;

const messageSchema = new Schema({
    chat_id: {
        type: moongose.Schema.ObjectId,
        ref: "chat"
    },
    user_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    receiver_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    message: {
        type: String
    }
});

let Chat = moongose.model("message", messageSchema);

module.exports = Chat;
