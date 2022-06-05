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
    let loadPokemon = `SELECT p.pokemonID, p.pokemonName, p.typeID1, p.typeID2, t1.typeName typeName1, t2.typeName typeName2, p.genID, p.preEvolution, p.postEvolution, pre.pokemonName preEvoName, post.pokemonName postEvoName
                        FROM Pokemon p
                        LEFT JOIN Types t1 ON t1.typeID = p.typeID1
                        LEFT JOIN Types t2 ON t2.typeID = p.typeID2
                        LEFT JOIN Pokemon pre ON pre.pokemonID = p.preEvolution
                        LEFT JOIN Pokemon post ON post.pokemonID = p.postEvolution;`
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
    let preEvolutionName = data['input-preEvolution'];
    let postEvolutionName = data['input-postEvolution'];
    

    // convert NULL values
    if (isNaN(type2) || type2 === 0) {
        type2 = 'NULL'
    }

    // add the pokemon
    let preEvoQuery = `SELECT pokemonID FROM Pokemon WHERE pokemonName = '${preEvolutionName}';`
    let postEvoQuery = `SELECT pokemonID FROM Pokemon WHERE pokemonName = '${postEvolutionName}';`
    // find the preEvolution name
    db.pool.query(preEvoQuery, (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            
            let preEvolutionID = 'NULL';
            if (rows[0]) {
                preEvolutionID =  rows[0].pokemonID;
            }
            // find the postEvolution name
            db.pool.query(postEvoQuery, (error, rows, fields) => {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                }
                else {
                    let postEvolutionID = 'NULL';
                    if (rows[0]) {
                        postEvolutionID =  rows[0].pokemonID;
                    }
                    // add the pokemon
                    let insertQuery = `INSERT INTO Pokemon (pokemonName, typeID1, typeID2, genID, preEvolution, postEvolution)
                                        VALUES ('${name}', ${type1}, ${type2}, ${gen}, ${preEvolutionID}, ${postEvolutionID});`
                    db.pool.query(insertQuery, (error, rows, fields) => {
                        if (error) {
                            console.log(error);
                            res.sendStatus(400);
                        }
                        else {
                            res.redirect('/pokemon');
                        }
                    })
                }
            })
        }
    })
});

// Delete pokemon
app.post('/pokemon-delete', (req, res) => {
    let data = req.body;
    let id = parseInt(data['pokemonID']);

    // delete the pokemon
    query = `DELETE FROM Pokemon WHERE pokemonID = ?;`
    db.pool.query(query, [id], (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/pokemon')
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
    let preEvolutionName = data['input-preEvolution'];
    let postEvolutionName = data['input-postEvolution'];

    // convert NULL values
    if (isNaN(type2) || type2 === 0) {
        type2 = 'NULL'
    }

    let preEvoQuery = `SELECT pokemonID FROM Pokemon WHERE pokemonName = '${preEvolutionName}';`
    let postEvoQuery = `SELECT pokemonID FROM Pokemon WHERE pokemonName = '${postEvolutionName}';`
    // find the preEvolution name
    db.pool.query(preEvoQuery, (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            
            let preEvolutionID = 'NULL';
            if (rows[0]) {
                preEvolutionID =  rows[0].pokemonID;
            }
            // find the postEvolution name
            db.pool.query(postEvoQuery, (error, rows, fields) => {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                }
                else {
                    let postEvolutionID = 'NULL';
                    if (rows[0]) {
                        postEvolutionID =  rows[0].pokemonID;
                    }
                    // update the pokemon
                    let query = `UPDATE Pokemon SET typeID1 = ${type1}, typeID2 = ${type2}, genID = ${gen}, preEvolution = ${preEvolutionID}, postEvolution = ${postEvolutionID}
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
                }
            })
        }
    })
});


//              Attacks Page
// ---------------------------------------

// Load table
app.get('/attacks', (req, res) => {
    let loadAttacks = `SELECT a.attackID, a.attackName, a.typeID, t.typeName, a.power, a.accuracy, a.PP
                        FROM Attacks a
                        INNER JOIN Types t ON t.typeID = a.typeID;`
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
    let typeID = parseInt(data['input-type']);
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

    // add the attack
    let query = `INSERT INTO Attacks (attackName, typeID, power, accuracy, PP)
                    VALUES ('${name}', ${typeID}, ${power}, ${accuracy}, ${PP});`
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
    let id = parseInt(data['input-attackID'])
    let name = data['input-name'];
    let typeID = parseInt(data['input-type']);
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
    let query = `UPDATE Attacks SET attackName='${name}', typeID=${typeID}, power=${power}, accuracy=${accuracy}, PP=${PP}
                 WHERE attackID = ${id};`

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
    let loadTypes = `SELECT t1.typeID, t1.typeName, t1.invulnerableAgainst, t2.typeName invAgainstName
                        FROM Types t1 
                        LEFT JOIN Types t2 ON t2.typeID = t1.invulnerableAgainst;`

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
    let typeID = parseInt(data['input-typeID']);
    let typeName = data['input-name'];
    let invAgainst = parseInt(data['input-invAgainst']);

    // convert NULL values
    if (isNaN(invAgainst) || invAgainst === 0) {
        invAgainst = 'NULL';
    }

    // update the pokemon
    let query = `UPDATE Types SET typeName = '${typeName}', invulnerableAgainst = ${invAgainst}
                 WHERE Types.typeID = ${typeID};`

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
// Load table
app.get('/pokemon_attacks', (req, res) => {
    let loadPokemonAttacks = `SELECT pa.pokemon_attackID,  p.pokemonName, a.attackName
                                FROM Pokemon_Attacks pa
                                LEFT JOIN Pokemon p ON p.pokemonID = pa.pokemonID
                                LEFT JOIN Attacks a ON a.attackID = pa.attackID;`

    let loadPokemon = `SELECT pokemonID, pokemonName FROM Pokemon;`;
    let loadAttacks = `SELECT attackID, attackName FROM Attacks`;

    db.pool.query(loadPokemonAttacks, (error, rows, fields) => {
        let pokemonAttacks = rows;
        db.pool.query(loadPokemon, (error, rows, fields) => {
            let pokemon = rows;
            db.pool.query(loadAttacks, (error, rows, fields) => {
                let attacks = rows;
                res.render('pokemon_attacks', {data: pokemonAttacks, pokemon: pokemon, attacks: attacks});
            })
        })
    })
});

// Add pokemon_attack
app.post('/pokemon_attacks-add', (req, res) => {
    // Collect the data
    let data = req.body;
    let pokemon = data['input-pokemon'];
    let attack = data['input-attack'];

    // convert NULL values
    if (isNaN(pokemon) || pokemon === 0) {
        pokemon = 'NULL'
    }

    // add the pokemon attack
    let query = `INSERT INTO Pokemon_Attacks (pokemonID, attackID)
                    VALUES (${pokemon}, ${attack});`
    db.pool.query(query, (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/pokemon_attacks')
        }
    })
});

// Delete type
app.post('/pokemon_attacks-delete', (req, res) => {
    let data = req.body;
    let id = parseInt(data['paID']);

    if (isNaN(id) || id === 0) {
        id = 'NULL';
    }

    // delete the type
    query = `DELETE FROM Pokemon_Attacks WHERE pokemon_attackID = ?;`
    db.pool.query(query, [id], (error, rows, fields) => {
        // check for errors
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/pokemon_attacks');
        }
    })
});


/*
    LISTENER
*/
app.listen(PORT, () => {
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
    });