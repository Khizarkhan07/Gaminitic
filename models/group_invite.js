const moongose = require ("mongoose");

const GroupInvite = new moongose.Schema({

    sender_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    receiver_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    is_friend: {
        type: Boolean,
        default: false
    },
    groupName : {
        type: String
    },
    created_at :{
        type: Date,
        default: Date.now
    },
    deleted_at :{
        type: Date
    }

});
module.exports= moongose.model("groupInvite", GroupInvite);