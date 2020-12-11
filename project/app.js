var express = require('express');
var path = require('path');
var json_server = require('json-server'); //em vez de mongodb pq é mais facil de usar :D
require('dotenv/config');
var request = require('request');
var bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

//parse file 
var parser = require('./saft/parser.js');
parser.parse();

//Connect and load json database
const server = json_server.router("saft.json");
const db = server.db.__wrapped__;

//Init app
const app = express();
app.use(bodyParser.json({limit: '100mb'}));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));


//View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Set static public folder
app.use(express.static(path.join(__dirname, "/public")));

//Set routes
var pages = require("./routes/pages.js");
app.use("/", pages);

var inventoryController = require('./routes/api/inventory.js');
var salesController = require('./routes/api/sales.js');
var authController = require('./routes/api/auth.js');
var uploadsController = require("./routes/api/uploads.js");

// Start server
app.listen(process.env.PORT, function () {
  console.log("Server started on port " + process.env.PORT);
});

// Set primavera tokens
const loginPrimavera = () => {
  const options = {
    method: "POST",
    url: "https://identity.primaverabss.com/connect/token",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope: "application",
      grant_type: "client_credentials",
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const jsonF = JSON.parse(response.body);
    global.primaveraRequests = request.defaults({
      headers: { Authorization: `Bearer ${jsonF.access_token}` },
    });
  });
};

loginPrimavera();


app.use('/api', inventoryController);
app.use('/api', salesController); 
app.use('/api', authController);
app.use("/api", uploadsController);


module.exports.db = db;

/* Para exportar direito:
No ficheiro que tem os dados que se quer exportar:: variavel deve ser const + fazer module.export.NOME_DA_VARIAVEL = NOME_DA_VARIAVEL
No ficheiro para onde se quer exportar:: var object = require(path para o ficheiro que tem a var originalmente) + object.NOME_DA_VARIAVEL
*/