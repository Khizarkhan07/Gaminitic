const Game = require("../models/game");
const Console = require("../models/console");
const Preference = require("../models/preference");
const User = require("../models/user");

exports.prefById = (req, res, next, id)=> {
    Preference.findById(id)
        .exec((err, pref)=>{
            if(err|| !pref){
                return res.status(400).json({
                    errors: {
                        preference: "preference not found"
                    }
                });
            }
            req.pref = pref;
            next();
        });
};



exports.set_preference = (req, res) => {
    const {selectedGame, selectedConsole, difficulty, length} = req.body
    console.log(req.auth._id)
    User.findOne({_id: req.auth._id}, (err, user)=> {
        if(err||!user){
            return res.status(403).json ({
                errors: {
                    auth: "you are unauthorized"
                }
            })
        }
        else {
            Console.findById(selectedConsole, (err, console)=> {
                if(err||!console){
                    return res.status(400).json ({
                        errors: {
                            console: "Console not found"
                        }
                    })
                }
                else {
                    Game.findById(selectedGame, (err, game)=> {
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
                            pref.userId = user;
                            pref.selectedConsole= console;
                            pref.selectedGame = game

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
            Preference.find({userId:user}, (err, prefs)=> {
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
            }).populate('selectedConsole', 'name photo').populate('selectedGame', 'name photo')
        }
    })
}

exports.deletePreference = (req, res)=> {
    if(req.auth._id != req.pref.userId){
        return res.status(403).json({
            errors: {
                auth: "You are unauthorized to perform this action"
            }
        })
    }
    else {
        let pref = req.pref;
        pref.remove((err, response)=> {
            if(err){
                return res.status(400).json({
                    errors: {
                        preference: "Error deleting preference"
                    }
                })
            }
            else {
                return res.json({
                        success: true,
                        message: "Preference deleted successfully!"

                })
            }
        })
    }
}