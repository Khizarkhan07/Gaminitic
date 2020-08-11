const moongose = require ("mongoose");

const invites = new moongose.Schema({
    status : {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    game_id: {
        type: moongose.Schema.ObjectId,
        ref: "game"
    },
    sender_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    receiver_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    match_time : {
        type: Date
    }

});
module.exports= moongose.model("invite", invites);