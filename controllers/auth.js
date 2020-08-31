const  User = require("../models/user");
const  Temp_user = require("../models/temp_user");
const { sendEmail } = require("../helpers");
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const _ = require("lodash");
require('dotenv').config()
const accountSid = 'AC895edaa2425fe883fd4414c9607a029c';
const authToken = 'e12a6875deb23866ef8eaa77afd9c436';
const client = require('twilio')(accountSid, authToken);
const requestIp = require('request-ip');


// to register phone number in temporary table and
//send otp
exports.signupOtp = async (req, res) => {
    const user_number = req.body.user_number;
    console.log(user_number);

    //checking if user with phone number already exists

    const numberExists = await User.findOne({user_number: req.body.user_number});
    if (numberExists) {
        return res.status(400).json({
            errors: {
                user_number: "Phone number is taken"
            }
        })
    }

    //check for the enviornment, if local send 0000 otp
    // for testing purpose.

    if(process.env.enviornment = 'local'){
        console.log("here")
        const temp_user = await new Temp_user(req.body);
        temp_user.otp = "0000";

        temp_user.save((err, user)=> {
            if (err) {
                return res.status(400).json({
                    errors: {
                        err
                    }
                })
            }

            else {
                return res.json({
                    message: "Your otp is 0000"
                })

            }
        })
    }
    //if enviornment is not local use twilio to send otp
    else {
        // generate a otp
        const otp = (Math.floor(100000 + Math.random() * 900000));
        const temp_user = await new Temp_user(req.body);
        temp_user.otp = otp;

        temp_user.save((err, user)=> {
            if (err) {
                return res.status(400).json({
                    errors: {
                        err
                    }
                })
            }

            else {
                client.messages
                    .create({
                        body: `This is your gaminatic otp: ${otp}`,
                        from: '+19097841248',
                        to: user_number
                    })
                    .then(message => res.json({message}))
                    .catch(e=> res.status(400).json({
                        errors: {
                            user_number: "Invalid Phone Number"
                        }
                    }));

            }
        })
    }


}

// to verify otp and progress to signup.

exports.verifyNumber =  (req, res) => {
    const otp= req.body.otp;

    //verify phone number with otp
    Temp_user.findOne({otp}, (err, user)=>{
        if(err || !user){
            return res.status(400).json({
                errors: {
                    otp: "invalid otp"
                }
            })
        }

        //update otp to null once it is verified
        return user.updateOne({ otp: "" }, (err, success) => {
            if (err) {
                return res.jstatus(400).json({
                    errors: {
                        err
                    }
                })
            } else {
                return res.json({ message: "Verified" });
            }
        });


    });
}



//to signup after otp is verified
//create an actual document of user in the application
//with same phone number

exports.signup = async (req, res, next)=>{

    //check user with phone number already exist in verified phone numbers
    // if not, cannot progress to signup

    const numberExists = await Temp_user.findOne({user_number:req.body.user_number});
        if (!numberExists){
            return res.status(400).json({

                errors: {
                    user_number: "phone number is not verified"
                }
            });
        }
        else {
            //storing ip address of user
            const ipAddress = requestIp.getClientIp(req);
            req.body.ipAddress = ipAddress;
            console.log(ipAddress)

            req.body.email=req.body.email.toLowerCase();
            console.log(req.body.username);

            //check for username
            const usernameExists = await User.findOne({username:req.body.username});
            if(usernameExists){
                console.log("here")
                return res.status(400).json({
                    errors: {
                        username: "User name is already taken"
                    }
                });
            }

            //check for existing email
            const userExists = await User.findOne({email:req.body.email});
            if(userExists){
                return res.status(400).json({
                    errors: {
                        email: "Email is already taken"
                    }
                });
            }
            else {
                //creating user

                let user = await new User(req.body)
                user.ipAddress = ipAddress;

                user.save((err, user)=> {
                    if(err){
                        return res.jstatus(400).json({
                            errors: {
                                err
                            }
                        })
                    }
                    else {


                        //removing phone number from temporary table
                        //once the signup is completed

                        Temp_user.remove({user_number:req.body.user_number}, (err, result)=> {
                            if(err){
                                console.log(err);
                            }
                            console.log("deleted")
                        });

                        // creating jwt token with user id
                        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

                        res.cookie("t", token, {expire: Date.now()+999});

                        const {_id, name, email, username, user_number, photo, psn_tag, xbox_tag, coins, wallet}= user;

                        return res.json({
                            success: true,
                            user: {_id, name , email, token, userName:username, userNumber:user_number, photo: "https://www.gaminatic.hexaadev.com"+photo , psnTag: psn_tag
                                , xboxTag:xbox_tag, coins, wallet}
                        });
                    }
                })
            }


        }
};

