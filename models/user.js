var mongoose =require("mongoose");
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');
var UserSchema = new mongoose.Schema({
    status : {
      type: String
    },

    name: {
        type: String,
        trim: true,

    },
    username: {
        type: String,

    },
    email:{
        type: String,
        trim: true,

    },
    hashed_password:{
        type: String,

    },
    user_number: {
        type:String,
    },
    otp: {
        type:String,
    },
    salt: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    photo: {
        type:String
    },
    biography: {
        type: String,
        trim : true,

    },
    address: {
        type: String,
        trim : true
    },
    resetPasswordLink: {
        data: String,
        default: ""
    },
    verifyAccountLink: {
        data: String,
        default: ""
    },
    resetPasswordLink: {
        data: String,
        default: ""
    },
    is_activated : {
        type: Boolean,
        default: false
    },
    is_public : {
        type: Boolean,
        require: true
    },
    psn_tag : {
        type: String
    },
    xbox_tag : {
        type: String
    },
    security_question : {
        type: String
    },
    security_answer : {
        type: String
    },
    blocked : {
        type: Boolean
    },
    ipAddress: {
        type:String
    },
    role : {
        type: String,
        default: "user"
    },
    isDst: {
      type: Boolean
    },
    timeZone : {
        type:String
    },
    offset: {
      type: Number
    },
    abv: {
       type: String
    },
    blocked_users: [{
        type: mongoose.Schema.ObjectId,
        ref: "block_history"
    }],
    coins: {
        type: Number,
        default: 0
    },
    wallet: {
        type: Number,
        default: 0
    }
    }
);

UserSchema.virtual('password').set(function (password) {
    //creating temp variable _password
    this._password = password;
    //generateing a timestamp
    this.salt= uuidv1();
    this.hashed_password = this.encryptPassword(password);
})
    .get(function () {
        return this._password
    })

UserSchema.methods= {
    authenticate : function(plainText){
        return this.encryptPassword(plainText) === this.hashed_password
    },

    encryptPassword : function (password) {
        if(!password){
            return ""
        }
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        }
        catch (e) {
            return ""
        }
    }
};

module.exports = mongoose.model("user", UserSchema);