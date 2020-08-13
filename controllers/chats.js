const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

exports.chatById = (req, res, next, id)=> {
    Chat.findById(id)
        .exec((err, chat)=>{
            if(err|| !chat){
                return res.status(400).json({
                    error: "Chat not found"
                });
            }
            req.chat = chat;
            next();
        });
};

exports.getUserChats = (req, res)=> {
    Chat.find({ $or: [ { user1: req.profile }, {user2: req.profile} ] }, (err, chat)=> {
        if(err){
            return res.json ({error: "error finding chats"})
        }
        else {
            return res.json (chat)
        }
    }).populate('user1', 'name').populate('user2', 'name')
}

exports.getMessages = (req, res)=> {

    Message.find({chat_id : req.chat }, (err, chat)=> {
        if(err){
            return res.json ({error: "error finding messages"})
        }
        else {
            return res.json (chat)
        }
    }).populate('receiver_id', 'name')

}

exports.createGroup = (req, res)=> {
    const {creator_id , participant1_id ,participant2_id} = req.body;

    User.findById(creator_id , (err, creator)=> {
        if(err || !creator) {
            return res.json({error: "Creator not found"})
        }
        else {
            User.findById(participant1_id , (err, participant1)=> {
                if(err || !creator) {
                    return res.json({error: "Participant1 not found"})
                }
                else {
                    User.findById(participant2_id , (err, participant2)=> {
                        if(err || !creator) {
                            return res.json({error: "Participant2 not found"})
                        }
                        else {

                        }
                    }).select("name email _id")
                }
            }).select("name email _id")

        }
    }).select("name email _id")
}