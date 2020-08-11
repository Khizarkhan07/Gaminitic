const _ = require("lodash");
const  User = require("../models/user");
const  Schedule = require("../models/availability");
const formidable = require("formidable");

exports.setschedule = (req, res) => {
    console.log("here")
    Schedule.findOne({user_id: req.profile}, (err, schedule)=> {
        if(schedule){
            return res.json ({message: "Schedule Already exists"})
        }
        else{
            let schedule = new Schedule();
            schedule.user_id = req.profile
            //hardoced for testing purposes

            if(req.body.monday){
                const monday = req.body.monday;

                for (var i =0; i<monday.length; i++){
                    schedule.monday[i] = monday[i];
                }
            }

            if(req.body.tuesday){
                for (var i =0; i<req.body.tuesday.length; i++){
                    schedule.tuesday[i] = req.body.tuesday[i];
                }
            }
            if(req.body.wednesday){
                for (var i =0; i<req.body.wednesday.length; i++){
                    schedule.wednesday[i] = req.body.wednesday[i];
                }
            }
            if(req.body.thursday){
                for (var i =0; i<req.body.thursday.length; i++){
                    schedule.thursday[i] = req.body.thursday[i]  ;
                }
            }
            if(req.body.friday){
                for (var i =0; i<req.body.friday.length; i++){
                    schedule.friday[i] = req.body.friday[i]  ;
                }
            }
            if(req.body.saturday){
                for (var i =0; i<req.body.saturday.length; i++){
                    schedule.saturday[i] = req.body.saturday[i]  ;
                }
            }
            if(req.body.sunday){
                for (var i =0; i<req.body.sunday.length; i++){
                    schedule.sunday[i] = req.body.sunday[i]  ;
                }
            }


            schedule.save((err, schedule)=> {
                if(err|| !schedule){
                    return res.json({err: "error saving schedule"})
                }
                return res.json(schedule)
            });
        }
    })
}

exports.getschedule = (req, res)=> {
    Schedule.findOne({user_id: req.profile}, (err,schedule)=> {
        if(err || !schedule){
            return res.json({err: "No schedule found for this user"})
        }
        return res.json(schedule);
    })
}

exports.updateschedule = (req, res) => {
    console.log("here")
    Schedule.findById(req.body.scheduleId, (err, schedule)=> {
        if(err || !schedule){
            return res.json ({err: "Invalid Schedule iD, schedule doesnot exists"})
        }
        else{

            //hardoced for testing purposes
             //req.body.tuesday = [new Date(Date.now())]
            if(req.body.monday){
                const monday = req.body.monday;

                for (var i =0; i<monday.length; i++){
                    schedule.monday[i] = monday[i];
                }
            }

            if(req.body.tuesday){
                for (var i =0; i<req.body.tuesday.length; i++){
                    schedule.tuesday[i] = req.body.tuesday[i];
                }
            }
            if(req.body.wednesday){
                for (var i =0; i<req.body.wednesday.length; i++){
                    schedule.wednesday[i] = req.body.wednesday[i];
                }
            }
            if(req.body.thursday){
                for (var i =0; i<req.body.thursday.length; i++){
                    schedule.thursday[i] = req.body.thursday[i]  ;
                }
            }
            if(req.body.friday){
                for (var i =0; i<req.body.friday.length; i++){
                    schedule.friday[i] = req.body.friday[i]  ;
                }
            }
            if(req.body.saturday){
                for (var i =0; i<req.body.saturday.length; i++){
                    schedule.saturday[i] = req.body.saturday[i]  ;
                }
            }
            if(req.body.sunday){
                for (var i =0; i<req.body.sunday.length; i++){
                    schedule.sunday[i] = req.body.sunday[i]  ;
                }
            }


            schedule.save((err, schedule)=> {
                if(err|| !schedule){
                    return res.json({err: "error saving schedule"})
                }
                return res.json(schedule)
            });
        }
    })
}
