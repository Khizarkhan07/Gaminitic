const express = require("express");
const router = express.Router();

const {getuser, userById, updateuser, isOwner} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/user/:userId", requireSignin ,getuser);
router.put("/user/:userId", requireSignin , isOwner ,updateuser);

router.param("userId", userById);

module.exports = router;