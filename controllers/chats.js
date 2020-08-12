const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");

exports.chatById = (req, res, next, id)=> {
    Chat.findById(id)
        .exec((err, chat)=>{
            if(err|| !user){
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