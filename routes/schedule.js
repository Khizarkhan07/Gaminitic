const express = require("express");
const router = express.Router();

const {setschedule, getschedule, updateschedule} = require("../controllers/schedule");
const {userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.post('/set_schedule/', requireSignin  , setschedule);
router.put('/update_schedule/', requireSignin  , updateschedule);
router.get('/get_schedule/:userId', requireSignin , getschedule)

router.param("userId", userById);

module.exports = router;