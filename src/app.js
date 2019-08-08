var express = require('express');
var app = express();
var path = require('path')
const fs = require('fs');

var cors = require('cors');
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'static')));


app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/html/Untitled-1.html'))
});

app.get('/style.css', function (req, res) {
	res.sendFile(path.join(__dirname + '/html/style.css'))
});


// -------------------------- status-app --------------------------------
var data = null;

const sqlite3 = require('sqlite3')

let db = new sqlite3.Database("./mydb.sqlite3", (err) => {
	if (err) {
		console.log('Error when connnecting to the database', err)
	} else {
		console.log('Database connected!')
	}
})


app.get('/app/status-app', function (req, res) {
	res.sendFile(path.join(__dirname + '/html/index.html'))
});

app.get('/app/status-app/api/init', function (req, res) {
	if (data == null) {
		db.all("SELECT * FROM main", (err, rows) => {
			if (err) {
				console.log("Error quering data", err)
			} else {
				// console.log(rows)
				data = rows
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(data));
			}
		})
	} else {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(data));
	}
})

app.get('/app/status-app/api/update', (req, res) => {
	queryName = req.query.name;
	queryStatus = req.query.status;
	if (queryName == "Vincent") {
		data[0].status = Number(queryStatus)
	} else {
		data[1].status = Number(queryStatus)
	}
	db.run("UPDATE main SET status = $status WHERE name = $name", {
		$name: queryName,
		$status: queryStatus
	});
	res.send("OK")
})

app.get('/app/status-app/api/diag/ping', (req, res) => {
	res.send("pong")
})

// -------------------------- status-app --------------------------------


app.listen(5000);
// app.listen(5000, '172.26.9.56');

