const express = require("express");
const router = express.Router();

const {createGame, getGames, gameById, getSingleGame, addConsole, getConsoles} = require("../controllers/game");
const {requireSignin} = require('../controllers/auth')

router.post("/create_game" , createGame);
router.post("/add_console" , addConsole);
router.get("/games", requireSignin , getGames);
router.get("/consoles", requireSignin , getConsoles);
router.get("/game/:gameId" , getSingleGame);

router.param("gameId", gameById);
module.exports = router;