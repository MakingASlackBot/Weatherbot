var messageCreator = function () {};


messageCreator.prototype.getWeather = function(bot, message){
	var rawLocation = message;
	var location = rawLocation.split(',');
	var url = 'http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/' + location[1] + '/' + location[0] + '.json';
	
	var request = require('request');
	
	request(url, function(error, response, data){
		if (!error && response.statusCode == 200){
			var parsedData = JSON.parse(data);
			
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
	});
}

module.exports = new messageCreator();