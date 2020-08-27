const  express = require("express");
const exphbs = require('express-handlebars');
const path = require('path')
const app = express();
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
const bodyparser = require("body-parser");
const http = require("http").Server(app);

var fs = require('fs'); // required for file serving
app.use(express.static('assets'));

//app.use(express.static(__dirname + "/public"));

app.use(express.static(path.join(__dirname, '/views')))
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: __dirname + '/views/paritials/'
}));

app.set('view engine', 'hbs');

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
const chatRoutes = require("./routes/chat");

const Chat = require("./models/chat");
const Message = require("./models/message");
const User = require("./models/user");
const Group = require("./models/group");
const GroupMessage = require("./models/groupMessage");



app.use(bodyparser.json());
app.use(cookieparser());
app.use(cors());



app.use('/api/', authRoutes);
app.use('/api/', userRoutes);
app.use('/api/', connectionRoutes);
app.use('/api/', adminRoutes);
app.use('/api/', scheduleRoutes);
app.use('/api/', gameRoutes);
app.use('/api/', inviteRoutes);
app.use('/api/', chatRoutes);




exports.http =http

require("./controllers/socket")

http.listen(port, () => {
    console.log("Running on Port: " + port);
});
