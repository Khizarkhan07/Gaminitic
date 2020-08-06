const moongose = require ("mongoose");

const ConnectionsSchema = new moongose.Schema({

    sender_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    receiver_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    is_friend: {
        type: Boolean,
        default: false
    }

});
module.exports= moongose.model("connection", ConnectionsSchema);