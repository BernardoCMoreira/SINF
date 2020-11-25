var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
require('dotenv/config');

//parse file 
var parser = require('./saft/parser.js');
parser.parse();

//Connect and load database 
mongoose.connect(
    process.env.DB_CONNECTION, //DB_CONNECTION=mongodb+srv://sinfan:<sinfan2020>@cluster0.j8viv.mongodb.net/<sinfan>?retryWrites=true&w=majority
    { useNewUrlParser: true },
    () => console.log("Connected to MongoDB !")
);

//Init app
var app = express();

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set static public folder
app.use(express.static(path.join(__dirname, '/public')));

//Set routes 
var pages = require('./routes/routes.js');
app.use('/', pages);

// Start server
var port = 3000;
app.listen(port, function(){
    console.log("Server started on port " + port);
})


//para correr: node app.js 