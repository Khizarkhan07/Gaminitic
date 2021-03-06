const express = require("express");
const router = express.Router();
const {signup,
    verifyLink,
    signin,
    sendOtp,
    Otpsignin ,
    signout,
    forgotPassword,
    resetPassword,
    setQuestion,
    getQuestion ,
    checkAnswer ,
    resetPasswordSecurity, signupOtp, verifyNumber ,requireSignin } = require("../controllers/auth");
const {validate, userValidationRules, passwordlidationRules, securityvalidationRules} = require("../validator/index")


router.post("/phone_register",signupOtp);
router.post("/register", userValidationRules(), validate ,signup);
router.post("/phone_verify",verifyNumber);
router.put("/verify-account" ,verifyLink);
router.post("/signin" ,signin);
router.get("/signout", signout);
router.put("/sendOtp" ,sendOtp);
router.put("/otp_login" ,Otpsignin);
router.put("/forgot_password", forgotPassword);
router.put("/reset_password", passwordlidationRules(), validate,  resetPassword);
router.put("/set_question",requireSignin ,securityvalidationRules(), validate,  setQuestion);
router.post("/get_question" ,getQuestion);
router.post("/check_answer",checkAnswer);
router.put("/reset_password_security",passwordlidationRules(), validate ,resetPasswordSecurity);

module.exports = router;