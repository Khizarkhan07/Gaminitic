const moongose = require ("mongoose");

const block_history = new moongose.Schema({
    user_blocked: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    created: {
        type: Date,
        default: Date.now
    },
    reason : {
        type: String
    },
    unblocked : {
        type: Boolean,
        default: false
    },
    unblocked_at: Date

});
module.exports= moongose.model("block_history", block_history);