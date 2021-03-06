const _ = require("lodash");
const  User = require("../models/user");
const  Match = require("../models/match");
const  Config = require("../models/configuration");
const formidable = require('formidable')
const jwt = require("jsonwebtoken");
require('dotenv').config()
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch')
const {sendEmail} = require('../helpers/index')

exports.adminSignin =  (req, res) => {
    console.log("here")
    const email = req.body.email.toLowerCase();
    const password = req.body.password;


    User.findOne({email, role: 'superadmin'}, (err, user) => {
        if (err || !user) {
            return res.status(400).json( {
                errors: [{msg:"User does not exists"}],
            });
        }
        if (!user.authenticate(password)) {
            return res.status(400).json( {
                errors: [{msg:"Email and password doesnot match"}],
            });
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

        res.cookie("t", token, {expire: Date.now() + 999});

        const {_id, name, email, role} = user;

        localStorage.setItem('jwt', token)
        localStorage.setItem('_id', _id)
        localStorage.setItem('name', name)
        localStorage.setItem('email', email)
        localStorage.setItem('role', role)
        console.log("here findin")
        Match.find({is_dispute: true}).lean()
            .populate("dispute_user_id", 'name')
            .populate("user1_id", "name")
            .populate("user2_id", "name")
            .populate("game_id", "name")
            .populate("under_review_by", "name")

            .exec((err, match)=> {
               /* res.status(200).render('disputes', {match, login: {user: {_id, name , email, token, role}}})
            */
                return res.json({
                    success: true,
                    user: {_id, name , email, token, role}
                });

            })
    });

}


exports.allusers = (req, res)=> {

    User.find().lean()
        .select("name email created updated role blocked ")
        .exec((err, user)=> {
            console.log("here")
            res.render('users', {users:user});
        })
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
    console.log("here")
    var hasPermission = false;

    const _id = localStorage.getItem("_id")
    const jwt = localStorage.getItem("jwt")
    const role = localStorage.getItem("role")

    if(!_id){
        return res.render('login',{
            error: "You are not athorized to perform this action!"
        })
    }
    else {
        User.findOne({_id:_id}, (err, user)=> {
            if(err || !user){
                return res.render('login',{
                    error: "You are not athorized to perform this action!"
                })
            }
            else {
                if (user.role == "superadmin" || user.role == "admin"){
                    hasPermission = true;
                }
                if(!hasPermission){
                    return res.json({
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
    console.log("user")
    const {user_id, role} = req.body;

    User.findOne({_id:user_id}, (err, user)=> {
        if(err|| !user){
            return res.status(400).json( {
                errors: [{msg:"User does not exists"}],
            });
        }
        console.log("user fournd")
        updatedFiled = {
            role : role.toLowerCase()
        }
        user = _.extend(user, updatedFiled);
        user.save((err, user)=> {
            if(err || !user){
                return res.json(err)
            }
            return res.json({
                success: true
            });
        })
    })


}

exports.changeStatus = (req, res)=> {

    console.log("here")
    const {matchId, status} = req.body;

    const userId = req.auth._id

    Match.findById(matchId, (err, match)=> {
        if(err||!match){
            return res.status(400).json( {
                errors: [{msg:"Match does not exists"}],
            });
        }
        User.findById(userId, (err, user)=> {
            if(err||!user){
                return res.status(400).json( {
                    errors: [{msg:"User does not exists"}],
                });
            }
            else {
                if(!match.under_review_by){
                    match.under_review_by = user;
                    match.status= status;

                    match.save((err, match)=> {
                        if(err){
                            return res.status(400).json( {
                                errors: [{msg:"Error changing status"}],
                            });
                        }
                        else {
                            return res.json (match)
                        }
                    })
                }
                else {

                    if(match.under_review_by._id == userId){
                        console.log("same user")
                        match.status= status;

                        match.save((err, match)=> {
                            if(err){
                                return res.status(400).json( {
                                    errors: [{msg:"Error changing status"}],
                                });
                            }
                            else {
                                return res.json({
                                    success: true
                                });
                            }
                        })
                    }
                    else {
                        return res.status(400).json( {
                            errors: [{msg:"Dispute is under review by another admin"}],
                        });
                    }
                }

            }
        }).select("name _id email")
        })




}

exports.resloveDispute = (req, res) => {

        const {winner_id, loser_id, match_id} = req.body;

        Match.findById(match_id, (err, match)=> {
            if(err||!match){
                return res.status(400).json( {
                    errors: [{msg:"Match not found"}],
                });
            }
            else {
                User.findById(winner_id, (err, winner)=> {
                    if(err){
                        return res.status(400).json( {
                            errors: [{msg:"Winner not found"}],
                        });
                    }
                    else {
                        User.findById(loser_id, (err, loser)=> {
                            if(err){
                                return res.status(400).json( {
                                    errors: [{msg:"Loser not found"}],
                                });
                            }
                            else {
                                if(match.under_review_by._id = localStorage.getItem('_id')){
                                    match.winner_id = winner;
                                    match.loser_id= loser;
                                    match.status= "closed"
                                    match.is_dispute = false;
                                    match.save((err, match)=> {
                                        if(err){
                                            return res.status(400).json( {
                                                errors: [{msg:"Error closing the match"}],
                                            });
                                        }
                                        else {
                                            return res.json({
                                                success: true
                                            });
                                        }
                                    })
                                }
                                else {
                                    return res.status(400).json( {
                                        errors: [{msg:"Dispute is under review by another admin"}],
                                    });
                                }


                            }
                        }).select("name email _id")
                    }
                }).select("name email _id")
            }
        })





}

exports.disputes= (req, res)=> {
    console.log("here")
    Match.find({is_dispute: true}).lean()
        .populate("dispute_user_id", 'name')
        .populate("user1_id", "name")
        .populate("user2_id", "name")
        .populate("game_id", "name")
        .populate("under_review_by", "name")
        .exec((err, match)=> {

            for (var i=0 ; i< match.length ; i++){
                console.log("offset:", -300);
                var hours = -300/60;
                console.log("hours: ", hours)
                var minutes = hours*60;
                console.log("mints: ", minutes);
                var seconds = -1 * (minutes*60000);
                console.log("seconds: ", seconds);
                console.log("before: ", new Date(match[i].match_time));
                var result= new Date(match[i].match_time)
                match[i].match_time = new Date(result.getTime()+ seconds);
                console.log("after: ", new Date(match[i].match_time));

            }

             res.render('disputes', {match})
        })
}

exports.getDispute = (req, res)=> {
    res.render('singleDispute',{dispute:req.match})
}

exports.getUser = (req, res)=> {
    res.render('singleUser',{user:req.profile})
}

exports.getConfig = (req, res)=> {
    Config.find({}, (err, result)=> {

       res.render('configuration', {config:result[0]})
    }).lean()
}

exports.forgotPassword = (req, res) => {

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields)=> {
        const {email} = fields;


        if (!fields) return res.render('forgotPassword',{ error: "No email" });
        if (!email)
            return res.render('forgotPassword',{ error: "No Email in request body" });

        console.log("forgot password finding user with that email");

        console.log("signin req.body", email);
        // find the user based on email
        User.findOne({ email }, (err, user) => {
            // if err or no user
            if (err || !user)
                return res.render('forgotPassword',{
                    error: "User with that email does not exist!"
                });

            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );

            // email data
            const emailData = {
                from: "no-reply@btsp.com",
                to: email,
                subject: "Password Reset Instructions",
                text: `Please use the following link to reset your password: ${
                    process.env.CLIENT_URL
                }/reset-password/${token}`,
                html: `<p>Please use the following link to reset your password:</p> <p>${
                    process.env.CLIENT_URL
                }/reset-password/${token}</p>`
            };

            return user.updateOne({ resetPasswordLink: token }, (err, success) => {
                if (err) {
                    return res.json({ message: err });
                } else {
                    sendEmail(emailData);
                    return res.render('forgotPassword',{
                        message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                    });
                }
            });
        });

    })


};

exports.setInviteLimit = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields)=> {
        const {configId, inviteLimit} = fields;

        Config.findById(configId, (err, config)=> {
            if(err || !config){
                return res.json({error: "No config found"})
            }
            else {
                config.inviteLimit = inviteLimit;
                config.save((err, result)=> {
                    return res.json (result)
                })
            }
        })

    });


}