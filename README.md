QuizUp Bot
==========
*by Shazz Amin*

Bot that plays QuizUp games through the offical web app (now discontinued). **Created purely for educational purposes.**

### Features
* Fully automated; doesn't require any oversight after initial set-up
* Learns questions and answers over time
* Supports multiple bots playing multiple different topics simultaneously

### Initial Set-up
Create a JSON file containing an array of objects, one for each bot (can have as many as desired). Each object should specify two items:
1. `topicIdentifier` - the topic the bot will play, specified by a topic identifier (i.e. whatever comes after the last slash in the topic's homepage URL)
2. `sessionCookie` - the account the bot will use to play, specified by a `web_session` cookie that is associated with an authenticated account

Example of a bots file:
```
[
    {
        "topicIdentifier": "logos",
        "sessionCookie": "<web_session cookie>"
    },
    {
        "topicIdentifier": "_fcb485a6-cf0f-439f-906e-804bb304b8a2",
        "sessionCookie": "<web_session cookie>"
    }
]
```

### Run
###### Pre-requisites:
* Node.js (>= 8.9.4)

`node start.js [botsFile]`
