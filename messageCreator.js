var messageCreator = function () {};


messageCreator.prototype.getWeather = function(bot,message,controller,inputLocation){
	var request = require('request');
	var rawLocation = inputLocation;
	var location = rawLocation.split(',');
	var url = 'http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/' + location[1] + '/' + location[0] + '.json';
	
	request(url, function(error, response, data){
		if (!error && response.statusCode == 200){
			var parsedData = JSON.parse(data);
			parseWeatherMessage(bot,message,controller,location,parsedData);
		}
	});
}

messageCreator.prototype.getForecast = function(bot,message,controller,inputLocation){
	var request = require('request');
	var rawLocation = inputLocation;
	var location = rawLocation.split(',');
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
			bot.reply(message, '```' + location[0].toUpperCase() + 
			'\nTemperature: ' + parsedData.current_observation.temp_f + '° F' + 
			'\nHumidity: ' + parsedData.current_observation.relative_humidity + 
			'\nDewpoint: ' + parsedData.current_observation.dewpoint_f + ' ° F' + 
			'\nWind: ' + parsedData.current_observation.wind_mph + ' mph' + 
			'\nCurrent Conditions: ' + parsedData.current_observation.weather + '```'
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
				bot.reply(message, 'Today\'s ' + location[0].toUpperCase() + ' forecast: \n```' + 
					'Conditions: ' + parsedData.forecast.simpleforecast.forecastday[0].conditions +
					'\nHigh: ' + parsedData.forecast.simpleforecast.forecastday[0].high.fahrenheit +
					'\nLow: ' + parsedData.forecast.simpleforecast.forecastday[0].low.fahrenheit + 
					'\nHumidity ' + parsedData.forecast.simpleforecast.forecastday[0].avehumidity + '%' +
					'\nWind: ' + parsedData.forecast.simpleforecast.forecastday[0].avewind.mph + ' mph' +
					'\nChance of precipitation: ' + parsedData.forecast.simpleforecast.forecastday[0].pop + 
					'\nInches of snow: ' + parsedData.forecast.simpleforecast.forecastday[0].snow_allday.in + '```'		
				);
			});
		}
		else{
			controller.storage.users.get(message.user, function(err, user) {       
				bot.reply(message, location[0].toUpperCase() + ' forecast for ' + location[2] + ' days from now: \n```' + 
					'Conditions: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].conditions + 
					'\nHigh: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].high.fahrenheit +
					'\nLow: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].low.fahrenheit +
					'\nHumidity: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].avehumidity + '%' +
					'\nWind: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].avewind.mph + ' mph' +
					'\nChance of precipitation: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].pop +
					'\nInches of snow: ' + parsedData.forecast.simpleforecast.forecastday[location[2]].snow_allday.in + '```'
				);
			});						
		}
	}
}

module.exports = new messageCreator();