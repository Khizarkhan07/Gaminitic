const moongose = require("mongoose");
const Schema = moongose.Schema;

const groupSchema = new Schema({

    chat_type: {
        type:String,
        default : "group"
    },
    participants: [{type: mongoose.Schema.ObjectId , ref: "user"}]


});

let Group = moongose.model("group", groupSchema);

module.exports = Group;
