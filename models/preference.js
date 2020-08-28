const moongose = require ("mongoose");

const preferences = new moongose.Schema({
    userId: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    selectedGame: {
        type: moongose.Schema.ObjectId,
        ref: "game"
    },
    selectedConsole : {
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