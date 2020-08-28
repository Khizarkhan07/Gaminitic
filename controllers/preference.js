const Game = require("../models/game");
const Console = require("../models/console");
const Preference = require("../models/preference");
const User = require("../models/user");

exports.set_preference = (req, res) => {
    const {consoleId, gameId, difficulty, length} = req.body
    console.log(req.auth._id)
    console.log(consoleId)
    User.findOne({_id: req.auth._id}, (err, user)=> {
        if(err||!user){
            return res.status(403).json ({
                errors: {
                    auth: "you are unauthorized"
                }
            })
        }
        else {
            Console.findById(consoleId, (err, console)=> {
                if(err||!console){
                    return res.status(400).json ({
                        errors: {
                            console: "Console not found"
                        }
                    })
                }
                else {
                    Game.findById(gameId, (err, game)=> {
                        if(err||!game){
                            return res.status(400).json ({
                                errors: {
                                    game: "game not found"
                                }
                            })
                        }
                        else {
                            let pref = new Preference();
                            pref.difficulty= req.body.difficulty;
                            pref.length= req.body.length;
                            pref.user_id = user;
                            pref.console_id= console;
                            pref.game_id = game

                            pref.save((err, pref)=> {
                                if(err||!pref){
                                    return res.status(400).json ({
                                        errors: {
                                            preference: "error saving preference"
                                        }
                                    })
                                }
                                else {
                                    return res.json(pref)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

exports.allPrefrences = (req, res)=> {
    User.findById(req.auth._id, (err, user)=> {
        if(err||!user){
            return res.status(403).json({
                errors: {
                    auth: "You are not Athprized!"
                }
            })
        }
        else {
            Preference.find({user_id:user}, (err, prefs)=> {
                if(err){
                    return res.status(400).json({
                        errors: {
                            preferences: "Error finding preferences"
                        }
                    })
                }
                else {
                    return res.json({allPreference: prefs})
                }
            }).populate('console_id', 'name photo').populate('game_id', 'name photo')
        }
    })
}