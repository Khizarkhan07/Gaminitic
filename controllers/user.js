const _ = require("lodash");
const  User = require("../models/user");
const fs = require("fs");
const formidable = require("formidable");

exports.userById = (req, res, next, id)=> {
    User.findById(id)
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

exports.updateuser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Photo cannot be uploaded"
            });
        }
        let user = req.profile;
        user = _.extend(user, fields);
        user.updated = Date.now();

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
            user.photo = temp
        }
        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);

        });
    })
}




exports.isOwner = (req, res, next)=>{
    const autherized = req.profile && req.auth && req.profile._id === req.auth._id;
    if(!autherized){
        return res.status(403).json({
            error: "You are not athorized to perform this action!"
        })
    }
    next();
};


exports.searchUsers = (req, res)=> {
    const name = req.query.q;
    var pattern = new RegExp("(" +
        name +
        ")", 'i');
    User.find({$or:[{name: pattern}, {email: pattern}]}, (err, user)=>{
        if(err){
            return res.status(400).json({error: err})
        }
        else {
            res.json(user);
        }
    }).select("_id name email")
};
