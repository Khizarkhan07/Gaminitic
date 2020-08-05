var mongoose =require("mongoose");
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');
var UserSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true
        },
        username: {
            type: String,
            trim: true,
        },
        email:{
            type: String,
            trim: true,
            required: true
        },
        hashed_password:{
            type: String,
            required: true
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
        update: Date,
        photo: {
            type:String
        },
        biography: {
            type: String,
            trim : true,
            required: true
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
        is_activated : {
            type: Boolean,
            default: false
        },
        psn_tag : {
            type: String
        },
        xbox_tag : {
            type: String
        },

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
//UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);