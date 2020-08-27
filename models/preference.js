const moongose = require ("mongoose");

const preferences = new moongose.Schema({
    user_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    game_id: {
        type: moongose.Schema.ObjectId,
        ref: "game"
    },
    console_id : {
        type: moongose.Schema.ObjectId,
        ref: "console"
    },
    difficulty:{
        type:String
    },
    length: {
        type:String
    }
});
module.exports= moongose.model("preference", preferences);