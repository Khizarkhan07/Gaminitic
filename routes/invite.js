const express = require("express");
const router = express.Router();

const {gameById} = require("../controllers/game");
const {userById} = require("../controllers/user");
const {sendInvite, pendingInvites, acceptInvites,
    upcoming, matchesWon, matcheslost, pendingGroupInvites , disputes, matchById, uploadProof, acceptProof, rejectProof, GroupInviteById, acceptGroupInvites} = require("../controllers/invite");
const {requireSignin} = require("../controllers/auth");

router.post("/send_invite", requireSignin, sendInvite);
router.get("/user_invites/:userId",requireSignin ,pendingInvites);
router.get("/group_invites/",requireSignin ,pendingGroupInvites);

router.put("/accept_invite",requireSignin ,acceptInvites);
router.put("/accept_group_invite/:inviteId'",requireSignin ,acceptGroupInvites);
router.get("/upcoming_matches/",requireSignin ,upcoming);
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
router.param("inviteId", GroupInviteById);
module.exports = router;