const Game = require("../models/game");
const Console = require("../models/console");


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
    let game = new Game();
    game.name = req.body.name;

    const dif = ["rookie", "moderate", "hard"]
    req.body.difficulties= dif;

    const len = ["5 mins", "15 mins", "30 mins"]
    req.body.lengths= len;

    for(var i=0; i<req.body.difficulties.length; i++){
        game.difficulties[i]= req.body.difficulties[i];
    }


    for(var i=0; i<req.body.lengths.length; i++){
        game.lengths[i]= req.body.lengths[i];
    }

    game.save((err, result)=> {
        if(err||!result){
            return res.json({error: "Could not create game"})
        }
        return res.json(result)
    })
}


exports.addConsole = async (req, res) => {
    req.body.name = req.body.name.toLowerCase();

    const gameExists = await Console.findOne({name: req.body.name});
    if(gameExists){
        return res.status(400).json({
            error: {
                console: "console already exists"
            }
        })
    }
    let console = new Console(req.body);
    console.save((err, result)=> {
        if(err||!result){
            return res.status(400).json({
                error: {
                    console: "Error adding console"
                }
            })
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

exports.getConsoles = (req, res) => {
    Console.find((err, game)=> {
        return res.json(game)
    })
}