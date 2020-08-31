const moongose = require("mongoose");
const Schema = moongose.Schema;

const configurations = new Schema({
    inviteLimit: {
        type: Number
    }
});

module.exports = moongose.model("configuration", configurations);


