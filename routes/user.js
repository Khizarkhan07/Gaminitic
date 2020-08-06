const express = require("express");
const router = express.Router();

const {getuser, userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/user/:userId", requireSignin ,getuser);
router.param("userId", userById);

module.exports = router;