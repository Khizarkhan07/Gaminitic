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
    resetPasswordSecurity} = require("../controllers/auth");
const {validate, userValidationRules, passwordlidationRules, securityvalidationRules} = require("../validator/index")

router.post("/register", userValidationRules(), validate ,signup);
router.put("/verify-account" ,verifyLink);
router.post("/signin" ,signin);
router.get("/signout", signout);
router.put("/sendOtp" ,sendOtp);
router.put("/otp_login" ,Otpsignin);
router.put("/forgot_password", forgotPassword);
router.put("/reset_password", passwordlidationRules(), validate,  resetPassword);
router.put("/set_question", securityvalidationRules(), validate,  setQuestion);
router.post("/get_question", getQuestion);
router.post("/check_answer", checkAnswer);
router.put("/reset_password_security",passwordlidationRules(), validate ,resetPasswordSecurity);

module.exports = router;