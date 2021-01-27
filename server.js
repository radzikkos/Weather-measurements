const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 4000;

const url = `mongodb+srv://user:12345@cluster0.ovkgy.mongodb.net/base?retryWrites=true&w=majority`;

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

var base;

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, connectionParams, function(err, db) {
    if (err) throw err;
    base = db.db("base");
    console.log("Connected to base...")
});

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

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.status(200).render('pages/index', { result: "Wylogowano" })
})

app.get('/surveys_from_server', function(req, res) {
    if (req.session.admin) {
        var mysort = { _id: 1 };
        try {
            base.collection('measures').find().sort(mysort).collation({ locale: "en_US", numericOrdering: true }).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).render('pages/index', { result: "Błąd przy wypisaniu z serwera" });
                }
                console.log(result);
                res.status(200).render('pages/online_results', { result: result })
            });
        } catch (err) {
            res.status(400).render('pages/index', { result: "Łączenie z bazą - spróbuj ponownie" });
        }
    } else {
        res.status(400).render('pages/index', { result: "Zaloguj sie" });
    }
})

app.get('/chart', function(req, res) {
    if (req.session.admin) {
        var mysort = { _id: 1 };
        /**Łapanie wyjątki, jeśli spróbujemy wyciągnać coś z bazy przed połączeniem się z nią */
        try {
            base.collection('measures').find().sort(mysort).collation({ locale: "en_US", numericOrdering: true }).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).render('pages/index', { result: "Błąd przy wypisaniu z serwera" });
                }
                console.log(result);
                res.status(200).render('pages/chart', { result: result })
            });
        } catch (error) {
            res.status(400).render('pages/index', { result: "Łączenie z bazą - spróbuj ponownie" });
        }
    } else {
        res.status(400).render('pages/index', { result: "Zaloguj sie" });
    }
})

app.post('/login', function(req, res) {
    console.log(req.body);
    if (!req.body.username || !req.body.pass) {
        res.status(401).render('pages/login', { result: "Podaj login i hasło" });
    } else if (req.body.username === 'log' && req.body.pass === '1111') {
        req.session.user = "log";
        req.session.admin = true;
        res.status(200).render('pages/index', { result: "Udało się zalogować" })
    } else { res.status(400).render('pages/login', { result: "Nie udało się zalogować" }) }
})



app.post('/survey', function(req, res) {
    if (req.session.admin) {
        // logged
        if ((req.body['day'] > 365) || (req.body['day'] < 1) || (req.body['temp'] < -50) || (req.body['temp'] > 50) || (req.body['humidity'] < 0) || (req.body['humidity'] > 100)) {
            return res.status(400).render('pages/login', { result: "Złe wartości" });
        }
        base.collection('measures').insertOne({ _id: req.body['day'], temp: req.body['temp'], humidity: req.body['humidity'] }, function(err, result) {
            if (err) {
                console.log("REKORD JEST JUŻ W BAZIE");
                return res.status(400).render('pages/login', { result: "Rekord jest już w bazie" });
            }
            console.log('Rekord dodany do bazy');
            res.status(200).send("Rekord dodany");
        })
    } else {
        // not logged
        res.status(401).send("Użytkownik niezalogowany");
    }
})

app.get('/documentation', function(req, res) {
    return res.status(200).render('pages/documentation');
})
app.get('/favicon.ico', function(req, res) {
    res.sendFile(__dirname + '/favicon.ico');
})