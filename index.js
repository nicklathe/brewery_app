var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var app = express();
var BreweryDb = require("brewerydb-node");
var brewdb = new BreweryDb(process.env.brew_db);
var request = require("request");

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
	secret: "ilovebeer",
	resave: false,
	saveUninitialized: true
}));

// app.get("/", function(req, res){
// 	request("https://maps.googleapis.com/maps/api/geocode/json?address=1050+North+34th+Street,+Seattle,+WA&key=AIzaSyAM7-sHXiFxjPvCruNLY_yikgBYOpzDVUM",
// 	function(error, response, body){
// 		res.send(body);
// 	});
// });

// app.get("/", function(req, res){
// 	request("http://api.tiles.mapbox.com/v4/geocode/mapbox.places/1050+North+34th+Street+,Seattle,+WA.json?access_token=pk.eyJ1Ijoibmlja2xhdGhlIiwiYSI6InhteXZpY1kifQ.7auBYdWGL5ttVM1kbrn93Q",
// 	function(err, response, body){
// 		var result = JSON.parse(body);
// 		res.send(result);
// 	});
// });


app.get("/", function(req, res){

	request("http://api.brewerydb.com/v2/locations?key=d89bf914be5d33893a9cbe1cdd88556c&locality=seattle", function(err, response, body){
		// console.log(body);
		// res.send(body);
		res.render("index", {mapData: body});
	});
	

});

// app.get("/", function(req, res){
// 	res.render("header");
// });

// app.get("/", function(req, res){
// 	brewdb.search.breweries({q: "rock bottom", withLocations: "Y"}, function(err, data){
// 		res.send(data);
// 	});
	
	// brewdb.search.beers({q: "fremont", withBreweries: "Y"}, function(err, data){
	// 	res.send(data);
	// });

// });

// app.get("/", function(req, res){
// 	brewdb.breweries.find({locations: {locality: "Seattle"}}, function(err, data){
// 		console.log(data);
// 		res.send(data);
// 	});
// });


// http://api.brewerydb.com/v2/breweries?name=*rock%20bottom*&key=d89bf914be5d33893a9cbe1cdd88556c

app.get("/", function(req, res){
	request("http://api.brewerydb.com/v2/breweries/name/search?q=Fremont&key=d89bf914be5d33893a9cbe1cdd88556c&format=json&withLocation=Y", function(err, response, body){
		console.log(body);
		res.send(body);
	});
});



app.listen(3000);
