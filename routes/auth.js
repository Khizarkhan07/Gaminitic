const express = require("express");
const router = express.Router();
const {signup, verifyLink, signin} = require("../controllers/auth");
const {validate, userValidationRules} = require("../validator/index")

router.post("/register", userValidationRules(), validate ,signup);
router.put("/verify-account" ,verifyLink);
router.post("/signin" ,signin);
module.exports = router;