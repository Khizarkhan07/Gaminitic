const express = require("express");
const router = express.Router();

const {setschedule} = require("../controllers/schedule");
const {userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.post('/set_schedule/:userId'  , setschedule)

router.param("userId", userById);

module.exports = router;