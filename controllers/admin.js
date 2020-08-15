const _ = require("lodash");
const  User = require("../models/user");
const  Match = require("../models/match");

exports.allusers = (req, res)=> {
    User.find((err,users)=>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        res.json(users);
    }).select("name email created updated role blocked ");
};


exports.hasbothPermission = (req, res, next)=>{
    console.log(req.auth)
    var hasPermission = false;
    const autherized =  req.auth ;
    if(!autherized){
        return res.status(403).json({
            error: "You are not athorized to perform this action!"
        })
    }
    else {
        User.findOne({_id: req.auth._id}, (err, user)=> {
            if(err || !user){
                return res.status(403).json({
                    error: "You are not athorized to perform this action!"
                })
            }
            else {
                if (user.role == "superadmin" || user.role == "admin"){
                    hasPermission = true;
                }
                if(!hasPermission){
                    return res.status(403).json ({
                        error : "only admin and super admins has this permission"
                    });
                }
                next();
            }
        })
    }

};


exports.hasPermission = (req, res, next)=>{
    console.log(req.auth)
    var hasPermission = false;
    const autherized =  req.auth ;
    if(!autherized){
        return res.status(403).json({
            error: "You are not athorized to perform this action!"
        })
    }
    else {
        User.findOne({_id: req.auth._id}, (err, user)=> {
            if(err || !user){
                return res.status(403).json({
                    error: "You are not athorized to perform this action!"
                })
            }
            else {
                if (user.role == "superadmin"){
                    hasPermission = true;
                }
                if(!hasPermission){
                    return res.status(403).json ({
                        error : "only super admins has this permission"
                    });
                }
                next();
            }
        })
    }

};

exports.assignRole = (req, res) => {
    User.findOne({_id:req.body.id}, (err, user)=> {
        if(err|| !user){
            return res.json("invalid user id")
        }
        updatedFiled = {
            role : req.body.role.toLowerCase()
        }
        user = _.extend(user, updatedFiled);
        user.save((err, user)=> {
            if(err || !user){
                return res.json(err)
            }
            return res.json({user, message: "Role assigned"})
        })
    })
}

exports.changeStatus = (req, res)=> {
    Match.findById(req.body.matchId, (err, match)=> {
        if(err||!match){
            return res.json ({error: "Match not found"})
        }
        User.findById(req.body.userId, (err, user)=> {
            if(err||!user){
                return res.json ({error: "User not found"})
            }
            else {
                if(!match.under_review_by){
                    match.under_review_by = user;
                    match.status= req.body.status;

                    match.save((err, match)=> {
                        if(err){
                            return res.json ({error: "Error marking under review"})
                        }
                        else {
                            return res.json (match)
                        }
                    })
                }
                else {

                    if(match.under_review_by=user){
                        match.status= req.body.status;

                        match.save((err, match)=> {
                            if(err){
                                return res.json ({error: "Error marking under review"})
                            }
                            else {
                                return res.json (match)
                            }
                        })
                    }
                    else {
                        return res.json ({error: "This dispute is under review by another admin"})
                    }
                }

            }
        })
    })
}