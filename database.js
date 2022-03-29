var mysql = require('mysql2');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'route'
});
con.connect(function(err) {
    if (err) throw err;
    console.log('Database connected!');
});
module.exports = con;