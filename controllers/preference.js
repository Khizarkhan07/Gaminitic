const Game = require("../models/game");
const Console = require("../models/console");
const Preference = require("../models/preference");
const User = require("../models/user");

//find preference by id and append to req object
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


//set prefernce of console/games and rules
exports.set_preference = (req, res) => {

    //do update if body contains a preferenceId
    if(req.body.preferenceId) {
        Preference.findById(req.body.preferenceId, (err, pref)=> {
            if(err||!pref){
                return res.status(400).json({
                    errors: {
                        preference: "Preference not found"
                    }
                })
            }
            else {
                //check to see if user is updating his own preference

                if(pref.userId._id != req.auth._id){
                    return res.status(403).json({
                        errors: {
                            auth: "You are not authorized to perform this action"
                        }
                    })
                }
                else {
                    const {selectedGame, selectedConsole} = req.body

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

                                    pref.difficulty= req.body.difficulty;
                                    pref.length= req.body.length;
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
            }
        })
    }

    //create a new preference if body doesnot contain a preferenceId
    else {
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
}

//find preferences of a specific user
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


//delete preference of a user
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