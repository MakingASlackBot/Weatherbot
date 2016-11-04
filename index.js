var Botkit = require('botkit')
var messageCreator = require('./messageCreator');

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

controller.hears(['wb shitport'], ['ambient,direct_message'], function (bot, message) {
  messageCreator.getWeather(bot,message,controller,'Shreveport,LA');
})

controller.hears(['mashed potato','mashed potatoes'], ['direct_mention'], function (bot, message) {
  bot.reply(message, ':eyes: :partly_sunny_rain:?')
})

//help ambient
controller.hears(['weatherbot help', 'help weatherbot','wb help'], ['ambient'], function (bot, message) {
  bot.reply(message, 'Sup :sunglasses:')
  bot.reply(message, 'If you want me to tell you the weather, just say "weatherbot, weather in <city>, <state>", or "weatherbot, <city>, <state> weather".')
})

//help direct message
controller.hears(['help'], ['direct_message'], function (bot, message){
  bot.reply(message, 'If you want me to tell you the weather, just say "weatherbot, weather in <city>, <state>", or "weatherbot, <city>, <state> weather".')
  bot.reply(message, 'Or just "wb, <city>, <state>')
})

//hello
controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello! If you me to tell you my syntax, say help :sunglasses:')
})

//wup
controller.hears(['what up weatherfam?', 'wup', 'bitch tell me da weather'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
	
	var wupArray = ['Shreveport,LA','Edina,MN','Copenhagen,DK','Tokyo,JP','Brussels,BE'];
	var i = 0;
	//bot.reply(message, ':construction: Wup is under construction, try back later :construction:');
	repeatWUP(bot,message,controller,wupArray,i).success(function() {
		if (i < wupArray.length-1){
			repeatWUP(bot,message,controller,wupArray,i+1);
		};
});
	
	
	
	// messageCreator.getWeather(bot,message,controller,'Edina,MN');
	// messageCreator.getWeather(bot,message,controller,'Copenhagen,DK');
	// messageCreator.getWeather(bot,message,controller,'Tokyo,JP');
	// messageCreator.getWeather(bot,message,controller,'Brussels,BE');
});

function repeatWUP(bot,message,cotroller,wupArray,i){
	messageCreator.getWeather(bot,message,controller,wupArray[i]);

}

//forecast ambient message
controller.hears(['wb forecast (.*)','wb fc (.*)'], 'ambient,direct_message,direct_mention', function(bot, message) {
	messageCreator.getForecast(bot,message,controller,message.match[1]);
});

//weather ambient message
controller.hears(['weatherbot, weather in (.*)','weatherbot, (.*) weather','wb, (.*)','wb (.*)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    messageCreator.getWeather(bot,message,controller,message.match[1]);
});

//some change, did it not build right?
//forecast direct message
controller.hears(['fc (.*)','forecast (.*)'], 'direct_message,direct_mention', function (bot, message)
{
	messageCreator.getForecast(bot,message,controller,message.match[1]);
});

//weather direct message
controller.hears('(.*)', ['direct_message', 'direct_mention'], function (bot, message) {
    messageCreator.getWeather(bot,message,controller,message.match[1]);
})
