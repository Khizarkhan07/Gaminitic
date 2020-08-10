const express = require("express");
const router = express.Router();

const {getuser, userById, updateuser, isOwner ,searchUsers, changePrivacy, blockuser, unblockuser} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/user/:userId", requireSignin ,getuser);
router.put("/user/:userId", requireSignin , isOwner ,updateuser);
router.put("/change_privacy/:userId", requireSignin , isOwner ,changePrivacy);
router.get("/searchUser", requireSignin ,changePrivacy);


// Block/unblock routes
router.put("/block/:userId", requireSignin ,blockuser)
router.put("/unblock/", requireSignin ,unblockuser)
router.param("userId", userById);

module.exports = router;