var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token,
    retry: Infinity
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, ':eyes: :partly_sunny_rain:?')
})

controller.hears(['weatherbot help', 'help weatherbot','wb help'], ['ambient'], function (bot, message) {
  bot.reply(message, 'Sup :sunglasses:')
  bot.reply(message, 'If you want me to tell you the weather, just say "weatherbot, weather in <city>, <state>", or "weatherbot, <city>, <state> weather".')
})

controller.hears(['help'], ['direct_message'], function (bot, message){
  bot.reply(message, 'If you want me to tell you the weather, just say "weatherbot, weather in <city>, <state>", or "weatherbot, <city>, <state> weather".')
  bot.reply(message, 'Or just "wb, <city>, <state>')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello! If you me to tell you my syntax, say help :sunglasses:')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me! :heart:')
})

controller.hears(['what up weatherfam?', 'wup', 'bitch tell me da weather'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
	var EventEmitter = require("events").EventEmitter;
	var edina = new EventEmitter();
	var shreveport = new EventEmitter();
	
	var copenhagen = new EventEmitter();
	var tokyo = new EventEmitter();
	var brussels = new EventEmitter();
	
	//var date = new Date();
	
	//var copenhagenTime = calculateTime(date, 7, 1);
	//var tokyoTime = calculateTime(date, 14, 1);
	//var brusselsTime = calculate(date, 7, 1);
	
	
	
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'sunny',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

	var edinaRequest = require('request');
	edinaRequest('http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/MN/Edina.json', function(error, response, data){
		if (!error && response.statusCode == 200){
			edina.data = JSON.parse(data);
			edina.data = edina.data.current_observation;
			edina.complete = true;
			displayWeather();
		}
	});
	
	var shreveportRequest = require('request');
	shreveportRequest('http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/LA/Shreveport.json', function(error, response, data){
		if (!error && response.statusCode == 200){
			shreveport.data = JSON.parse(data);
			shreveport.data = shreveport.data.current_observation;
			shreveport.complete = true;
			displayWeather();
		}
	});
	
	var copenhagenRequest = require('request');
	copenhagenRequest('http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/DK/copenhagen.json', function(error, response, data){
		if (!error && response.statusCode == 200){
			copenhagen.data = JSON.parse(data);
			copenhagen.data = copenhagen.data.current_observation;
			copenhagen.complete = true;
			displayWeather();
		}
	});
	
	var tokyoRequest = require('request');
	tokyoRequest('http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/JP/tokyo.json', function(error, response, data){
		if (!error && response.statusCode == 200){
			tokyo.data = JSON.parse(data);
			tokyo.data = tokyo.data.current_observation;
			tokyo.complete = true;
			displayWeather();
		}
	});
	
	var brusselsRequest = require('request');
	brusselsRequest('http://api.wunderground.com/api/e6d58e1b342bc28a/geolookup/conditions/q/BE/brussels.json', function(error, response, data){
		if (!error && response.statusCode == 200){
			brussels.data = JSON.parse(data);
			brussels.data = brussels.data.current_observation;
			brussels.complete = true;
			displayWeather();
		}
	});
	
	function displayWeather(){
		if(edina.complete && shreveport.complete && copenhagen.complete && tokyo.complete && brussels.complete){
			controller.storage.users.get(message.user, function(err, user) {        
				bot.reply(message, 'Shreveport: ' + shreveport.data.temp_f +
				'° F with ' + shreveport.data.relative_humidity + ' humidity. ' + shreveport.data.wind_mph + ' mph wind, current conditions: '+ shreveport.data.weather
				);
				bot.reply(message, 'Edina:           ' + edina.data.temp_f +
				'° F with ' + edina.data.relative_humidity + ' humidity. ' + edina.data.wind_mph + ' mph wind, current conditions: '+ edina.data.weather
				);
				bot.reply(message, 'Copenhagen: ' + copenhagen.data.temp_f +
				'° F with ' + copenhagen.data.relative_humidity + ' humidity. ' + copenhagen.data.wind_mph + ' mph wind, current conditions: '+ copenhagen.data.weather
				);
				bot.reply(message, 'Tokyo: ' + tokyo.data.temp_f +
				'° F with ' + tokyo.data.relative_humidity + ' humidity. ' + tokyo.data.wind_mph + ' mph wind, current conditions: '+ tokyo.data.weather
				);
				bot.reply(message, 'Brussels: ' + brussels.data.temp_f +
				'° F with ' + brussels.data.relative_humidity + ' humidity. ' + brussels.data.wind_mph + ' mph wind, current conditions: '+ brussels.data.weather
				);
			});
			
			uniqueWeatherChecks();	
		}
	}
	
	function uniqueWeatherChecks(){
		if(edina.data.temp_f > shreveport.data.temp_f){
				controller.storage.users.get(message.user, function(err, user) {        
						bot.reply(message, '(Edina is actually hotter? Hell finally froze over, huh? :joy: :sob:)');
				});
		}				
	};
	
	function calculateTime(date,hourDifference,ahead){
		var localTime;
		if (ahead == 0){
			//hourDifference = -Math.abs(hourDifference);
		}
		
		localTime.hour = date.getHours() + hourDifference;
		if(date.hour > 24){
			localTime.hour = localTime.hour % 24;
		}
		if(localTime.hour < 0){
			localTime.hour += 24;
		}
		return date.hour + ':' + date.minute;
	}
});

controller.hears(['wb forecast (.*)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
	var request = require('request');
	var rawLocation = message.match[1];
	var location = rawLocation.split(',');
	var url = 'http://api.wunderground.com/api/e6d58e1b342bc28a/forecast/q/' + location[1] + '/' + location[0] + '.json';
	request(url, function(error, response, data){
		if (!error && response.statusCode == 200){
			var parsedData = JSON.parse(data);
			
			if(parsedData.forecast != null){
				if(location[2] == null){
					controller.storage.users.get(message.user, function(err, user) {        
						bot.reply(message, 'Today\'s ' + location[0] + ' forecast: ' + parsedData.forecast.txt_forecast.forecastday[0].fcttext + '. Chance of rain: ' + parsedData.forecast.txt_forecast.forecastday[0].pop );
						});			
				}
				else{
					controller.storage.users.get(message.user, function(err, user) {        
							bot.reply(message, location[0] + ' forecast for ' + location[2] + ' days from now: ' + parsedData.forecast.txt_forecast.forecastday[location[2]].fcttext + '. Chance of rain: ' + parsedData.forecast.txt_forecast.forecastday[location[2]].pop);
						});						
				}
			}
		}
	});
});


controller.hears(['weatherbot, weather in (.*)','weatherbot, (.*) weather','wb, (.*)','wb (.*)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    var rawLocation = message.match[1];
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
});

controller.hears('(.*)', ['direct_message', 'direct_mention'], function (bot, message) {
    var rawLocation = message.match[1];
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
})
