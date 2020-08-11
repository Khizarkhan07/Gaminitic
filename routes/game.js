const express = require("express");
const router = express.Router();

const {createGame, getGames, gameById, getSingleGame} = require("../controllers/game");

router.post("/create_game" , createGame);
router.get("/games" , getGames);
router.get("/game/:gameId" , getSingleGame);

router.param("gameId", gameById);
module.exports = router;