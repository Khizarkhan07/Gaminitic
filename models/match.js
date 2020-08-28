const moongose = require ("mongoose");

const matches = new moongose.Schema({
    status:{
      type: String
    },
    match_time : {
        type: Date
    },
    is_dispute : {
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
    user1_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    user2_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    winner_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    loser_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    dispute_user_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    dispute_proof : {
        type: String
    },
    declared_winner_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    under_review_by : {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    betAmount : {
        type: Number,
        default:0
    }

});
module.exports= moongose.model("match", matches);