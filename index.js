// Assignments Web Application Main Entry Point

console.log("Initializing Server...");

var express = require('express');
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passwordHash = require('password-hash');
var timeout = require('connect-timeout');
var qs = require('qs');
var urllib = require('url');
var moment = require('moment');

var DEVELOPMENT_MODE = "development";
var PRODUCTION_MODE = "production";

// Configuration Object
var config = {
	mode: DEVELOPMENT_MODE,
	mongo_db_url: "mongodb://10.244.102.234:27017/assignments",
	redis_store: {
		host: "10.244.74.49",
		port: "6379"
	}, session_secret: "keyboard cat",  /*TODO: Put an actual Secret Key In Here*/
	url: {
		base: "/api",
		version: "v1"
	},
	services: ['login', 'account', 'assigns'],
	server: {
		port: 3000,
		health_check_url: "/ping"
	},
	log_file: "",
	timeout: "5s"
};

// Utility Function to Check if a Value is contained in an Array
Array.prototype.contains = function(k) {
  for(var i=0; i < this.length; i++){
    if(this[i] === k){
      return true;
    }
  }
  return false;
}

// Checks for a Halt on Timeout
function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

// Url Building Function
function url(service, route) {
	var full_route = config.url.base + "/" + service + "/" + config.url.version + "/" + route;
	console.log("  '%s' Route Created", full_route);
	return full_route;
}

// Create the Express Application Object
var app = express();
console.log("  Express Initialized");

// Connect to the MongoDB Store
var db = mongojs.connect(config.mongo_db_url, ["users", "assignments"]);
console.log("  MongoDB Connection Opened");

// Create the Username Index
db.users.createIndex({username: 1}, {unique: true});
console.log("    users.username Index Created");

// Global JSON Body Parser Middleware
var jsonParser = bodyParser.json();

// Global Authorization Middleware Handler
var authorize = function (req, res, next){
	if (req.session.authorized) {
		next();
	} else {
		res.status(403).end();
	}
}

// Application Level Development Style Logger to STDOUT
var loggingHandler = morgan('dev');

// Application Level Session Tracking Middleware Handler
var sessionHandler = session({
	store: new RedisStore(config.redis_store), 
	secret: config.session_secret,
	resave: false,
	saveUninitialized: true
});
console.log("  Redis Store Connection Opened");

app.use(timeout(config.timeout),loggingHandler, haltOnTimedout, sessionHandler, haltOnTimedout);

// Login Service
if (config.services.contains('login')) {

	console.log("Login Service Loaded");

	//Login Route: POST /api/login/v1/login
	app.post(url("login","login"), jsonParser, function (req, res){
		req.session.authorized = false;
		req.session.user_id = "";
		if (req.body.username !== undefined && req.body.password !== undefined) {
			db.users.find({username: req.body.username}, function (error, users){
				if (error) {
					// Internal Server Error
					console.log(error);
					res.status(500).end();
				} else if (!users || users.length == 0) {
					res.status(404).end();
				} else {
					var user = users[0];
					if (user.active && passwordHash.verify(req.body.password, user.password)) {
						req.session.authorized = true;
						req.session.user_id = user._id;
						res.status(200).end();
					} else {
						res.status(404).end();
					}
				}
			});
		} else {
			res.status(400).end();
		}
	});

	//Logout Route: POST /api/login/v1/logout
	app.post(url("login","logout"), authorize, function (req, res){
		req.session.authorized = false;
		res.status(200).end();
	});
}

