var geocoder = require("geocoder");


geocoder.geocode("eifel tower, paris, france", function ( err, data ) {
  // do something with data
  console.log(data.results[0].geometry);
});

