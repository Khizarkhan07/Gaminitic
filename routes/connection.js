const express = require("express");
const router = express.Router();

const {sendRequest} = require("../controllers/connection");
const {userById} = require("../controllers/user");
const {requireSignin} = require("../controllers/auth");

router.post("/send_request", requireSignin ,sendRequest);

router.param("userId", userById);

module.exports = router;