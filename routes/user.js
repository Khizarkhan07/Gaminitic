const express = require("express");
const router = express.Router();

const {getuser, userById, updateuser, isOwner ,searchUsers, blockuser, unblockuser, getblockeduser} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/get_user/:userId", requireSignin ,getuser);
router.put("/user/:userId", requireSignin , isOwner ,updateuser);
router.get("/searchUser", requireSignin ,searchUsers);

// Block/unblock routes
router.put("/block/:userId", requireSignin ,blockuser)
router.put("/unblock/:userId", requireSignin ,unblockuser)
router.get("/get_blocked_users/:userId", getblockeduser )


router.param("userId", userById);

module.exports = router;