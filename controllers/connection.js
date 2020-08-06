const  User = require("../models/user");
const  Connection = require("../models/connection");

exports.sendRequest = (req, res) => {
    const {sender_id, receiver_id} = req.body;

    User.findOne({_id: sender_id} , (err, sender)=> {
        if(err || !sender) {
            return res.json({message: "invalid sender"})
        }
        else {
            User.findOne({_id: receiver_id}, (err, receiver) => {
                if(err || !receiver){
                    return res.json({message: "Invalid receiver"})
                }

                Connection.findOne({receiver_id: receiver, sender_id: sender}, (err, connection)=> {
                    if(connection){
                        return res.json({connection, message: "Request already sent"})
                    }
                    else {
                        let connection = new Connection();
                        connection.sender_id = sender;
                        connection.receiver_id = receiver;
                        connection.save();
                        return res.json({message: "Connection Request Sent"})
                    }
                })
            })
        }
    } )
}

exports.viewPending = (req, res) => {
    const {receiver_id} = req.body;
    Connection.find({receiver_id: receiver_id, is_friend: false}).populate('sender_id', 'name email')
        .exec((err, connection)=> {
            return res.json(connection)
        })
}