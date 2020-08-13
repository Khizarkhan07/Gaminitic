const moongose = require("mongoose");
const Schema = moongose.Schema;

const groupMessageSchema = new Schema({
    group_id: {
        type: moongose.Schema.ObjectId,
        ref: "group"
    },
    sender_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    message: {
        type: String
    },
    attachment : {
        type: String
    }
});

let GroupMessage = moongose.model("groupMessage", groupMessageSchema);

module.exports = GroupMessage;
