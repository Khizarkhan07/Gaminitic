const express = require("express");
const router = express.Router();

const {getuser, userById, updateuser, isOwner ,searchUsers, changePrivacy} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/user/:userId", requireSignin ,getuser);
router.put("/user/:userId", requireSignin , isOwner ,updateuser);
router.put("/change_privacy/:userId", requireSignin , isOwner ,changePrivacy);
router.get("/searchUser", requireSignin ,changePrivacy);

router.param("userId", userById);

module.exports = router;