// Account Service
if (config.services.contains('account')) {

	console.log("Account Service Loaded");

	//Fetch User Route: GET /api/account/v1/user
	app.get(url("account","user"), authorize, function (req, res){
		db.users.find({_id: mongojs.ObjectId(req.session.user_id)}, function (error, users){
			if (error) {
				// Internal Server Error
				console.log(error);
				res.status(500).end();
			} else if (!users || users.length == 0) {
				res.status(404).end();
			} else {
				var user = users[0];
				res.status(200).json({username: user.username, email: user.email, display_name: user.display_name});
			}
		});
	});

	//Update User Route: PUT /api/account/v1/user
	app.put(url("account","user"), authorize, jsonParser, function (req, res){
		if (req.body.current_password !== undefined &&
			(req.body.password === undefined || req.body.password !== "") &&
			(req.body.email === undefined || req.body.email !== "") &&
			(req.body.display_name === undefined || req.body.display_name !== "")) {
			
			db.users.find({_id: mongojs.ObjectId(req.session.user_id)}, function (error, users){
				if (error) {
					// Internal Server Error
					console.log(error);
					res.status(500).end();
				} else if (!users || users.length == 0) {
					res.status(404).end();
				} else {
					var user = users[0];
					if (passwordHash.verify(req.body.current_password, user.password)) {
						var updated_user = {};
						if (req.body.password !== undefined) {
							updated_user['password'] = passwordHash.generate(req.body.password);
						}
						if (req.body.email !== undefined) {
							updated_user['email'] = req.body.email;
						}
						if (req.body.display_name !== undefined) {
							updated_user['display_name'] = req.body.display_name;
						}
						db.users.update({_id: mongojs.ObjectId(req.session.user_id)}, {$set: updated_user}, function (error, updated){
							if (error || !updated) {
								// Internal Server Error
								console.log(error);
								res.send(500).end();
							} else {
								res.send(200).end();
							}
						});
					} else {
						res.status(404).end();
					}
				}
			});
		} else {
			res.status(400).end();
		}
		
	});

	//Sign Up Route: POST /api/account/v1/user
	app.post(url("account","user"), jsonParser, function (req, res){
		if (req.body.username !== undefined && 
			req.body.password !== undefined && 
			req.body.email !== undefined && 
			req.body.display_name !== undefined &&
			req.body.username !== "" &&
			req.body.password !== "" &&
			req.body.email !== "" &&
			req.body.display_name !== "") {
			
			// Check for no existing users with this username
			db.users.find({username: req.body.username}, function (error, users){
				if (error) {
					// Internal Server Error
					console.log(error);
					res.status(500).end();
				} else if (!users || users.length == 0) {
					db.users.save({
							username: req.body.username, 
							password: passwordHash.generate(req.body.password), 
							email: req.body.email, 
							display_name: req.body.display_name, 
							active: true}, 
						function (error, saved){
							if (error || !saved) {
								res.status(500).end();
							} else {
								res.status(201).end();
							}
					});
				} else {
					// User allready exists with this name
					res.status(404).end();
				}
			});
		} else {
			res.status(400).end();
		}
	});
}

