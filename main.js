// Includes
var system = require("system");
var webpage = require("webpage");
var database = require("./database.js");
var contentScript = require("./content-script.js");

// Check arguments
if (system.args.length < 3 || system.args[1] == "" || system.args[2] == "")
{
	console.log("Usage: " + system.args[0] + " [topicIdentifier] [sessionCookie]");
	phantom.exit();
}

// Variables
var topicIdentifier = system.args[1]; // Found in URL (example: https://www.quizup.com/topics/logos -> "logos")
var sessionCookie = system.args[2]; // `web_session` cookie
var session = null;

// Start a new session
function startSession()
{
	// Close previous session
	if (session !== null) session.close();
	session = null;

	// Create session
	console.log("Starting new session...");
	session = webpage.create();
	// Explicitly announce that this is a bot
	session.settings.userAgent = "QuizUpBot";

	// Open session
	session.open("https://www.quizup.com/topics/" + topicIdentifier, function(status){
		// If could not open session
		if (status !== "success")
		{
			console.log("Could not open session.");
			phantom.exit();
			return;
		}

		// Inject jQuery
		if (!session.injectJs("jquery-1.12.0.min.js"))
		{
			console.log("Could not inject jQuery.");
			phantom.exit();
			return;
		}

		// Check if logged in
		if (session.evaluate(
			function(){ return $(".Header__profile").length <= 0; }
		))
		{
			console.log("Not logged in (invalid sessionCookie).");
			phantom.exit();
			return;
		}

		// Check if topicIdentifier is valid
		if (session.evaluate(
			function(){ return $(".TopicHeader__title__name").length <= 0; }
		))
		{
			console.log("topicIdentifier is invalid.");
			phantom.exit();
			return;
		}

		// Inject script
		session.evaluate(contentScript);
	});

	// When window.callPhantom is called in content script
	session.onCallback = function(data)
	{
		if (typeof data.action === "undefined") return;

		switch (data.action)
		{
			case "getCorrectAnswer":
				return database.getCorrectAnswer(topicIdentifier, data.questionText, data.questionImage);
				break;

			case "setCorrectAnswer":
				database.setCorrectAnswer(topicIdentifier, data.questionText, data.questionImage, data.correctAnswer);
				break;

			case "exit":
				console.log("\nClosed session." + (typeof data.reason !== "undefined" ? " Reason: " + data.reason : ""));
				startSession();
				break;

			default:
				break;
		}
	}.bind(this);

	// When the content script outputs to console
	session.onConsoleMessage = function(message)
	{
		console.log(message);
	};
}

// Set cookie
phantom.addCookie({
	"name": "web_session",
	"domain": ".quizup.com",
	"value": sessionCookie
});

// Start first session
startSession();
