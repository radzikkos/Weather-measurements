const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const session = require('express-session');
const app = express();
const port = 4107;


app.set('view engine', 'ejs')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(bodyParser.raw());
app.use(express.static("public"));
app.use(session({
    secret: 'some-secret',
    resave: true,
    saveUninitialized: true
}));

app.listen(port, function() {
    console.log('listening on ' + port);
})

app.get('/', function(req, res) {
    res.status(200).render('pages/index', { result: 0 })
})

app.get('/survey', function(req, res) {
    res.status(200).render('pages/survey')
})

app.get('/offline_results', function(req, res) {
    if (req.session.admin) {
        res.status(200).render('pages/index', { result: "Musisz być wylogowany" })
    } else {
        res.status(200).render('pages/offline_results')
    }
})

app.get('/login', function(req, res) {
    res.status(200).render('pages/login', { result: 0 })
})

app.post('/login', function(req, res) {
    console.log(req.body);
    if (!req.body.username || !req.body.pass) {
        res.status(401).render('pages/login', { result: "Podaj login i hasło" });
    } else if (req.body.username === 'log' && req.body.pass === '1111') {
        req.session.user = "log";
        req.session.admin = true;
        /**Dorobic połączenie z bazą */
        //req.session.destroy();
        res.status(200).render('pages/login', { result: "Udało się zalogować" });
    } else { res.status(400).render('pages/login', { result: "Nie udało się zalogować" }) }
})

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.status(200).render('pages/index', { result: "Wylogowano" })
})