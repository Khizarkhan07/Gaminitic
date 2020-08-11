const Game = require("../models/game");

exports.createGame = async (req, res) => {
    req.body.name = req.body.name.toLowerCase();

    const gameExists = await Game.findOne({name: req.body.name});
    if(gameExists){
        return res.json({error: "game already exists"})
    }
    let game = new Game(req.body);
    game.save((err, result)=> {
        if(err||!result){
            return res.json({error: "Could not create game"})
        }
        return res.json(result)
    })
}