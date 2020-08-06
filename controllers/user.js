const _ = require("lodash");
const  User = require("../models/user");
const fs = require("fs");

exports.userById = (req, res, next, id)=> {
    User.findById(id)
        .populate('following', '_id, name')
        .populate('followers', '_id, name')
        .exec((err, user)=>{
            if(err|| !user){
                return res.status(400).json({
                    error: "User not found"
                });
            }
            req.profile = user;
            next();
        });
};


exports.getuser = (req, res)=>{
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}
