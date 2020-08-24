const _ = require("lodash");
const  User = require("../models/user");
const  Match = require("../models/match");
const formidable = require('formidable')
const jwt = require("jsonwebtoken");
require('dotenv').config()
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch')


exports.adminSignin =  (req, res) => {
    console.log("here")
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields)=> {
        const {password} = fields;
        const email = fields.email.toLowerCase();
        console.log(email)
        console.log(password)

        User.findOne({email, role: 'superadmin'}, (err, user) => {
            if (err || !user) {
                return res.json({
                    error: "User with this email doesnot exist!"
                })
            }
            if (!user.authenticate(password)) {
                return res.json({
                    error: "Email and password doesnot match!"
                })
            }

            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

            res.cookie("t", token, {expire: Date.now() + 999});

            const {_id, name, email, role} = user;

            localStorage.setItem('jwt', token)
            localStorage.setItem('_id', _id)
            localStorage.setItem('name', name)
            localStorage.setItem('email', email)
            localStorage.setItem('role', role)

            Match.find({is_dispute: true}).lean()
                .populate("dispute_user_id", 'name')
                .populate("user1_id", "name")
                .populate("user2_id", "name")
                .populate("game_id", "name")
                .populate("under_review_by", "name")
                .exec((err, match)=> {
                    res.render('disputes', {match})
                })
        });
    })
}


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


/*
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
*/

exports.hasbothPermission = (req, res, next)=>{
    var hasPermission = false;

    const _id = localStorage.getItem("_id")
    console.log(localStorage.getItem("_id"))


    const jwt = localStorage.getItem("jwt")
    console.log(localStorage.getItem("jwt"))


    const role = localStorage.getItem("role")
    console.log(localStorage.getItem("role"))


    if(!_id){
        return res.status(403).json({
            error: "You are not athorized to perform this action!"
        })
    }
    else {
        User.findOne({_id:_id}, (err, user)=> {
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


/*
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
*/

exports.isSignedin =(req, res, next)=> {
    const _id = localStorage.getItem("_id")
    console.log(localStorage.getItem("_id"))


    const jwt = localStorage.getItem("jwt")
    console.log(localStorage.getItem("jwt"))


    const role = localStorage.getItem("role")
    console.log(localStorage.getItem("role"))

    if(!jwt){
        return res.render('login')
    }
    next();
}


exports.hasPermission = (req, res, next)=>{
    const _id = localStorage.getItem("_id")
    console.log(localStorage.getItem("_id"))


    const jwt = localStorage.getItem("jwt")
    console.log(localStorage.getItem("jwt"))


    const role = localStorage.getItem("role")
    console.log(localStorage.getItem("role"))

    var hasPermission = false;

    if(!_id){
        return res.status(403).json({
            error: "You are not athorized to perform this action!"
        })
    }
    else {
        User.findOne({_id: _id}, (err, user)=> {
            if(err || !user){
                return res.render('login', {error: "login to perform the action"})
            }
            else {
                if (user.role == "superadmin"){
                    hasPermission = true;
                }
                if(!hasPermission){
                    if(err || !user){
                        return res.render('login', {error: "login as superadmin"})
                    }
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
        }).select("name _id email")
    })
}

exports.resloveDispute = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields)=> {
        const {winner_id, loser_id, match_id} = fields;

        Match.findById(match_id, (err, match)=> {
            if(err||!match){
                return res.json ({error: "Match not found"});
            }
            else {
                User.findById(winner_id, (err, winner)=> {
                    if(err){
                        return res.json ({error: "Winner not found"})
                    }
                    else {
                        User.findById(loser_id, (err, loser)=> {
                            if(err){
                                return res.json ({error: "loser not found"})
                            }
                            else {
                                if(match.under_review_by._id = localStorage.getItem('_id')){
                                    match.winner_id = winner;
                                    match.loser_id= loser;
                                    match.status= "closed"
                                    match.is_dispute = false;
                                    match.save((err, match)=> {
                                        if(err){
                                            return res.json ({error: "Error closing the match"})
                                        }
                                        else {
                                            return res.json (match)
                                        }
                                    })
                                }
                                else {
                                    return res.json ({error: "Underreview by another admin"})
                                }


                            }
                        }).select("name email _id")
                    }
                }).select("name email _id")
            }
        })
    })




}

exports.disputes= (req, res)=> {

    Match.find({is_dispute: true}).lean()
        .populate("dispute_user_id", 'name')
        .populate("user1_id", "name")
        .populate("user2_id", "name")
        .populate("game_id", "name")
        .populate("under_review_by", "name")
        .exec((err, match)=> {
             res.render('disputes', {match})
        })
}

exports.getDispute = (req, res)=> {
    res.render('singleDispute',{dispute:req.match})
}