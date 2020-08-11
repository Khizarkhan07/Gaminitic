const  express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieparser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
const bodyparser = require("body-parser");


mongoose.connect('mongodb+srv://gaminatic:gaminatic@gaminatic.mus8o.mongodb.net/gaminatic?retryWrites=true&w=majority' , { useNewUrlParser: true, useUnifiedTopology: true } );

//Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const connectionRoutes = require("./routes/connection");
const scheduleRoutes = require("./routes/schedule");
const gameRoutes = require("./routes/game");
const adminRoutes = require("./routes/admin");
const inviteRoutes = require("./routes/invite");


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


app.listen( process.env.PORT||8080);