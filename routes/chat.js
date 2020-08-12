const express = require("express");
const router = express.Router();
const {chatById, getUserChats, getMessages} = require("../controllers/chats");
const {userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/get_chats/:userId" , getUserChats)
router.get("/get_messages/:chatId" , getMessages)

router.param("userId", userById);
router.param("chatId", chatById);

module.exports = router;