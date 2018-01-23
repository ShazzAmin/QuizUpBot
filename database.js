// Includes
var fs = require("fs");

// Constants
var DATABASE_DIR = "./databases/";
var SEPARATOR = "|||";
var CACHE = false;

// Variables
var loaded = {}; // loaded databases

// Functions
function loadTopic(topicIdentifier)
{
	var filepath = DATABASE_DIR + topicIdentifier + ".json";
	
	if (!fs.exists(filepath))
	{
		fs.write(filepath, JSON.stringify({}, null, "\t"), "w");
	}

	loaded[topicIdentifier] = JSON.parse(fs.read(filepath));
}

function saveTopic(topicIdentifier)
{
	var filepath = DATABASE_DIR + topicIdentifier + ".json";

	fs.write(filepath, JSON.stringify(loaded[topicIdentifier], null, "\t"), "w");
}

module.exports = {
	getCorrectAnswer: function(topicIdentifier, questionText, questionImage)
	{
		if (!CACHE || typeof loaded[topicIdentifier] === "undefined") loadTopic(topicIdentifier);

		if (typeof loaded[topicIdentifier][questionText + SEPARATOR + questionImage] !== "undefined")
		{
			return loaded[topicIdentifier][questionText + SEPARATOR + questionImage];
		}
		else
		{
			return false;
		}
	},

	setCorrectAnswer: function(topicIdentifier, questionText, questionImage, correctAnswer)
	{
		if (!CACHE || typeof loaded[topicIdentifier] === "undefined") loadTopic(topicIdentifier);

		if (loaded[topicIdentifier][questionText + SEPARATOR + questionImage] === correctAnswer) return;

		loaded[topicIdentifier][questionText + SEPARATOR + questionImage] = correctAnswer;

		saveTopic(topicIdentifier);
	}
};