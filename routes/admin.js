const express = require("express");
const router = express.Router();

const {adminSignin, allusers, hasbothPermission ,hasPermission, assignRole, changeStatus, resloveDispute, disputes, getDispute, isSignedin, getUser} = require("../controllers/admin");
const {} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");
const {matchById} = require("../controllers/invite");
const {userById} = require("../controllers/user");

router.get("/login", ((req, res) =>{
    res.render('login')
} ))

router.post("/admin_signin" , adminSignin);

router.get("/users",  hasbothPermission ,allusers)
router.get("/user/:userId",  hasbothPermission ,getUser)
router.put("/assign_role", requireSignin, hasPermission , assignRole)

router.get("/disputes",  disputes)
router.get("/disputes/:matchId", hasPermission , getDispute)

router.put("/change_status/", requireSignin, hasPermission, changeStatus)
router.post("/resolve_dispute/", hasPermission ,resloveDispute)

router.param("matchId", matchById);
router.param("userId", userById);
module.exports = router;