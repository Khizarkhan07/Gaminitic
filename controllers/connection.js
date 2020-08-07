const  User = require("../models/user");
const  Connection = require("../models/connection");
const _ = require("lodash");

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
    Connection.find({receiver_id: receiver_id, is_friend: false, deleted_at: null}).populate('sender_id', 'name email')
        .exec((err, connection)=> {
            return res.json(connection)
        })
}

exports.acceptRequest = (req, res) => {
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
                    if(!connection || err) {
                        return res.json ({error: "no connection request exists"})
                    }
                    else {
                        const updatedFields = {
                            is_friend: true

                        };

                        connection = _.extend(connection, updatedFields);
                        connection.save((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: err
                                });
                            }
                            res.json({
                                result,
                                message: `Request accepted`
                            });
                        });
                    }
                })
            })
        }
    } )
}


exports.rejectRequest = (req, res) => {
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
                    if(!connection || err) {
                        return res.json ({error: "no connection request exists"})
                    }
                    else {
                        const updatedFields = {
                            is_friend: false,
                        };

                        connection = _.extend(connection, updatedFields);
                        connection.deleted_at = Date.now();

                        connection.save((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: err
                                });
                            }
                            res.json({
                                result,
                                message: `Request rejected`
                            });
                        });
                    }
                })
            })
        }
    } )
}

exports.viewFriends = (req, res) => {
    const receiver_id = req.query.q;
    Connection.find({ $or: [ { sender_id: receiver_id  }, { receiver_id: receiver_id } ] , is_friend: true, deleted_at : null }).populate('sender_id', 'name email')
        .exec((err, connection)=> {
            return res.json(connection)
        })
}
