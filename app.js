// Express Setup
var express = require('express');
var app     = express();
const path  = require('path')
PORT        = 59432;

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));

// Handlebars Setup
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');
app.engine('.hbs', engine({extname: ".hbs"}));
app.set('view engine', '.hbs');

// Database Connection
var db = require('./database/db-connector')

// --------------------------------------------------------------
//                  Route Handlers
// --------------------------------------------------------------

// GET requests ------------------------------------

// Index Page
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/index', (req, res) => {
    res.render('index');
});

// Pokemon Page
app.get('/pokemon', (req, res) => {
    let loadPokemon = "SELECT * FROM Pokemon;"
    db.pool.query(loadPokemon, (error, rows, fields) => {
        res.render('pokemon', {data: rows})
    });
});

// Attacks Page
app.get('/attacks', (req, res) => {
    res.render('attacks');
});

// Types Page
app.get('/types', (req, res) => {
    res.render('types');
});

// Generations Page
app.get('/generations', (req, res) => {
    res.render('generations');
});

// Pokemon Attacks Page
app.get('/pokemon_attacks', (req, res) => {
    res.render('pokemon_attacks');
});

// POST requests -------------------------------------

// Add Pokemon
app.post('/pokemon-add', (req, res) => {
    // Collect the data
    let data = req.body;
    let name = data['input-name'];
    let type1 = parseInt(data['input-type2']);
    let type2 = parseInt(data['input-type2']);
    let gen = parseInt(data['input-gen']);
    let preEvolution = parseInt(data['input-preEvolution']);
    let postEvolution = parseInt(data['input-postEvolution']);

    // convert NULL values to strings
    if (isNaN(type2)) {
        type2 = 'NULL'
    }
    if (isNaN(preEvolution)) {
        preEvolution = 'NULL'
    }
    if (isNaN(postEvolution)) {
        postEvolution = 'NULL'
    }

    // add the pokemon
    query1 = `INSERT INTO Pokemon (pokemonName, typeID1, typeID2, genID, preEvolution, postEvolution)
                VALUES ('${name}', ${type1}, ${type2}, ${gen}, ${preEvolution}, ${postEvolution});`
    db.pool.query(query1, (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/pokemon')
        }
    })
});

// PUT requests ------------------------------------------


// DELETE requests ---------------------------------------
app.delete('/delete-pokemon', (req, res) => {
    let data = req.body;
    let id = parseInt(data.id)

    // delete the pokemon
    query = `DELETE FROM Pokemon WHERE pokemonID = ?;`
    db.pool.query(query, [id], (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.sendStatus(204);
        }
    })
})


/*
    LISTENER
*/
app.listen(PORT, () => {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
    });