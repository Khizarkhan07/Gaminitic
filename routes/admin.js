const express = require("express");
const router = express.Router();

const {allusers, hasbothPermission ,hasPermission, assignRole} = require("../controllers/admin");
const {} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.get("/users", requireSignin, hasbothPermission ,allusers)
router.put("/assign_role", requireSignin, hasPermission , assignRole)


module.exports = router;