const express = require("express");
const router = express.Router();
const {set_preference} = require("../controllers/preference");
const {gameById} = require("../controllers/game");
const {userById} = require("../controllers/user");
const {requireSignin} = require('../controllers/auth')

router.post("/set_preference" , requireSignin, set_preference)

router.param("gameId", gameById);
router.param("userId", userById);
module.exports = router;