//send verification email to user

verifyAccount = (req, res) => {

    const email = req.body.email;
    console.log(email);

    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status(400).json({
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

        //store verification link in db against the user
        return user.updateOne({ verifyAccountLink: token }, (err, success) => {
            if (err) {
                return res.status(400).json({ message: err });
            } else {
                //helper method to send email
                sendEmail(emailData);
                res.json({message: "sign up success"})
            }
        });
    });

};


//verify user when user clicks on verification link

exports.verifyLink = (req, res) => {
    const { verifyAccountLink } = req.body;

    //find user with verification link
    User.findOne({ verifyAccountLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "Invalid Link!"
            });

        //if user found update fields
        const updatedFields = {
            verifyAccountLink: "",
            is_activated: true
        };

        //update user
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


// to sign in with email or phone
exports.signin =  (req, res) => {

    //converting to lower case to remove sensitivity

    if(req.body.email_or_phone){
        req.body.email_or_phone= req.body.email_or_phone.toLowerCase();
    }


    const {email_or_phone , password} = req.body;

    //find user with email or phone
    User.findOne({ $or: [ { email: email_or_phone }, { user_number: email_or_phone } ] }, (err, user)=>{
        if(err || !user){
            return res.status(400).json({
                errors: {
                    success : false,
                    email: "User with email doesnot exists"
                }
            })
        }

        //if password doesnot match
        //authenticate: a virtual method for users model to bycrypt password

        if (!user.authenticate(password)){
            return res.status(400).json({
                errors: {
                    success : false,
                    password: "Email and password doesnot match!"
                }
            })
        }

        //update user timezone variables:

        user.abv = req.body.abv;
        user.timeZone =  req.body.timeZone;
        user.offset = req.body.offset;
        user.isDst = req.body.isDst;

        user.save((err, saved)=> {
            if(err|| !saved){
                return res.status(400).json ( {
                    errors: {
                       time: "Time variables not updated"
                    }
                })
            }
        })

        //create token if user is signed in
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

        res.cookie("t", token, {expire: Date.now()+999});

        const {_id, name, email, username, user_number, photo, psn_tag, xbox_tag, coins, wallet}= user;

        return res.json({
            success: true,
            user: {_id, name , email, token, userName:username, userNumber:user_number, photo: photo, psnTag: psn_tag
                , xboxTag:xbox_tag, coins, wallet}
        });
    });
}




exports.signout = (req, res)=> {
    res.clearCookie("t");
    return res.json({message: "Signout successfull"});
}


//middleware method to check jwt token and authenticate

exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",
    algorithms: ['HS256']
});


//api for otp login, sends otp to number if number exists : not integrated

exports.sendOtp = (req, res) => {
    const user_number = req.body.user_number;
    console.log(user_number);

    User.findOne({ user_number }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status(400).json({
                error: "User with that phone number does not exist!"
            });

        // generate a otp
        const otp= (Math.floor(100000 + Math.random() * 900000));


    return user.updateOne({ otp: otp }, (err, success) => {
        if (err) {
            return res.status(400).json({ message: err });
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

//enter otp to login : not integrated

exports.Otpsignin =  (req, res) => {
    const otp= req.body.otp;

    User.findOne({otp}, (err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: "Invalid Otp"
            })
        }

        //update user otp to empty once verified

        return user.updateOne({ otp: "" }, (err, success) => {
            if (err) {
                return res.status(400).json({ error: err });
            } else {

                //return token once verification is done to logib the user

                const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

                res.cookie("t", token, {expire: Date.now()+999});

                const {_id, name, email}= user;
                return res.json({user: {_id, name , email, token}});
            }
        });


    });
}


//send password recovery email to email: not integrated

exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: "No request body" });
    if (!req.body.email)
        return res.status(400).json({ message: "No Email in request body" });

    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status(400).json({
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
                return res.status(400).json({ error: err });
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
            return res.status(400).json({
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
                return res.status(400).json({
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
    const {security_question, security_answer } = req.body;

    User.findById(req.auth._id, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status(400).json({
                error: {
                    auth: "user not logged in!"
                }
            });

        const updatedFields = {
            security_question: security_question,
            security_answer: security_answer,
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
            return res.status(400).json({
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
            return res.status(400).json({
                error: "Incorrect phone number"
            });
        else {
            User.findOne({user_number, security_question}, (err, user)=> {
                if(err|| !user){
                    return res.status(400).json({
                        error: "Incorrect Question"
                    });
                }
                else {
                    User.findOne({user_number, security_question, security_answer}, (err, user)=> {
                        if(err|| !user){
                            return res.status(400).json({
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
            return res.status(400).json({
                error: "Invalid User!"
            });

        const updatedFields = {
            password: newPassword,
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
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};
