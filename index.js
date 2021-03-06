const  express = require("express");
const exphbs = require('express-handlebars'); //required for handlebar views
const path = require('path')
const app = express();
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const bodyparser = require("body-parser");
const http = require("http").Server(app);

var fs = require('fs'); // required for file serving


app.use(express.static('assets')); //for serving images and js

app.use(express.static(path.join(__dirname, '/views'))) //for serving handlebars admin views
//app.use(express.static(path.join(__dirname, '/public'))) //for serving handlebars admin views

//configuring handlebars
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: __dirname + '/views/paritials/'
}));

app.set('view engine', 'hbs');


const port = 8080;
//mongoose connection
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
const preferenceRoutes = require("./routes/prefernce");

//setting middlewares
app.use(bodyparser.json());
app.use(cookieparser());
app.use(cors());


app.use('/api/', authRoutes);
app.use('/api/', userRoutes);
app.use('/api/', connectionRoutes);
app.use('/', adminRoutes);
app.use('/api/', scheduleRoutes);
app.use('/api/', gameRoutes);
app.use('/api/', inviteRoutes);
app.use('/api/', chatRoutes);
app.use('/api/', preferenceRoutes);



//exporting for usage in sockets.js
exports.http =http

require("./controllers/socket")


app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json( {
            errors: [{msg:"Unauthorized Request"}],
        });
    }
});

http.listen(port, () => {
    console.log("Running on Port: " + port);
});
