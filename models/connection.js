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
    },
    created_at :{
        type: Date,
        default: Date.now
    },
    deleted_at :{
        type: Date
    }

});
module.exports= moongose.model("connection", ConnectionsSchema);