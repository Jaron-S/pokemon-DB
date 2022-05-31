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

//           Index Page
// ---------------------------------
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/index', (req, res) => {
    res.render('index');
});

//              Pokemon Page
// ----------------------------------------
// Load page
app.get('/pokemon', (req, res) => {
    let loadPokemon = "SELECT * FROM Pokemon;"
    let loadTypes = "SELECT * FROM Types;"

    // load pokemon
    db.pool.query(loadPokemon, (error, rows, fields) => {
        let pokemon = rows;
        // load types (for dropdown menus)
        db.pool.query(loadTypes, (error, rows, fields) => {
            let types = rows;
            res.render('pokemon', {data: pokemon, types: types});
        })
    });
});

// Add Pokemon
app.post('/pokemon-add', (req, res) => {
    // Collect the data
    let data = req.body;
    let name = data['input-name'];
    let type1 = parseInt(data['input-type1']);
    let type2 = parseInt(data['input-type2']);
    let gen = parseInt(data['input-gen']);
    let preEvolution = parseInt(data['input-preEvolution']);
    let postEvolution = parseInt(data['input-postEvolution']);

    // convert NULL values
    if (isNaN(type2) || type2 === 0) {
        type2 = 'NULL'
    }
    if (isNaN(preEvolution)) {
        preEvolution = 'NULL'
    }
    if (isNaN(postEvolution)) {
        postEvolution = 'NULL'
    }

    // add the pokemon
    let query = `INSERT INTO Pokemon (pokemonName, typeID1, typeID2, genID, preEvolution, postEvolution)
                    VALUES ('${name}', ${type1}, ${type2}, ${gen}, ${preEvolution}, ${postEvolution});`
    db.pool.query(query, (error, rows, fields) => {
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

// Delete pokemon
app.delete('/pokemon-delete', (req, res) => {
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

// Update pokemon
app.post('/pokemon-update', (req, res) => {
    // Collect the data
    let data = req.body;
    let name = data['input-name'];
    let type1 = parseInt(data['input-type1']);
    let type2 = parseInt(data['input-type2']);
    let gen = parseInt(data['input-gen']);
    let preEvolution = parseInt(data['input-preEvolution']);
    let postEvolution = parseInt(data['input-postEvolution']);

    // convert NULL values
    if (isNaN(type2) || type2 === 0) {
        type2 = 'NULL'
    }
    if (isNaN(preEvolution)) {
        preEvolution = 'NULL'
    }
    if (isNaN(postEvolution)) {
        postEvolution = 'NULL'
    }

    // update the pokemon
    let query = `UPDATE Pokemon SET typeID1 = ${type1}, typeID2 = ${type2}, genID = ${gen}, preEvolution = ${preEvolution}, postEvolution = ${postEvolution}
                 WHERE Pokemon.pokemonName = '${name}';`

    db.pool.query(query, (error, rows, fields) => {
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


//              Attacks Page
// ---------------------------------------
// Load table
app.get('/attacks', (req, res) => {
    let loadAttacks = 'SELECT * FROM Attacks;'
    let loadTypes = "SELECT * FROM Types;"

    db.pool.query(loadAttacks, (error, rows, fields) => {
        let attacks = rows;
        db.pool.query(loadTypes, (error, rows, fields) => {
            let types = rows;
            res.render('attacks', {data: attacks, types: types});
        });
    })
    
});

// Add attack
app.post('/attacks-add', (req, res) => {
    // Collect the data
    let data = req.body;
    let name = data['input-name'];
    let type = parseInt(data['input-type']);
    let power = parseInt(data['input-power']);
    let accuracy = parseInt(data['input-accuracy']);
    let PP = parseInt(data['input-PP']);

    // convert NULL values
    if (isNaN(power) || power === 0) {
        power = 'NULL'
    }
    if (isNaN(accuracy) || accuracy === 0) {
        accuracy = 'NULL'
    }

    // add the type
    let query = `INSERT INTO Attacks (attackName, typeID, power, accuracy, PP)
                    VALUES ('${name}', ${type}, ${power}, ${accuracy}, ${PP});`
    db.pool.query(query, (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/attacks')
        }
    })
});

// Update attack
app.post('/attacks-update', (req, res) => {
    // Collect the data
    let data = req.body;
    let id = parseInt(data['attackID'])
    let name = data['input-name'];
    let type = parseInt(data['input-type']);
    let power = parseInt(data['input-power']);
    let accuracy = parseInt(data['input-accuracy']);
    let PP = parseInt(data['input-PP']);

    // convert NULL values
    if (isNaN(power) || power === 0) {
        power = 'NULL'
    }
    if (isNaN(accuracy) || accuracy === 0) {
        accuracy = 'NULL'
    }

    // update the attack
    let query = `UPDATE Attacks SET attackName, typeID, power, accuracy, PP
                 WHERE Types.attackID = '${id}';`

    db.pool.query(query, (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/attacks');
        }
    })
});

// Delete attack
app.post('/attacks-delete', (req, res) => {
    let data = req.body;
    let id = parseInt(data['attackID'])

    if (isNaN(id)) {
        id = 'NULL'
    }

    // delete the attack
    query = `DELETE FROM Attacks WHERE attackID = ?;`
    db.pool.query(query, [id], (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/attacks')
        }
    })
})


//               Types Page
// ---------------------------------------

// Load table
app.get('/types', (req, res) => {
    let loadTypes = 'SELECT * FROM Types;'

    db.pool.query(loadTypes, (error, rows, fields) => {
        let types = rows;
        res.render('types', {data: types});
    })
    
});

// Add type
app.post('/types-add', (req, res) => {
    // Collect the data
    let data = req.body;
    let name = data['input-name'];
    let invAgainst = parseInt(data['invAgainst']);

    // convert NULL values
    if (isNaN(invAgainst) || invAgainst === 0) {
        invAgainst = 'NULL'
    }

    // add the type
    let query = `INSERT INTO Types (typeName, invulnerableAgainst)
                    VALUES ('${name}', ${invAgainst});`
    db.pool.query(query, (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/types')
        }
    })
});

// Update type
app.post('/types-update', (req, res) => {
    // Collect the data
    let data = req.body;
    let typeID = data['input-name'];
    let invAgainst = parseInt(data['input-invAgainst']);

    // convert NULL values
    if (isNaN(invAgainst) || invAgainst === 0) {
        invAgainst = 'NULL'
    }

    // update the pokemon
    let query = `UPDATE Types SET invulnerableAgainst = ${invAgainst}
                 WHERE Types.typeID = '${typeID}';`

    db.pool.query(query, (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/types');
        }
    })
});

// Delete type
app.post('/types-delete', (req, res) => {
    let data = req.body;
    let id = parseInt(data['typeID']);

    if (isNaN(id)) {
        id = 'NULL';
    }

    // delete the type
    query = `DELETE FROM Types WHERE typeID = ?;`
    db.pool.query(query, [id], (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/types');
        }
    })
});


//              Generations Page
// ---------------------------------------------
app.get('/generations', (req, res) => {
    res.render('generations');
});


//              Pokemon Attacks Page
// ---------------------------------------------
app.get('/pokemon_attacks', (req, res) => {
    res.render('pokemon_attacks');
});


/*
    LISTENER
*/
app.listen(PORT, () => {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
    });