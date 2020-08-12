const  express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
const bodyparser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io");

const port = 8080;

mongoose.connect('mongodb+srv://gaminatic:gaminatic@gaminatic.mus8o.mongodb.net/gaminatic?retryWrites=true&w=majority' , { useNewUrlParser: true, useUnifiedTopology: true } );

//Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const connectionRoutes = require("./routes/connection");
const scheduleRoutes = require("./routes/schedule");
const gameRoutes = require("./routes/game");
const adminRoutes = require("./routes/admin");
const inviteRoutes = require("./routes/invite");

const Chat = require("./models/chat");
const Message = require("./models/message");
const User = require("./models/user");



app.use(bodyparser.json());
app.use(cookieparser());
app.use(cors());

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', connectionRoutes);
app.use('/', adminRoutes);
app.use('/', scheduleRoutes);
app.use('/', gameRoutes);
app.use('/', inviteRoutes);



app.use(express.static('assets'));
app.use(express.static(__dirname + "/public"));

socket = io(http);


socket.on("connection", socket => {
    console.log("user connected");

    socket.on("disconnect", function() {
        console.log("user disconnected");
    });

    //Someone is typing
    socket.on("typing", data => {
        socket.broadcast.emit("notifyTyping", {
            user: data.user,
            message: data.message
        });
    });

    //when soemone stops typing
    socket.on("stopTyping", () => {
        socket.broadcast.emit("notifyStopTyping");
    });

    socket.on("chat message", function(msg) {
        console.log("message: " + msg);

        //broadcast message to everyone in port:5000 except yourself.
        socket.broadcast.emit("received", { message: msg });

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
                                        console.log("chat creating")
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
});



http.listen(port, () => {
    console.log("Running on Port: " + port);
});
