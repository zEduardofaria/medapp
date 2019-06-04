const express = require('express'),
mustacheExpress = require('mustache-express'),
bodyParser = require('body-parser'),
{ Client } = require('pg');

const app = express();
const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}))

app.get('/add', (req,res) => {
    res.render('med-form');
})

app.post('/meds/add', (req,res) => {
    console.log('post body', req.body)
    const { name, count, brand } = req.body

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical',
        password: '123123123',
        port: 5432
    });

    client.connect()
        .then(() => {
            console.log('Connection Complete');
            const sql = 'INSERT INTO meds(name,count,brand) VALUES($1, $2, $3)'
            const params = [name, count, brand];

            return client.query(sql, params);
        })
        .then((result) => {
            console.log('results:', result.command);
            res.redirect('/meds');
        });
});

app.post('/meds/delete/:id', (req,res) => {
    console.log('post body', req.body)
    const { id } = req.params

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical',
        password: '123123123',
        port: 5432
    });

    client.connect()
        .then(() => {
           const sql = 'DELETE FROM meds WHERE mid= $1';
           const params = [id];

           return client.query(sql,params);
        })
        .then(() => {
            res.redirect('/meds');
        });
});

app.post('/meds/edit/:id', (req,res) => {
    const { name, count, brand } = req.body
    const { id } = req.params

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical',
        password: '123123123',
        port: 5432
    });

    client.connect()
        .then(() => {
           const sql = 'UPDATE meds SET name=$1, count=$2, brand=$3 WHERE mid=$4';
           const params = [name,count,brand,id];

           return client.query(sql,params);
        })
        .then(() => {
            res.redirect('/meds');
        });
});

app.get('/meds', (req,res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical',
        password: '123123123',
        port: 5432
    });

    client.connect()
        .then(() => {
            return client.query('SELECT * FROM meds');
        })
        .then((results) => {
            console.log('results: ', results);
            res.render('meds', results);
        }); 
});

app.get('/meds/edit/:id', (req,res) => {
    const { id } = req.params
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical',
        password: '123123123',
        port: 5432
    });

    client.connect()
        .then(() => {
            const sql = 'SELECT * FROM meds WHERE mid= $1';
            const params = [id];
            return client.query(sql,params);
            
        })
        .then((results) => {
            console.log(results)
            res.render('meds-edit', { med:results.rows[0] });
        });
    
});

app.get('/dashboard', (req,res) => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'medical',
        password: '123123123',
        port: 5432
    })
    
    client.connect()
    .then(() => {
        return client.query('SELECT SUM(count) FROM meds; SELECT COUNT(brand) FROM meds');
    }).then((results) => {
        res.render('dashboard', { n1: results[0].rows, n2: results[1].rows })
    });

});

app.listen(5001, () => {
    console.log('Listening on port 5001');
})