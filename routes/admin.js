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
router.get("/forgotPassword", ((req, res) =>{
    res.render('forgotPassword')
} ))

router.post("/admin_signin" , adminSignin);

router.get("/users",  hasbothPermission ,allusers)
router.get("/get_user/:userId",  hasbothPermission ,getUser)
router.post("/assign_role",  hasPermission , assignRole)

router.get("/disputes",  disputes)
router.get("/disputes/:matchId", hasPermission , getDispute)

router.post("/change_status/",  hasPermission, changeStatus)
router.post("/resolve_dispute/", hasPermission ,resloveDispute)

router.param("matchId", matchById);
router.param("userId", userById);
module.exports = router;