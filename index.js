var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var app = express();
var BreweryDb = require("brewerydb-node");
var brewdb = new BreweryDb(process.env.brew_db);
var request = require("request");
var flash = require("connect-flash");
var bcrypt = require("bcrypt");
var db = require("./models");

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
	secret: "ilovebeerandbreweries",
	// secret: process.env.session_secret,
	resave: false,
	saveUninitialized: true
}));

app.use(flash());

app.use(function(req, res, next){
	req.getUser = function(){
		return req.session.user || false;
	};
	next();
});

// Passes alert object to all pages with the wildcard * and res.locals
app.get("*", function(req, res, next){
	var alerts = req.flash();
	res.locals.alerts = alerts;
	next();
});

app.get("/about", function(req, res){
	var user = req.getUser();
	res.render("about", {user:user});
});

// Inital request to get all the breweries from brewerydb and render them to the home page
app.get("/", function(req, res){
	var user = req.getUser();
	request("http://api.brewerydb.com/v2/locations?key=" + process.env.brew_db + "&locality=seattle", function(err, response, body){
		res.render("index", {mapData: body, user: user});
	});
});

// Get for brewery page, and lists all beers if avialable
app.get("/brewery/:id", function(req, res){
	var user = req.getUser();
	var brewId = req.params.id;
	request("http://api.brewerydb.com/v2/breweries?key=" + process.env.brew_db + "&ids=" + brewId, function(err, response, body){
		var breweryIndiv = JSON.parse(body);
		request("http://api.brewerydb.com/v2/brewery/" + brewId + "/beers?key=" + process.env.brew_db, function(err, response, body){
			var beerList = JSON.parse(body);
			res.render("brewery", {breweryIndiv:breweryIndiv, user:user, beerList:beerList});
		});
	});
});

// Testing posts only if user is logged in.
app.post("/list", function(req, res){
	var user = req.getUser();
	if(user){
		db.favorite.findOrCreate({where: {brewery_name: req.body.brewery_name, brewery_id: req.body.brewery_id, userId: user.id}}).spread(function(savedBrewery, created){
			if(created){
				req.flash("success","Added to your list");
				res.redirect("/");
			} else {
				req.flash("danger","Brewery already exists in your list");
				// res.redirect("/");
			};
			res.redirect("/");
		});
	} else {
		req.flash("warning","Please login");
		res.redirect("/");
	}
});

// Get's the list/My Breweries page
app.get("/list", function(req, res){
	var user = req.getUser();
	if(user){
		db.user.find({where: {id: user.id}}).then(function(userReturn){
			db.favorite.findAll({where: {userId: userReturn.id}}).then(function(returnedList){
				res.render("list", {returnedList:returnedList, user:user});
			});
		});
	} else {
		req.flash("warning","Please login");
		res.redirect("/");
	};
});

// //Deletes brewery from My Breweries list, from list and db
// app.delete("/list", function(req, res){
// 	db.favorite.destroy({where: {brewery_id: req.body.brewery_id}}).then(function(data){
// 		res.send({data:data});
// 	});
// });

// Get's the login/signup page
app.get("/login", function(req, res){
	var user = req.getUser();
	res.render("login", {user:user});
});

// Creates new user in users model, and keeps user logged in via session
app.post("/signup", function(req, res){
	db.user.findOrCreate({where: {email: req.body.email},
		defaults: {name: req.body.name, email: req.body.email, password: req.body.password}}).spread(function(createdUser, created){
			req.session.user = {
				id: createdUser.id,
				name: createdUser.name,
				email: createdUser.email
			};
			res.redirect("/");
		}).catch(function(error){
			if(error && Array.isArray(error.errors)){
				error.errors.forEach(function(errorItem){
					req.flash("danger", errorItem.message);
				});
			} else {
				req.flash("danger", "Unknown error");
			}
			res.redirect("/login");
		});
});

// User login.
app.post("/login", function(req, res){
	db.user.find({where: {email: req.body.email}}).then(function(userObj){
		if(userObj){
			bcrypt.compare(req.body.password, userObj.password, function(err, match){
				if(match === true){
					req.session.user = {
						id: userObj.id,
						email: userObj.email,
						name: userObj.name
					};
					res.redirect("/");
				} else {
					req.flash("warning", "Invalid username or password");
					res.redirect("/login");
				}
			});
		} else {
			req.flash("warning", "Unknown user.");
			res.redirect("/login");
		}
	});
});

//Get's brewery route page
app.get("/route", function(req, res){
	var user = req.getUser();
	request("http://api.brewerydb.com/v2/locations?key=" + process.env.brew_db + "&locality=seattle", function(err, response, body){
		res.render("route", {mapData: body, user: user});
	});
});

//Logs user out/deletes user session
app.get("/logout", function(req, res){
	delete req.session.user;
	req.flash("info","You have been logged out");
	res.redirect("/");
});

//Handles 404 errors 
app.use(function(req, res, next){
	res.send(404, "Sorry that page doesn't exist.");
});


app.listen(process.env.PORT || 3000);







