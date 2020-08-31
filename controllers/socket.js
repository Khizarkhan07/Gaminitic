const Chat = require("./models/chat");
const Message = require("./models/message");
const User = require("./models/user");
const Group = require("./models/group");
const GroupMessage = require("./models/groupMessage");
const {http} = require("../index")

const socket = require("socket.io")(http);

socket.on("connection", socket => {
    console.log("user connected");

    /*fs.readFile(__dirname + '/assets/images/image.jpg', function(err, buf){
        // it's possible to embed binary data
        // within arbitrarily-complex objects
        socket.emit('image', { image: true, buffer: buf });
        console.log('image file is initialized');
    });*/

    socket.on("disconnect", function() {
        console.log("user disconnected");
    });

    socket.on('base64 file', function (msg) {
        console.log('received base64 file from ' + msg.fileName);
        if(msg.size > 1000000){
            console.log("cannot upload a file of more than 1 mb")
        }
        else {
            const user1_id = '5f2bdf1542983921e098a148';
            const user2_id = '5f2a789993af8927bc4a38f0';


            User.findById(user1_id, (err, user1)=> {
                if(err||!user1){
                    console.log("user1 not found")
                }
                else {
                    User.findById(user2_id, (err, user2)=> {
                        if(err||!user2){
                            console.log("user2 not found")
                        }
                        else {
                            Chat.findOne({ $or: [ { user1: user1, user2:user2 }, { user2: user1, user1: user2 } ] }, (err, chat)=> {
                                if(!chat){
                                    let chat = new Chat();
                                    chat.user1 = user1;
                                    chat.user2 = user2;
                                    chat.save((err, chat) => {
                                        if(err){
                                            console.log("error creating chat")
                                        }
                                        let message = new Message();
                                        message.chat_id = chat;
                                        message.user_id= user1;
                                        message.receiver_id= user2;
                                        message.attachment = msg.file;
                                        message.save((err, message)=> {
                                            if(err|| ! message){
                                                console.log("error creating message")
                                            }
                                            else {
                                                console.log("message delivered")
                                            }
                                        })
                                    })
                                }
                                else {
                                    let message = new Message();
                                    message.chat_id = chat;
                                    message.user_id= user1;
                                    message.receiver_id= user2;
                                    message.attachment = msg.file;
                                    message.save((err, message)=> {
                                        if(err|| ! message){
                                            console.log("error creating message")
                                        }
                                        else {
                                            socket.emit(msg.receiver_id,  //include sender

                                                {
                                                    username: socket.username,
                                                    file: msg.file,
                                                    fileName: msg.fileName
                                                }

                                            );
                                            console.log("message delivered")
                                        }
                                    })
                                }
                            })
                        }
                    }).select("name, email _id")
                }
            }).select("name, email _id")

        }


        // socket.broadcast.emit('base64 image', //exclude sender



    });


    socket.on("chat message", function(msg) {
        console.log("message: " + msg);

        //broadcast message to everyone in port:5000 except yourself.
        socket.broadcast.emit(msg.user2_id, { message: msg });

        //save chat to the database
        const user1_id = '5f2bdf1542983921e098a148';
        const user2_id = '5f2a789993af8927bc4a38f0';


        User.findById(user1_id, (err, user1)=> {
            if(err||!user1){
                console.log("user1 not found")
            }
            else {
                User.findById(user2_id, (err, user2)=> {
                    if(err||!user2){
                        console.log("user2 not found")
                    }
                    else {
                        Chat.findOne({ $or: [ { user1: user1, user2:user2 }, { user2: user1, user1: user2 } ] }, (err, chat)=> {
                            if(!chat){
                                let chat = new Chat();
                                chat.user1 = user1;
                                chat.user2 = user2;
                                chat.save((err, chat) => {
                                    if(err){
                                        console.log("error creating chat")
                                    }
                                    else {
                                        let message = new Message();
                                        message.chat_id = chat;
                                        message.user_id= user1;
                                        message.receiver_id= user2;
                                        message.message = msg
                                        message.save((err, message)=> {
                                            if(err|| ! message){
                                                console.log("error creating message")
                                            }
                                            else {
                                                console.log("message delivered")
                                            }
                                        })
                                    }

                                })
                            }
                            else {
                                let message = new Message();
                                message.chat_id = chat;
                                message.user_id= user1;
                                message.receiver_id= user2;
                                message.message = msg
                                message.save((err, message)=> {
                                    if(err|| ! message){
                                        console.log("error creating message")
                                    }
                                    else {
                                        console.log("message delivered")
                                    }
                                })
                            }
                        })
                    }
                }).select("name, email _id")
            }
        }).select("name, email _id")

    });

    socket.on("group creation", function (data) {
        const creator_id= "5f2a789993af8927bc4a38f0";
        const participant1_id= "5f2bdf1542983921e098a148";
        const participant2_id= "5f2d339c38916545b4cd0999";
        User.findById(creator_id , (err, creator)=> {
            if(err || !creator) {
                return res.json({error: "Creator not found"})
            }
            else {
                User.findById(participant1_id , (err, participant1)=> {
                    if(err || !creator) {
                        return res.json({error: "Participant1 not found"})
                    }
                    else {
                        User.findById(participant2_id , (err, participant2)=> {
                            if(err || !creator) {
                                return res.json({error: "Participant2 not found"})
                            }
                            else {
                                let group = new Group();
                                group.creator = creator;
                                group.participants.push(participant1, participant2);
                                group.name = "test group"
                                group.save((err, group)=> {
                                    if(err){
                                        console.log("group not created");
                                    }
                                    else {
                                        //socket.to('test group').emit('group creation' , {message: "you are added to a group"} );
                                        console.log("group created")
                                    }
                                })
                            }
                        }).select("name email _id")
                    }
                }).select("name email _id")

            }
        }).select("name email _id")
    })

    socket.on("group message" ,function (data) {
        const group_id = "5f35247b87f276241c7304bc";
        const sender_id= "5f2bdf1542983921e098a148";
        Group.findById(group_id, (err, group)=> {
            if(err||!group){
                console.log("group not found")
            }
            else {
                User.findById(sender_id, (err, user)=> {
                    if(err||!user){
                        console.log("user doesnot exist")
                    }
                    else {
                        let message = new GroupMessage();
                        message.group_id = group;
                        message.sender_id= user;
                        message.message = "test"
                        message.save((err, message)=> {
                            if(err){
                                console.log("error creating message")
                            }
                            else {
                                socket.to(group.name).emit('group message', {message: "message from group"});
                            }
                        })
                    }
                })
            }
        })
    })
});

module.exports = socket;