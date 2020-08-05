const  User = require("../models/user");
const { sendEmail } = require("../helpers");
const jwt = require("jsonwebtoken");
require('dotenv').config()

exports.signup = async (req, res, next)=>{
    req.body.email=req.body.email.toLowerCase();
    const email = req.body.email;
    const userExists = await User.findOne({email:req.body.email});
    if(userExists){
        return res.json({
            error: "Email is taken"
        });
    }

    const user = await new User(req.body);
    await user.save();

    res.status(200).json({message : "Signup is succesfull"});
    verifyAccount(req, res);
    next();
};


verifyAccount = (req, res) => {

    const email = req.body.email;
    console.log(email);

    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "User with that email does not exist!"
            });

        // generate a token with user id and secret
        const token = jwt.sign(
            { _id: user._id, iss: "VERIFIACTIONNODEAPI" },
            process.env.JWT_SECRET
        );

        // email data
        const emailData = {
            from: "no-reply@btsp.com",
            to: email,
            subject: "Verify Car Gaminatic Account Instruction",
            text: `Please click the following link to verify your account: ${
                process.env.CLIENT_URL
            }/verify-account/${token}`,
            html: `<p>Please click the following link to verify your account:</p> <p>${
                process.env.CLIENT_URL
            }/verify-account/${token}</p>`
        };

        return user.updateOne({ verifyAccountLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);

            }
        });
    });

};