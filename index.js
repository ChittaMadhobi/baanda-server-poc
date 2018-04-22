const fileUpload = require('express-fileupload');
var express = require('express');
var app = express();
var port = process.env.PORT || 4000;
var cors = require('cors');

var mongoose = require('mongoose');
var Docs = require('./api/models/baandaContractModel'); //created model loading here
var bodyParser = require('body-parser');

// multer experiment
//console.log("Inside Express ...");
var multer = require('multer');
var upload = multer({ dest: 'uploads/'});

app.post('/profile'), upload.single('avatar'), function (req, res, next) {
    //console.log ("req.file = " + req.file);
    //console.log ("req.fields = " + req.fields);
}

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
var mongoDB = "mongodb://localhost/BaandaDB";

mongoose.connect( mongoDB, {
    useMongoClient: true
});

//Get the default connection
var db = mongoose.connection;

/*
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
//app.use(fileUpload());

app.use(cors());
//var routes = require('./api/routes/routes'); //importing route
var routes = require('./api/routes/routes'); //importing route
routes(app); //register the route
//app.use(routes);
/*
app.get('/', function(req, res) {
    res.send({name:'abcd'});
});
*/

//Listen for request
app.listen(process.env.port || port, function () {
    console.log('Server is up and listening to port:' + port);
});