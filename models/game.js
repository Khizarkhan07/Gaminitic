const moongose = require ("mongoose");

const games = new moongose.Schema({
    name : {
        type: String
    },
    difficulties: [
        {
            type: String
        }
    ],
    lengths :[
        {
            type: String
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },

});
module.exports= moongose.model("game", games);