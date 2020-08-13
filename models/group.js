const moongose = require("mongoose");
const Schema = moongose.Schema;

const groupSchema = new Schema({
    name : {
        type: String
    },
    chat_type: {
        type:String,
        default : "group"
    },
    creator : {
        type: moongose.Schema.ObjectId ,
        ref: "user"
    },
    participants: [{type: moongose.Schema.ObjectId , ref: "user"}]


});

let Group = moongose.model("group", groupSchema);

module.exports = Group;
