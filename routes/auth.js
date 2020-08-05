const express = require("express");
const router = express.Router();
const {signup} = require("../controllers/auth");
const {validate, userValidationRules} = require("../validator/index")

router.post("/register", userValidationRules(), validate ,signup);

module.exports = router;