const express = require("express");
const router = express.Router();

const {adminSignin, allusers, hasbothPermission ,hasPermission, setInviteLimit, getConfig ,assignRole, changeStatus, resloveDispute, disputes, getDispute, isSignedin, getUser ,forgotPassword} = require("../controllers/admin");
const {requireSignin} = require("../controllers/auth");
const {matchById} = require("../controllers/invite");
const {userById} = require("../controllers/user");

router.get("/", ((req, res) =>{
    res.render('login', {layout: "main1.hbs"})
} ))

router.get("/login", ((req, res) =>{
    res.render('login', {layout: "main1.hbs"})
} ))
router.get("/forgot-password", ((req, res) =>{
    res.render('forgotPassword', {layout: "main1.hbs"})
} ))

router.post("/admin_signin" , adminSignin);

router.get("/users" ,hasbothPermission ,allusers)
router.get("/user/:userId",  hasbothPermission ,getUser)
router.get("/config/",  hasbothPermission ,getConfig)
router.post("/assign_role", requireSignin ,hasPermission , assignRole)
router.post("/set_limit" , setInviteLimit)

router.get("/disputes",  disputes)
router.get("/disputes/:matchId", hasPermission , getDispute)

router.post("/change_status/", requireSignin ,hasPermission, changeStatus)
router.post("/resolve_dispute/",requireSignin ,hasPermission ,resloveDispute)

router.post("/admin_forgot_password", forgotPassword);

router.param("matchId", matchById);
router.param("userId", userById);
module.exports = router;