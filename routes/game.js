const express = require("express");
const router = express.Router();

const {createGame} = require("../controllers/game");

router.post("/create_game" , createGame);

module.exports = router;