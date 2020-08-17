const express = require("express");
const router = express.Router();

const {allusers, hasbothPermission ,hasPermission, assignRole, changeStatus, resloveDispute} = require("../controllers/admin");
const {} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");
const {matchById} = require("../controllers/invite");

router.get("/login", ((req, res) =>{
    res.render('login')
} ))

router.get("/users", requireSignin, hasbothPermission ,allusers)
router.put("/assign_role", requireSignin, hasPermission , assignRole)
router.get("/disputes", requireSignin, hasPermission)
router.put("/change_status/", requireSignin, hasPermission, changeStatus)
router.put("/resolve_dispute/", requireSignin, hasPermission, resloveDispute)

router.param("matchId", matchById);
module.exports = router;