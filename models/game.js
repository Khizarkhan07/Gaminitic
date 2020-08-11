const moongose = require ("mongoose");

const games = new moongose.Schema({
    name : {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },

});
module.exports= moongose.model("game", games);