const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user");
const user = require("./models/user");
require("./constants");
//setup express
const app = express();
app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log("Server started in port", PORT));

//set up mongoose
const MONGO_CON_STRING = "mongodb://localhost/vendor-application";
mongoose.connect(MONGO_CON_STRING, {useNewUrlParser : true, useUnifiedTopology: true, useCreateIndex: true}, (err)=>{
    if(err) throw err;
    console.log("Mongo db connection established");
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// set up routes

app.use("/users", userRoutes);