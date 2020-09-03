const moongose = require ("mongoose");

const GroupInvite = new moongose.Schema({
    status: {
      type: Boolean,
      default: false
    },
    sender_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
    },
    receiver_id: {
        type: moongose.Schema.ObjectId,
        ref: "user"
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