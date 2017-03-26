
//require some modules
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var mysql = require("mysql");

//server listen on port 80
server.listen(80, function() {
	console.log("System Executing");
});

//!important! configure this from db connection
var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'learning'
});

//debug connect db error
db.connect(function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("database is ok. connected");
	}
});

// express use static folder as public
app.use(express.static('static'));

app.get("*", function(req, res) {
	console.log("user opened home page");
	res.sendFile( __dirname + "/index.html");

});

// track all socket connection
var connections = [];


// lesson list
var lesson = ["limit","derivative","graph","integral","complex","differential","areaandvolume","conics","geometry","probability","permutations"];

// socket connection
io.sockets.on("connection", function(socket) {
	connections.push(io);

	//view in console how many user connected 
	console.log('connected %s', connections.length);


	socket.on("disconnect", function(socket) {
		connections.splice(connections.indexOf(socket), 1);
		console.log('connected %s', connections.length);
		// remove user and view in console log
	})

	// listen to front end and return data for video viewing
	socket.on("getData", function(data, callback) {
		var navdata = [];
		var navdata1 = [];
		var int = parseInt(data.num);
		var type = data.type;
		var lesson = data.lesson;
		if(data.lesson.indexOf(lesson) != -1) {
			db.query("SELECT * FROM `videos` WHERE `type` = 'lesson' AND  `lesson` = '"+lesson+"'", function(err, rows) {
				for(i=0;i<rows.length;i++) {
					navdata.push(rows[i].title);
				}
			});

			// query without escape string// may dangerous
			db.query("SELECT * FROM `videos` WHERE `type` = 'exercise' AND  `lesson` = '"+lesson+"'", function(err, rows) {
				for(i=0;i<rows.length;i++) {
					navdata1.push(rows[i].title);
				}
			});

			db.query("SELECT * FROM `videos` WHERE `id` = '"+int+"' AND `type` = '"+type+"' AND  `lesson` = '"+lesson+"'", function(err, rows) {
				if(rows.length !== 0) {
					var api = {
						status: "OK", 
						title: rows[0].title, 
						lesson: data.lesson, 
						yt_id: rows[0].yt_id, 
						navdata: navdata, 
						navdata1: navdata1
					};
					callback(JSON.stringify(api));
				} else {

					//if data not found return status: no
					callback(JSON.stringify({status: "NO"}));
				}
			});
		} else {
			callback(JSON.stringify({status: "NO"}));
		}
	});
});








