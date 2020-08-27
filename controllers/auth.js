const  User = require("../models/user");
const { sendEmail } = require("../helpers");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const _ = require("lodash");
require('dotenv').config()
const accountSid = 'AC895edaa2425fe883fd4414c9607a029c';
const authToken = 'e12a6875deb23866ef8eaa77afd9c436';
const client = require('twilio')(accountSid, authToken);
const requestIp = require('request-ip');



exports.signupOtp = async (req, res) => {
    const user_number = req.body.user_number;
    console.log(user_number);

    const numberExists = await User.findOne({user_number: req.body.user_number});
    if (numberExists) {
        return res.json({
            error: "Phone number is taken"
        });
    }

    // generate a otp
    const otp = (Math.floor(100000 + Math.random() * 900000));
    const user = await new User(req.body);
    user.otp = otp;

    user.save((err, user)=> {
        if (err) {
            return res.json({message: err});}
        else {
            client.messages
                .create({
                    body: `This is your gaminatic otp: ${otp}`,
                    from: '+19097841248',
                    to: user_number
                })
                .then(message => res.json({message: "Otp is send to your phone number"}));

        }
    })


}


exports.verifyNumber =  (req, res) => {
    const otp= req.body.otp;

    User.findOne({otp}, (err, user)=>{
        if(err || !user){
            return res.json({
                error: "Invalid Otp"
            })
        }

        return user.updateOne({ otp: "" }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

                res.cookie("t", token, {expire: Date.now()+999});

                const {_id, name, email}= user;
                return res.json({user: {_id, name , email, token}});
            }
        });


    });
}



exports.signup = async (req, res, next)=>{
    const ipAddress = requestIp.getClientIp(req);
    req.body.ipAddress = ipAddress;
    console.log(ipAddress)
    req.body.email=req.body.email.toLowerCase();
    const email = req.body.email;
    const userExists = await User.findOne({email:req.body.email});
    if(userExists){
        return res.json({
            error: "Email is taken"
        });
    }
    const numberExists = await User.findOne({user_number:req.body.user_number});
    if(numberExists){
        return res.json({
            error: "Phone number is taken"
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
            subject: "Verify Gaminatic Account Instruction",
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

exports.verifyLink = (req, res) => {
    const { verifyAccountLink } = req.body;
    User.findOne({ verifyAccountLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "Invalid Link!"
            });

        const updatedFields = {
            verifyAccountLink: "",
            is_activated: true
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();
        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! You have verified your account`
            });
        });
    });
};


exports.signin =  (req, res) => {
    if(req.body.email){
        req.body.email= req.body.email.toLowerCase();
    }
    console.log(req.body.email)
    const {email , password} = req.body;

    User.findOne({email}, (err, user)=>{
        if(err || !user){
            return res.json({
                error: "User with this email doesnot exist!"
            })
        }
        if (!user.authenticate(password)){
            return res.json({
                error: "Email and password doesnot match!"
            })
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

        res.cookie("t", token, {expire: Date.now()+999});

        const {_id, name, email}= user;
        return res.json({user: {_id, name , email, token}});
    });
}

exports.signout = (req, res)=> {
    res.clearCookie("t");
    return res.json({message: "Signout successfull"});
}

exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",
    algorithms: ['HS256']
});



exports.sendOtp = (req, res) => {
    const user_number = req.body.user_number;
    console.log(user_number);

    User.findOne({ user_number }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "User with that phone number does not exist!"
            });

        // generate a otp
        const otp= (Math.floor(100000 + Math.random() * 900000));


    return user.updateOne({ otp: otp }, (err, success) => {
        if (err) {
            return res.json({ message: err });
        } else {
            client.messages
                .create({
                    body: `This is your gaminatic login otp: ${otp}`,
                    from: '+19097841248',
                    to: user_number
                })
                .then(message => res.json({message: "Otp is send to your phone number"}));

        }
    });
});

}


exports.Otpsignin =  (req, res) => {
    const otp= req.body.otp;

    User.findOne({otp}, (err, user)=>{
        if(err || !user){
            return res.json({
                error: "Invalid Otp"
            })
        }

        return user.updateOne({ otp: "" }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

                res.cookie("t", token, {expire: Date.now()+999});

                const {_id, name, email}= user;
                return res.json({user: {_id, name , email, token}});
            }
        });


    });
}

exports.forgotPassword = (req, res) => {
    if (!req.body) return res.json({ message: "No request body" });
    if (!req.body.email)
        return res.json({ message: "No Email in request body" });

    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
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
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "Invalid Link!"
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};


exports.setQuestion = (req, res) => {
    const {user_number, security_question, security_answer } = req.body;

    User.findOne({ user_number }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "Invalid phone number!"
            });

        const updatedFields = {
            security_question: security_question,
            security_answer: security_answer,
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.json({
                    error: err
                });
            }
            res.json({
                result
            });
        });
    });
};

exports.getQuestion = (req, res) => {
    const {user_number} = req.body;

    User.findOne({ user_number }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "Invalid phone number!"
            });
        res.json({
            user
        });
    }).select("security_question user_number");
};

exports.checkAnswer = (req, res) => {
    const {user_number, security_question, security_answer} = req.body;
    console.log(user_number)
    User.findOne({ user_number }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "Incorrect phone number"
            });
        else {
            User.findOne({user_number, security_question}, (err, user)=> {
                if(err|| !user){
                    return res.json({
                        error: "Incorrect Question"
                    });
                }
                else {
                    User.findOne({user_number, security_question, security_answer}, (err, user)=> {
                        if(err|| !user){
                            return res.json({
                                error: "Incorrect Answer"
                            });
                        }
                        else {
                            return res.json({
                                success: true
                            });
                        }
                    })
                }
            })

        }

    }).select("security_question security_answer user_number");
};

exports.resetPasswordSecurity = (req, res) => {
    const { user_number , newPassword , security_question, security_answer} = req.body;

    User.findOne({ user_number, security_question, security_answer}, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.json({
                error: "Invalid User!"
            });

        const updatedFields = {
            password: newPassword,
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};
