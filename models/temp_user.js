const moongose = require("mongoose");
const Schema = moongose.Schema;

const temp_users = new Schema({
    user_number: {
        type:String,
    },
    otp: {
        type:String,
    },
});

let temp_user = moongose.model("temp_user", temp_users);

module.exports = temp_user;
