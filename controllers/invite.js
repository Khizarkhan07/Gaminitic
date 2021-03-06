const User = require("../models/user");
const Game = require("../models/game");
const Invite = require("../models/invite")
const GroupInvite = require("../models/group_invite")
const Group = require("../models/group")
const Match = require("../models/match")
const Config = require("../models/configuration")
const _ = require('lodash')
const formidable = require('formidable')
const fs = require("fs");

//find match by id
exports.matchById = (req, res, next, id)=> {
    Match.findById(id).lean()
        .populate("user1_id", "name")
        .populate("user2_id", "name")
        .populate("game_id", "name")
        .populate("dispute_user_id", "name")
        .populate("under_review_by", "name")
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

exports.GroupInviteById = (req, res, next, id)=> {
    GroupInvite.findById(id)
        .exec((err, group)=>{
            if(err|| !group){
                return res.status(400).json({
                    error: "invite not found"
                });
            }
            req.invite = group;
            next();
        });
};

//send match invite to user if not blocked

exports.sendInvite = (req, res) => {
    const {sender_id, receiver_id, game_id} = req.body;

    Config.find({}, (err, config)=> {
        if(err){
            return res.status(400).json({
                errors: {
                    configuration: "error finding configurations"
                }
            })
        }
        else{

            var monthdiff = (monthDiff(new Date(Date.now()), new Date("2021-09-12T07:54:01.578+00:00")))

            if(monthdiff>config[0].inviteLimit){
                return res.status(400).json({
                    errors: {
                        inviteLimit: "You invitation date exceeds the limit"
                    }
                })
            }
            else {

                Game.findById(game_id, (err, game)=> {
                    if(err||!game){
                        return res.json ({error: "game does not exists"})
                    }
                    else{
                        User.findById(receiver_id)
                            //finding blocked user
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


                                            console.log("offset:", sender.offset);
                                            var hours = sender.offset/60;
                                            console.log("hours: ", hours)
                                            var minutes = hours*60;
                                            console.log("mints: ", minutes);
                                            var seconds = minutes*60000;
                                            console.log("seconds: ", seconds);
                                            console.log("time before : ", new Date(Date.now()));
                                            invite.match_time = new Date(Date.now() + seconds);
                                            console.log("time in utc",(invite.match_time));


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
        }
    })

}

exports.pendingInvites =(req, res)=> {
    Invite.find({receiver_id: req.profile , status: false}, (err, invites)=> {
        if(err || !invites){
            return res.json ({error : "Could not find any invites"});
        }
        else {
            /*return res.json (invites);*/

            for (var i= 0 ; i< invites.length; i++){
                console.log("offset:", req.profile.offset);
                var hours = req.profile.offset/60;
                console.log("hours: ", hours)
                var minutes = hours*60;
                console.log("mints: ", minutes);
                var seconds = -1 * (minutes*60000);
                console.log("seconds: ", seconds);
                var result= new Date(invites[i].match_time)
                invites[i].match_time = new Date(result.getTime()+ seconds);

            }

            return res.json(invites)
        }
    })
}



exports.pendingGroupInvites =(req, res)=> {
    GroupInvite.find({receiver_id: req.auth._id , status: false}, (err, invites)=> {
        if(err || !invites){
            return res.json ({error : "Could not find any invites"});
        }
        else {
            /*return res.json (invites);*/
            return res.json(invites)
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


exports.acceptGroupInvites = (req, res)=> {
    Group.findById(req.invite.)
}
//api to mark user calender with upcoming matches.
exports.upcoming = (req, res) => {

    //find user with id if logged in
    User.findById(req.auth._id, (err, user)=> {
        if(err||!user){
            return res.status(403).json({
                errors: {
                    auth: "You are not Authorized!"
                }
            })
        }
        else {

            //find user upcoming matches

            Match.find( { $or: [ {user1_id: user}, {user2_id: user } ], match_time: {$gte: new Date(Date.now())}  }, (err, match) =>{
                var markedDates = {}

                //for every match extract match date from time-stamp
                //append them in the marked object with extracted date as key.
                //push matches on each date under the date key (number of matches on a date)

                for (var i=0; i< match.length; i++){
                    const year = match[i].match_time.getFullYear();
                    var month = match[i].match_time.getMonth()+1;
                    if(month<10){
                        month= "0"+ month
                    }
                    const date = match[i].match_time.getDate();
                    var fulldate = year+ "-" +month + "-"+ date

                    fulldate = fulldate.toString()
                    console.log(fulldate)
                    if(markedDates[fulldate] === undefined){
                        console.log("here for:" + fulldate)
                        markedDates[fulldate] = {marked :true, selected:true, matches: [match[i]]};
                    }
                    else {
                        markedDates[fulldate].matches.push(match[i])
                    }
                }

                return res.json({markedDates:markedDates})
            }).populate('game_id', 'name photo').populate('user1_id', 'name xbox_tag psn_tag photo').populate('user2_id', 'name xbox_tag psn_tag photo')


        }
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

                            var newpath = 'C:\\Users\\unique\\WebstormProjects\\gaminatic\\js' + temp;
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

exports.acceptProof = (req, res) => {
    const {match_id} = req.body;

    Match.findById(match_id, (err, match)=> {
        if(err||!match){
            return res.json ( { error : "match not found"})
        }
        else {
            match.status = "complete";
            match.declared_winner_id= match.winner_id;

            match.save((err,result)=> {
                if(err||!result){
                    return res.json ( { error : "match not completed"})
                }

                return res.json ( {message: "match completed"})

            })
        }
    })
}

exports.rejectProof = (req, res) => {
    const {match_id} = req.body;

    Match.findById(match_id, (err, match)=> {
        if(err||!match){
            return res.json ( { error : "match not found"})
        }
        else {
            match.is_dispute = true;
            match.dispute_user_id= match.winner_id;
            match.status = "indispute"
            match.save((err,result)=> {
                if(err||!result){
                    return res.json ( { error : "match not completed"})
                }

                return res.json ( {message: "match disputed"})

            })
        }
    })
}

/*function getUtcTime(offset, time) {
    var hours = offset/60;
    console.log("hours: ", hours)
    var minutes = hours*60;
    console.log("mints: ", minutes);
    var seconds = minutes*60000;
    console.log("seconds: ", seconds);
    console.log("time before : ", time)
    var time = (new Date(time))
    time  =time + parseInt(seconds)
    console.log(time)
}*/

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}