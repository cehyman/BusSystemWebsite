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

// handle post request from index.ejs
app.post('/loginRequest', function(req, res) {
    console.log("login request");
    var request = 'SELECT * FROM customer WHERE username = "' + req.body.username + '"';
    db.query(request, function(err, rows, fields) {
        if (err) {
            res.json({
                code: err
            });
        } else if (rows == null || rows.length == 0) {
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

// handle post request from createAccount.ejs
app.post('/createAccountRequest', function (req, res) {
    var request = 'SELECT * FROM customer WHERE username = "' + req.body.username + '"';
    db.query(request, function (err, rows, fields) {
        if (err) {
            res.json({
                code: err
            });
        } else if (rows == null || rows.length == 0) {
            var addAccount = 'INSERT INTO customer (username, password) VALUES ("' + req.body.username + '", "' + req.body.password + '")';
            db.query(addAccount, function (err, result) {
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
        } else {
            res.json({
                code: 0
            });
        }
    });
});

// handle post request from passChange.ejs
app.post('/changePassword', function(req, res) {
    // console.log("change password");
    // create update request to change password to req.body.newPassword
    var request = 'SELECT username, password FROM customer WHERE username = "' + req.body.username + '"';
    // console.log(req.body.username);
    db.query(request, function(err, rows, fields) {
        // console.log("first query");
        if (err) {
            res.json({
                code: err
            });
            // wont work because rows will always be null since UPDATE returns nothing even upon success
        } else if (rows.length > 0 && req.body.oldPassword == rows[0].password) {
            // console.log(rows[0].password);
            var request2 = 'UPDATE customer SET password = "' + req.body.newPassword + '"WHERE  username = "' + req.body.username + '"';
            db.query(request2, function(err, result) {
                // console.log("second query");
                if (err) {
                    res.json({
                        code: err
                    });
                }
            });
            res.json({
                code: 0
            });
        } else if (rows.length == 0) {
            res.json({
                code: 2
            });
        } else {
            res.json({
                code: 1
            });
        }
    });
});

// handle post request from account.ejs
app.post('/viewBookings', function(req, res) {
    var request = 'SELECT * FROM bookings JOIN route ON bookings.route_id = route.route_id WHERE username = "' + req.body.username + '"';
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

app.post('/generateBookings', function(req, res) {
    // bookings table looks like (booking_id, route_id, username, paid_price)
    for (var i = 0; i < req.body.bookings.length; i++) {
        var request = 'INSERT INTO bookings (route_id, username, paid_price) VALUES ("' + req.body.bookings[i].route_id + '", "' + req.body.username + '", "' + req.body.bookings[i].price + '")';
        db.query(request, function(err, result) {
            if (err) {
                res.json({
                    code: err
                });
                return;
            } else if (i == req.body.bookings.length - 1) {
                res.json({
                    code: 0
                });
            }
        });
    }
});

app.post('/viewSchedule', function(req, res) { 
    var request = 'SELECT depart_time, arrive_time FROM route WHERE route_id = "' + req.body.route_id + '"';
    db.query(request, function(err, rows, fields) {
        if (err) {
            res.json({
                code: err,
                schedule: null
            });
        } else if (rows == null || rows.length == 0) {
            res.json({
                code: 1,
                schedule: null
            });
        } else {
            res.json({
                code: 0,
                schedule: rows
            });
        }
    });
});

app.get('/viewRoutes', function(req, res) {
    var request = 'SELECT route_id FROM route';
    db.query(request, function(err, rows, fields) {
        if (err) {
            res.json({
                code: err,
                routes: null
            });
        } else if (rows == null || rows.length == 0) {
            res.json({
                code: 1,
                routes: null
            });
        } else {
            res.json({
                code: 0,
                routes: rows
            });
        }
    });
});

// handle the bookRide post request
app.post('/bookRide', function(req, res) {
    var fullRoute = new Array();
    queryRecursion(req.body.dest, req.body.time, req.body.depart, res, fullRoute);
});

/*  there's something called callbacks that prevent race conditions in node.js, I refuse to learn them
    So I solved race conditions with recursion instead. Sorry. */

function queryRecursion(dest, time, depart, res, fullRoute) {
    var request = 'SELECT * FROM route WHERE arrive_stop = "' + dest + '" AND arrive_time < "' + time + '" ORDER BY arrive_time DESC LIMIT 1';
    db.query(request, function(err, rows, fields) {
        if (err) {
            res.json({
                code: err,
                full: null
            });
        } else if (rows == null || rows.length == 0) {
            res.json({
                code: 1,
                full: null
            });
        } else if (rows[0].depart_stop == depart) {
            fullRoute.unshift(rows[0]);
            res.json({
                code: 0,
                full: fullRoute
            });
        } else {
            fullRoute.unshift(rows[0]);
            queryRecursion(rows[0].depart_stop, rows[0].depart_time, depart, res, fullRoute);
        }
    });
}


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
app.get('/createAccount', function (req, res) {
    res.render('createAccount', {});
});
app.get('/passChange', function (req, res) {
    res.render('passChange', {});
});
app.use(express.static(__dirname)); //__dir and not _dir
var port = 8080; // you can use any port
app.listen(port);
console.log('server on ' + port);
