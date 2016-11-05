var messageCreator = function () {};


messageCreator.prototype.getWeather = function(bot,message,controller,inputLocation){
	var rawLocation = inputLocation;
	var location = rawLocation.split(',');
	var parsedData = wundergroundGet(location);
	parseForecastMessage(bot,message,controller,location,parsedData);
}

var wundergroundGet = function(location){
	var request = require('request');
	var url = 'http://api.wunderground.com/api/e6d58e1b342bc28a/forecast/q/' + location[1] + '/' + location[0] + '.json';
	request(url, function(error, response, data){
		if (!error && response.statusCode == 200){
			var parsedData = JSON.parse(data);
		}
	});
}

messageCreator.prototype.getForecast = function(bot,message,controller,inputLocation){
	var request = require('request');
	var url = 'http://api.wunderground.com/api/e6d58e1b342bc28a/forecast/q/' + location[1] + '/' + location[0] + '.json';
	request(url, function(error, response, data){
		if (!error && response.statusCode == 200){
			var parsedData = JSON.parse(data);
			parseForecastMessage(bot,message,controller,location,parsedData);
		}
	});
}

var parseWeatherMessage = function(bot,message,controller,location,parsedData){
	if(parsedData.current_observation != null){
		controller.storage.users.get(message.user, function(err, user) {        
			bot.reply(message, location[0] + ': ' + parsedData.current_observation.temp_f +
			'° F with ' + parsedData.current_observation.relative_humidity + ' humidity. ' + parsedData.current_observation.wind_mph + ' mph wind, current conditions: '+ parsedData.current_observation.weather
			);				
		});
	}
	else{
		controller.storage.users.get(message.user, function(err, user) {        
			bot.reply(message, 'Sorry, I\'m not finding any data for ' + rawLocation + ' right now :whew:');
		});				
	}
}

var parseForecastMessage = function(bot,message,controller,location,parsedData){
	if(parsedData.forecast != null){
		if(location[2] == null){
			controller.storage.users.get(message.user, function(err, user) {        
			bot.reply(message, 'Today\'s ' + location[0] + ' forecast: ' + parsedData.forecast.simpleforecast.forecastday[0].conditions + '. High is ' + parsedData.forecast.simpleforecast.forecastday[0].high.fahrenheit + ', low is ' + parsedData.forecast.simpleforecast.forecastday[0].low.fahrenheit + '. ' + parsedData.forecast.simpleforecast.forecastday[0].avewind.mph + ' mph wind, ' + parsedData.forecast.simpleforecast.forecastday[0].avehumidity + '% humidity. Chance of precipitation: ' + parsedData.forecast.simpleforecast.forecastday[0].pop + '%. Plan for ' +  parsedData.forecast.simpleforecast.forecastday[0].snow_allday.in + ' inches of snow.');
			});			
		}
		else{
			controller.storage.users.get(message.user, function(err, user) {       
				bot.reply(message, location[0] + ' forecast for ' + location[2] + ' days from now: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].conditions + '. High is ' + parsedData.forecast.simpleforecast.forecastday[location[2]].high.fahrenheit + ', low is ' + parsedData.forecast.simpleforecast.forecastday[location[2]].low.fahrenheit + '. ' + parsedData.forecast.simpleforecast.forecastday[location[2]].avewind.mph + ' mph wind, ' + parsedData.forecast.simpleforecast.forecastday[location[2]].avehumidity + '% humidity. Chance of precipitation: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].pop + '%. Plan for ' +  parsedData.forecast.simpleforecast.forecastday[location[2]].snow_allday.in + ' inches of snow.');
			});						
		}
	}
}

module.exports = new messageCreator();