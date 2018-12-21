// Require node modules that you need
var express = require('express');
var layouts = require('express-ejs-layouts');
var parser = require('body-parser');
var geocoder = require('simple-geocoder');
var request = require("request");
var moment = require('moment');

// Help me
var wiIcon = {
  'clear-day': 'wi-day-sunny',
  'clear-night': 'wi-night-clear',
  'rain': 'wi-sprinkle',
  'snow': 'wi-snow',
  'sleet': 'wi-sleet',
  'wind': 'wi-cloudy-gusts',
  'fog': 'wi-fog',
  'cloudy': 'wi-cloudy',
  'partly-cloudy-day': 'wi-day-cloudy',
  'partly-cloudy-night': 'wi-night-alt-cloudy',
};

// Read in the .env file
require("dotenv").config();

// Declare your app
var app = express();

// Tell express what view engine you want to use
app.set('view engine', 'ejs');

// Include any middleware here
app.use(layouts);
app.use(express.static('static'));
app.use(parser.urlencoded({ extended: false }));

// Declare routes
app.get('/', function(req, res){
  res.render('home');
});

app.post('/', function(req, res){
  geocoder.geocode(req.body.locationInput, (success, locations)=>{
    if (success) {
      request(`${process.env.DARK_SKY_URL}${locations.y},${locations.x}`, (error, response, body)=>{
        if (error) {
          console.log('Bad news bears, there\'s been an error', error);
        } else {
          var results = JSON.parse(body);

          // Lets get some DATES
          var dailyData = results.daily.data;
          dailyData.splice(5, 3);
          dailyData.map((dataPack, index) =>{
            dailyData[index].day = moment.unix(dataPack.time).format('dddd');
            dailyData[index].wiIcon = wiIcon[dataPack.icon];
          });
          
          res.render('result', {userInput: req.body.locationInput, lat: locations.x, long: locations.y, weather: results, dailyData: dailyData});
        }
      })
    }
  });
});

// Listen on PORT 3000
app.listen(3000, function(){
  console.log('You\'re listening to the smooth sounds of port 3000. ☕');
});
