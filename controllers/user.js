const _ = require("lodash");
const  User = require("../models/user");
const  Block = require("../models/block_history");
const fs = require("fs");
const formidable = require("formidable");

exports.userById = (req, res, next, id)=> {
    User.findById(id).lean()
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

exports.userProfile = (req, res)=> {
    User.findById(req.auth._id, (err, user)=> {
        if(err||!user){
            return res.status(403).json({
                errors: {
                    auth: "You are not Authorized!"
                }
            })
        }
        else {
            const {_id, name, email, username, user_number, photo, psn_tag, xbox_tag, coins, wallet}= user;
            return res.json({
                success: true,
                user: {_id, name , email, userName:username, userNumber:user_number, photo: photo , psnTag: psn_tag
                    , xboxTag:xbox_tag, coins, wallet}
            });
        }
    })
}

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

    const autherized = req.profile && req.auth && req.profile._id == req.auth._id;
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

exports.changePrivacy = (req, res) => {
    const {userId} = req.params;

    User.findOne({_id:userId}, (err, user)=> {
        if(err|| !user){
            return res.json("invalid user id")
        }
        updatedFiled = {
            is_public : !user.is_public
        }
        user = _.extend(user, updatedFiled);
        user.save((err, user)=> {
            if(err || !user){
                return res.json(err)
            }
            return res.json({user, message: "Privacy changed"})
        })
    })
}

exports.blockuser = (req, res) => {
    let block = new Block();
    block.user_blocked = req.profile;
    block.reason = req.body.reason;
    block.save((err, result)=> {
        if(err || !result){
            return res.json({err: "User not blocked"})
        }
        else {
            User.findById( req.auth._id, (err, user)=> {
                if(err||!user){
                    return res.json({err})
                }
                else {
                    result.hashed_password= undefined;
                    result.salt= undefined;
                    result.verifyAccountLink= undefined;
                    result.role = undefined;
                    result.blocked_users= undefined;
                    user.blocked_users.push(result);
                    user.save((err, user)=> {
                        if(err||!user) {
                            return res.json({err: "error occured while blocking"})
                        }
                        else {
                            return res.json({ message: "User blocked"})
                        }
                    })
                }
            })
        }
    })

}

exports.unblockuser = (req, res) => {
    Block.findById(req.body.blockId, (err, block)=> {
        if(err||!block){
            return res.json ({err: "Error while unblocking"})

        }
        updatedFields ={
            unblocked: true,
            unblocked_at: Date.now()
        }
        block = _.extend(block, updatedFields);

        block.save((err, result)=> {
            if(err||!result){
                return res.json ({err: "Error while unblocking"})
            }
            else {
                return res.json({message: "User unblocked"})
            }
        })
    })
}

exports.getblockeduser = (req, res) => {
    User.findById(req.params.userId)
        .populate({
            path: 'blocked_users',
            match: { unblocked: false },
            populate: {
                path:'user_blocked',
            }
        })
        .exec((err, user)=>{
            if(err|| !user){
                return res.status(400).json({
                    error: "User not found"
                });
            }
            return res.json(user)
        });
}