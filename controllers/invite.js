const User = require("../models/user");
const Game = require("../models/game");
const Block = require("../models/block_history");
const Invite = require("../models/invite")
const Match = require("../models/match")
const _ = require('lodash')
const formidable = require('formidable')
const fs = require("fs");

exports.matchById = (req, res, next, id)=> {
    Match.findById(id)
        .exec((err, match)=>{
            if(err|| !match){
                return res.status(400).json({
                    error: "game not found"
                });
            }
            req.match = match;
            next();
        });
};


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
                          ], match_time: {$gte:olddate}, match_time: {$lte:newDateObj}
                      }
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

exports.upcoming = (req, res) => {

    Match.find( { $or: [ {user1_id: req.profile}, {user2_id: req.profile } ], match_time: {$gte: new Date(Date.now())}  }, (err, match) =>{

        if(err) {
            return res.json(err);
        }
        return res.json(match);
    })
}

exports.matchesWon = (req, res) => {

    Match.find( {winner_id: req.profile}, (err, match) =>{

        if(err) {
            return res.json(err);
        }
        return res.json(match);
    })
}

exports.matcheslost = (req, res) => {

    Match.find( {loser_id: req.profile}, (err, match) =>{

        if(err) {
            return res.json(err);
        }
        return res.json(match);
    })
}


exports.disputes = (req, res) => {

    Match.find( {$or: [ {status: {$eq: 'indispute'}}, {dispute_user_id: req.profile } ]}, (err, match) =>{

        if(err) {
            return res.json(err);
        }
        return res.json(match);
    })
};

exports.uploadProof = (req, res)=>{

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Photo cannot be uploaded"
            });
        }

        const {winner_id, loser_id} = fields;
        console.log(winner_id);

        User.findById(winner_id,(err, winner)=> {
            if(err||!winner){
                return res.json({
                    error: "Winner id is invalid"
                });
            }
            else{
                User.findById(loser_id, (err, loser)=> {
                    if(err||!loser){
                        return res.json({
                            error: "loser id is invalid"
                        });
                    }
                    else {


                        let match = req.match;
                        match.winner_id = winner;
                        match.loser_id = loser

                        //uploading proof
                        if (files.photo) {
                            var oldpath = files.photo.path;
                            console.log(oldpath);
                            var temp = '\\images\\' + Math.random()+files.photo.name ;
                            console.log(temp);

                            var newpath = 'C:\\Users\\unique\\WebstormProjects\\gaminatic\\assets' + temp;
                            //console.log('path: '+ newpath);
                            fs.rename(oldpath, newpath, function (err) {
                                if (err) throw err;

                            });
                            match.dispute_proof = temp
                        }
                        match.save((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: err
                                })
                            }
                            res.json(result);

                        });

                    }
                })
            }
        })
    })
}