// Assignments Service
if (config.services.contains('assigns')) {

	console.log("Assigns Service Loaded");

	//List Assignments Route: GET /api/assigns/v1/assigns
	app.get(url("assigns","assigns"), authorize, function (req, res){
		var query = qs.parse(urllib.parse(req.url).query);
		var find = {user_id: req.session.user_id};
		if (query.completed !== undefined && (query.completed === 'yes' || query.completed === 'no')) {
			find['completed'] = (query.completed === 'yes');
		}
		//TDOD: Finish query methods for this API
		db.assignments.find(find, function (error, assignments){
			if (error) {
				console.log(error);
				res.status(500).end();
			} else {
				var results = [];
				assignments.forEach(function (assignment){
					results.push({
						id: assignment._id,
						'class': assignment['class'],
						title: assignment.title,
						due_date: moment.unix(assignment.due_date).format("YYYY-MM-DD"),
						description: assignment.description,
						completed: assignment.completed
					});
				});
				res.status(200).json({
					count: results.length,
					assigns: results
				});
			}
		});
	});

	//Fetch Assignment Route: GET /api/assigns/v1/assigns/:id
	app.get(url("assigns","assigns/:id"), authorize, function (req, res){
		db.assignments.findOne({user_id: req.session.user_id, _id: mongojs.ObjectId(req.params.id)}, function (error, assignment){
			if (error) {
				console.log(error);
				res.status(500).end();
			} else if (!assignment) {
				res.status(404).end();
			} else {
				var result = {
					'class': assignment['class'],
					title: assignment.title,
					description: assignment.description,
					due_date: moment.unix(assignment.due_date).format("YYYY-MM-DD"),
					'completed': assignment.completed
				};
				res.status(200).json(result);
			}
		});
	});

	//Create Assignment Route: POST /api/assigns/v1/assigns
	app.post(url("assigns","assigns"), authorize, jsonParser, function (req, res){
		if (req.body['class'] !== undefined && req.body['class'] !== "" &&
			req.body.title !== undefined && req.body.title !== "" &&
			req.body.description !== undefined && req.body.description !== "" &&
			req.body.due_date !== undefined && req.body.due_date !== "") {

			var assign = {
				'class': req.body['class'],
				title: req.body.title,
				description: req.body.description,
				due_date: moment(req.body.due_date).unix(),
				user_id: req.session.user_id,
				'completed': false
			};

			db.assignments.insert(assign, function (error, assignment){
				if (error || !assignment) {
					console.log(error);
					res.status(500).end();
				} else {
					res.status(201).json({
						id: assignment._id
					});
				}
			});

		} else {
			res.status(400).end();
		}
	});

	//Update Assignment Route: PUT /api/assigns/v1/assigns/:id
	app.put(url("assigns","assigns/:id"), authorize, jsonParser, function (req, res){
		if (((req.body['class'] !== undefined && typeof req.body['class'] == "string") || req.body['class'] === undefined) &&
			((req.body.title !== undefined && typeof req.body.title == "string") || req.body.title === undefined) &&
			((req.body.description !== undefined && typeof req.body.description == "string") || req.body.description === undefined) &&
			((req.body.due_date !== undefined && typeof req.body.due_date == "string") || req.body.due_date === undefined) &&
			((req.body.completed !== undefined && typeof req.body.completed == "boolean") || req.body.completed === undefined)) {

			var assign = {};

			if (req.body['class'] !== undefined) {
				assign['class'] = req.body['class'];
			}

			if (req.body.title !== undefined) {
				assign['title'] = req.body.title;
			}

			if (req.body.description !== undefined) {
				assign['description'] = req.body.description;
			}

			if (req.body.due_date !== undefined) {
				assign['due_date'] = moment(req.body.due_date).unix();
			}

			if (req.body.completed !== undefined) {
				assign['completed'] = req.body.completed;
			}

			db.assignments.findOne({_id: mongojs.ObjectId(req.params.id), user_id: req.session.user_id}, function (error, assignment){
				if (error) {
					console.log(error);
					res.status(500).end();
				} else if (!assignment) {
					res.status(404).end();
				} else {
					db.assignments.update({_id: mongojs.ObjectId(assignment._id), user_id: req.session.user_id}, {$set: assign}, function (error, assignment){
						if (error) {
							console.log(error);
							res.status(500).end();
						} else {
							res.status(200).end();
						}
					});
				}
			});

		} else {
			res.send(400).end();
		}
	});

	//Delete Assignment Route: DELETE /api/assigns/v1/assigns/:id
	app.delete(url("assigns","assigns/:id"), authorize, function (req, res){
		db.assignments.findOne({_id: mongojs.ObjectId(req.params.id), user_id: req.session.user_id}, function (error, assignment){
			if (error) {
				console.log(error);
				res.status(500).end();
			} else if (!assignment) {
				res.status(404).end();
			} else {
				db.assignments.remove({_id: mongojs.ObjectId(assignment._id), user_id: req.session.user_id}, function (error){
					if (error) {
						console.log(error);
						res.status(500).end();
					} else {
						res.status(204).end();
					}
				});
			}
		});
	});

	//List Classes Route: GET /api/assigns/v1/classes
	app.get(url("assigns","classes"), authorize, function (req, res){
		db.assignments.aggregate([
			{$match: {
				user_id: req.session.user_id
			}}, {$group: {
				_id: "$class",
				count: { $sum: 1 }
			}}
		], function (error, classes){
			if (error) {
				console.log(error);
				res.status(500).end();
			} else {
				var results = [];
				classes.forEach(function (klass){
					results.push(klass._id);
				});
				res.json({
					count: results.length,
					classes: results
				});
			}
		});
	});
}

// Health Check Endpoint
app.get(config.server.health_check_url, function (req, res){
	res.status(200).end();
});

var server = app.listen(config.server.port, function(){

	var host = server.address().address;
	var port = server.address().port;

	console.log("Application Started: Listening on http://%s:%s%s", host, port, config.url.base);
})