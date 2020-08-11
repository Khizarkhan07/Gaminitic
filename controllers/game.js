const Game = require("../models/game");


exports.gameById = (req, res, next, id)=> {
    Game.findById(id)
        .exec((err, game)=>{
            if(err|| !game){
                return res.status(400).json({
                    error: "game not found"
                });
            }
            req.game = game;
            next();
        });
};


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

exports.getGames = (req, res) => {
    Game.find((err, game)=> {
        return res.json(game)
    })
}
exports.getSingleGame = (req, res)=> {
    return res.json (req.game);
}