// Express
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
const path = require('path')
PORT        = 59432;                 // Set a port number at the top so it's easy to change in the future


// Database
//var db = require('./db-connector')

// Route Handler
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));

/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});