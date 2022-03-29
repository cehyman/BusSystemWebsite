var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./database');
var app = express();

app.set('views', path.join(__dirname, '/'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {
    extended: true
}));
app.post('/loginRequest', function(req, res) {
    var request = 'SELECT * FROM customer WHERE username = "' + req.body.username + '"';
    db.query(request, function(err, rows, fields) {
        if (err) {
            res.json({
                code: err
            });
        } else if (rows == null || rows.length == 0) {
            var addAccount = 'INSERT INTO customer (username, password) VALUES ("' + req.body.username + '", "' + req.body.password + '")';
            db.query(addAccount, function(err, result) {
                if (err) {
                    res.json({
                        code: err
                    });
                    return;
                }
            });
            res.json({
                code: 1
            });
        } else if (rows[0].password != req.body.password) {
            res.json({
                code: 2
            });
        } else {
            res.json({
                code: 0
            });
        }
    });
});

app.post('/viewBookings', function(req, res) {
    var request = 'SELECT * FROM bookings WHERE username = "' + req.body.username + '"';
    db.query(request, function(err, rows, fields) {
        if (err) {
            res.json({
                code: err,
                bookings: null
            });
        } else if (rows == null || rows.length == 0) {
            res.json({
                code: 1,
                bookings: null
            });
        } else {
            res.json({
                code: 0,
                bookings: rows
            });
        }
    });
});

app.get('/', function (req, res) {
    res.render('index', {});
  });
app.get('/index', function(req, res) {
    res.render('index', {});
});
app.get('/account', function (req, res) {
    res.render('account', {});
});
app.get('/book', function (req, res) {
    res.render('book', {});
});
app.get('/routes', function (req, res) {
    res.render('routes', {});
});
app.use(express.static(__dirname)); //__dir and not _dir
var port = 8080; // you can use any port
app.listen(port);
console.log('server on' + port);