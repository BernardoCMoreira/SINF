var express = require('express');
var path = require('path');
//var mongoose = require('mongoose');
var json_server = require('json-server');
require('dotenv/config');

//parse file 
var parser = require('./saft/parser.js');
parser.parse();

//Connect and load json database 
var server = json_server.router('saft.json');
const db = server.db.__wrapped__;

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

//Set api routes with json server
app.use('/api', server); //TODO: meter o exemplo q ta no fim e os outros q vao ser precisos numa pasta api por ex e exportar os modulos

// Start server
var port = 3000;
app.listen(port, function(){
    console.log("Server started on port " + port);
})


//para correr: node app.js 
module.exports = db;



/* Exemplo */
/* Para ir buscar o ano diretamente ao json server com base no saft:

app.get('/api/year', (req, res) => {
    res.json({ year: (db.AuditFile.Header[0].FiscalYear) });
});

*/

