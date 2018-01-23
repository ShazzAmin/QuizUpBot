// Content Script - is injected into the page and executed
module.exports = function(){
	// Functions
	/*
		Waits until an element (specified by `selector`) exists and meets a condition (specified by `doesMeetCondition`) (optional).
		If `doesMeetCondition` is given, it is called with the element as the only argument. It should return true if it meets the condition, false otherwise.
		Once the element is detected, `callback` is called with said element as the only argument.
	 */
	function get(selector, callback, doesMeetCondition)
	{
		if (typeof doesMeetCondition === "undefined")
		{
			doesMeetCondition = function(elem){ return true; };
		}

		setTimeout(function(){
			if ($(selector).length > 0 && doesMeetCondition($(selector)))
			{
				callback($(selector));
			}
			else
			{
				get(selector, callback);
			}
		}.bind(this), 100);
	}

	/*
		Keeps getting an element (specified by `selector`) until it meets a condition (specified by `shouldStop`).
		`callback` is called repeatedly with the element as the only argument.
		`shouldStop` is called repeatedly with the element as the onyl argument. It should return true if `callback` should stop being called, false otherwise.
		`delay` (optional) specified the time (in milliseconds) to wait between calling `callback`.
	*/
	function getUntil(selector, callback, shouldStop, delay)
	{
		if (typeof delay === "undefined") delay = 100;

		var timer = setInterval(function(){
			get(selector, function(elem){
				if (shouldStop(elem))
				{
					clearInterval(timer);
					return;
				}

				callback(elem);
			}.bind(this));
		}.bind(this), delay);
	}

	/*
		Waits until an element (specified by `selector`) has changed.
		`didChange` is called with the old element as the first argument and the new element as the second argument. It should return true if there is a change, false otherwise.
		Once a change is detected, `callback` is called with the new element as the only argument.
		This function will watch for a change indefinitely.
		If the `selector` matches no elements, it will wait until an element matches.
		`callback` will be called the first time this function is called.
	*/
	function onChange(selector, callback, didChange)
	{
		var oldElem = null;

		setInterval(function(){
			get(selector, function(newElem){
				if (oldElem === null || didChange(oldElem, newElem))
				{
					callback(newElem);
					oldElem = newElem;
				}
			}.bind(this));
		}.bind(this), 100);
	}

	/*
		Gets the question's text.
		`elem` should be the element with the class "Question".
	*/
	function getQuestionText(elem)
	{
		return elem.find(".Question__text").text();
	}

	/*
		Gets the unique string representing of the question's image.
		`elem` should be the element with the class "Question".
		If the question does not have an image, an empty string ("") is returned.
	*/
	function getQuestionImage(elem)
	{
		if (elem.find(".Question__image__content").length > 0)
		{
			var matches = elem.find(".Question__image__content").css("background-image").match(/url\((.*)\)/i);
			if (matches !== null)
			{
				var parser = document.createElement("a");
				parser.href = matches[1];
				return parser.pathname;
			}
			else
			{
				return "";
			}
		}
		else
		{
			return "";
		}
	}

	/*
		Returns a random integer between min and max (inclusive).
	*/
	function getRandomIntInclusive(min, max)
	{
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// Variables
	var questionCount = 0;

	// Start
	get(".PlayButton", function(btn){
		btn[0].click();

		get(".PlayRandomButton", function(btn){
			btn[0].click();

			onChange(".Question", function(elem){
				questionCount++;
				var questionText = getQuestionText(elem);
				var questionImage = getQuestionImage(elem);

				console.log("\n--- Question #" + questionCount + " ---");
				console.log("Text: " + questionText);
				if (questionImage !== "") console.log("Image: " + questionImage);

				var result = callPhantom({action: "getCorrectAnswer", questionText: questionText, questionImage: questionImage});
				var selector = "";
				if (result !== false)
				{
					console.log("Answer found in database: " + result);
					selector = ".Answer__text:contains('" + result + "')";
				}
				else
				{
					console.log("Answer not found in database.");
					selector = ".Answer__text:eq(" + getRandomIntInclusive(0, 3) + ")";
				}

				getUntil(selector, function(elem){
					// Click on answer
					(elem.parent())[0].click();
				}.bind(this), function(elem){
					return elem.parent().hasClass("Answer--clicked");
				}.bind(this), 500);

				get(".Answer--correct", function(elem){
					// Store correct answer
					var correctAnswer = elem.text();
					console.log("Correct answer: " + correctAnswer);
					callPhantom({action: "setCorrectAnswer", questionText: questionText, questionImage: questionImage, correctAnswer: correctAnswer});
				}.bind(this));

			}.bind(this), function(oldElem, newElem){
				// If either text or image changed, return true. Otherwise, false.
				return (getQuestionText(oldElem) !== getQuestionText(newElem)) || (getQuestionImage(oldElem) !== getQuestionImage(newElem));
			}.bind(this));

		}.bind(this));

	}.bind(this));

	// If endgame is detected, exit
	get(".EndGameHeader", function(elem){
		// Add a delay otherwise game won't count
		setTimeout(function(){
			callPhantom({action: "exit", reason: "Game ended."});
		}, 1000);
	});

	// After 3 minutes, exit regardless of game state (to avoid game being stuck forever)
	setTimeout(function(){
		callPhantom({action: "exit", reason: "Session timed out."});
	}, 3 * 60 * 1000);
};