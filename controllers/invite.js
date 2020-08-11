const User = require("../models/user");
const Game = require("../models/game");
const Block = require("../models/block_history");
const Invite = require("../models/invite")

exports.sendInvite = (req, res) => {
    const {sender_id, receiver_id, game_id} = req.body;

    Game.findById(game_id, (err, game)=> {
        if(err||!game){
            return res.json ({error: "game does not exists"})
        }
        else{
            User.findById(receiver_id)
                .populate({
                    path: 'blocked_users',
                    match: { unblocked: false},
                    populate: {
                        path:'user_blocked',
                        match: { _id: sender_id},
                    }
                })
                .exec((err, user)=>{
                    if(user.blocked_users.length !=0){
                        return res.json ({error: "You are blocked by the user can't send invites"})
                    }
                    else {
                        User.findById(sender_id, (err, sender)=> {
                            if(err|| !sender){
                                return res.json ({error: "Could not find sender, invalid senderId"})
                            }
                            else {
                                let invite = new Invite();
                                invite.game_id = game;
                                invite.sender_id = sender;
                                invite.receiver_id = user;

                                invite.match_time = new Date(req.body.match_time);

                                invite.save((err, invitation)=> {
                                    if(err || !invitation){
                                        return res.json ({error: "Could not find sender, invalid senderId"})
                                    }
                                    else {
                                        return res.json (invitation);

                                    }
                                })
                            }
                        })
                    }
                });
        }
    })
}

exports.pendingInvites =(req, res)=> {
    Invite.findOne({receiver_id: req.profile , status: false}, (err, invites)=> {
        if(err || !invites){
            return res.json ({error : "Could not find any invites"});
        }
        else {
            return res.json (invites);
        }
    })
}