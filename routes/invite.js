const express = require("express");
const router = express.Router();

const {gameById} = require("../controllers/game");
const {userById} = require("../controllers/user");
const {sendInvite, pendingInvites, acceptInvites,
    upcoming, matchesWon, matcheslost , disputes, matchById, uploadProof, acceptProof, rejectProof} = require("../controllers/invite");
const {requireSignin} = require("../controllers/auth");

router.post("/send_invite", requireSignin, sendInvite);
router.get("/user_invites/:userId",requireSignin ,pendingInvites);

router.put("/accept_invite",requireSignin ,acceptInvites);
router.get("/upcoming_matches/:userId",requireSignin ,upcoming);
router.get("/matches_won/:userId", requireSignin ,matchesWon);
router.get("/matches_lost/:userId", requireSignin ,matcheslost);
router.get("/disputes/:userId", requireSignin ,disputes);

//match end routes
router.put("/upload_proof/:matchId", requireSignin , uploadProof)
router.put("/accpet_proof/", requireSignin , acceptProof)
router.put("/reject_proof/" , rejectProof)

router.param("gameId", gameById);
router.param("matchId", matchById);
router.param("userId", userById);
module.exports = router;