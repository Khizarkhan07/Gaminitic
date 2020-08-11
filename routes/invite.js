const express = require("express");
const router = express.Router();

const {gameById} = require("../controllers/game");
const {userById} = require("../controllers/user");
const {sendInvite} = require("../controllers/invite");
const {requireSignin} = require("../controllers/auth");

router.post("/send_invite", requireSignin, sendInvite);


router.param("gameId", gameById);
router.param("userId", userById);
module.exports = router;