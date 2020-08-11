const User = require("../models/user");
const Game = require("../models/game");
const Block = require("../models/block_history");
const Invite = require("../models/invite")
const Match = require("../models/match")
const _ = require('lodash')
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

exports.acceptInvites = (req, res)=> {
    Invite.findById(req.body.invite_id, (err, invite)=> {
        if(err|| !invite){
            return res.json ({error : "Could not find invite"});
        }
        else {
            updatedFields = {
                status : true
            }
            invite = _.extend(invite, updatedFields)
            invite.save((err, result)=> {
              if(err||!result){
                  return res.json({error: "could not update invite"})
              }
              else {
                  var olddate = new Date(invite.match_time);
                  console.log(olddate);
                  var newDateObj = new Date(invite.match_time.getTime() + 45*60000);
                  console.log(newDateObj);
                  Match.findOne(
                      {
                          $or: [
                              { user1_id: invite.sender_id}, { user1_id: invite.receiver_id},
                              { user2_id: invite.sender_id}, { user2_id: invite.receiver_id},
                          ]
                      }, {match_time: {$gte:olddate}}, {match_time: {$lte:newDateObj}}
                      ,(err, match)=> {
                          if(match){
                              return res.json ({error : "Either of both players have already a match at that time."});
                          }
                          else{
                              let match = new Match();
                              match.user1_id= invite.sender_id;
                              match.user2_id= invite.receiver_id;
                              match.game_id = invite.game_id;
                              match.match_time= invite.match_time;

                              match.save((err, match)=> {
                                  if(err||!match){
                                      return res.json ({error : "Error creating match."});
                                  }
                                  else {
                                      return res.json (match);
                                  }
                              })
                          }
                      })
              }
            })

        }
    })
}