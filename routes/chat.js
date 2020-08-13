const express = require("express");
const router = express.Router();
const {chatById, getUserChats, getMessages,  createGroup} = require("../controllers/chats");
const {userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/get_chats/:userId" , getUserChats)
router.get("/get_messages/:chatId" , getMessages)

//group routes
router.post("/create_group" , createGroup)

router.param("userId", userById);
router.param("chatId", chatById);

module.exports = router;