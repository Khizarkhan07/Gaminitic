const express = require("express");
const router = express.Router();

const {sendRequest , viewPending, acceptRequest} = require("../controllers/connection");
const {userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.post("/send_request", requireSignin ,sendRequest);
router.get("/view_pending", requireSignin ,viewPending);
router.put("/accept_request",requireSignin ,acceptRequest);

router.param("userId", userById);

module.exports = router;