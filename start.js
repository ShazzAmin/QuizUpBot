/*
	Bot Object Structure
	{
		topicIdentifier: "myTopicIdentifier", // Found in URL (example: https://www.quizup.com/topics/logos -> "logos")
		sessionCookie: "mySessionCookie" // `web_session` cookie
	}
*/

// Includes
var spawn = require("child_process").spawn;
var fs = require("fs");

// Check arguments
if (process.argv.length < 3 || process.argv[2] == "")
{
	console.log("Usage: " + process.argv[0] + " " + process.argv[1] + " [botInfoFile]");
	process.exit();
}

// Variables
var botInfoFile = process.argv[2]; // Path to a (JSON) file containing an array of bot objects
var bots = null;

// Function
function runBot(botInfo)
{
	var bot = spawn("phantomjs", ["main.js", botInfo.topicIdentifier, botInfo.sessionCookie]);
	console.log("Launched Bot #" + botInfo.ID + ".");

	bot.stdout.on("data", function(data){
		console.log("[Bot #" + this.botInfo.ID + "][STDOUT] " + data);
	}.bind({botInfo: botInfo}));

	bot.stderr.on("data", function(data){
		console.log("[Bot #" + this.botInfo.ID + "][STDERR] " + data);
	}.bind({botInfo: botInfo}));

	bot.on("close", function(exitCode){
		console.log("Bot #" + this.botInfo.ID + " exited (" + exitCode + ").");
		runBot(botInfo);
	}.bind({botInfo: botInfo}));
}

// Main
// Check if file exits and can be read
fs.access(botInfoFile, fs.F_OK | fs.R_OK, function(err){
	if (err)
	{
		console.log("File doesn't exist/can't be read.");
		process.exit();
	}

	// Read file
	fs.readFile(botInfoFile, function(err, data){
		if (err)
		{
			console.log("Failed to read file.");
			process.exit();
		}

		var bots = JSON.parse(data);

		for (var i = 0; i < bots.length; i++)
		{
			bots[i].ID = i + 1;
			runBot(bots[i]);
		}
	});
});
