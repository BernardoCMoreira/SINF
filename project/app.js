var express = require('express');
var path = require('path');
var json_server = require('json-server'); //em vez de mongodb pq é mais facil de usar :D
require('dotenv/config');
const request = require('request');

//parse file 
var parser = require('./saft/parser.js');
parser.parse();

//Connect and load json database 
const server = json_server.router('saft.json');
const db = server.db.__wrapped__;

//Init app
const app = express();

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set static public folder
app.use(express.static(path.join(__dirname, '/public')));

//Set routes 
var pages = require('./routes/pages.js');
app.use('/', pages);

var inventoryController = require('./routes/api/inventory.js');
var financialController = require('./routes/api/financial.js');
var salesController = require('./routes/api/sales.js');

const { default: Axios } = require('axios');

// Start server
app.listen(process.env.PORT, function() {
    console.log("Server started on port " + process.env.PORT);
});

// Set primavera tokens
const loginPrimavera = () => {
    const options = {
        method: 'POST',
        url: 'https://identity.primaverabss.com/connect/token',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        formData: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: 'application',
            grant_type: 'client_credentials',
        },
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);

        const jsonF = JSON.parse(response.body);

        global.primaveraRequests = request.defaults({
            headers: { Authorization: `Bearer ${jsonF.access_token}` },
        });
    });
};


app.use('/api', inventoryController);
app.use('/api', financialController);
app.use('/api', salesController);

loginPrimavera();

module.exports.db = db;

/* Para exportar direito:
No ficheiro que tem os dados que se quer exportar:: variavel deve ser const + fazer module.export.NOME_DA_VARIAVEL = NOME_DA_VARIAVEL
No ficheiro para onde se quer exportar:: var object = require(path para o ficheiro que tem a var originalmente) + object.NOME_DA_VARIAVEL
*/