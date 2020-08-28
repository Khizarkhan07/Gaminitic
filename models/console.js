const moongose = require ("mongoose");

const console = new moongose.Schema({
    name : {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    photo: {
        type:String
    }
});
module.exports= moongose.model("console", console);