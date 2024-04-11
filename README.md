# CardsForHumanity

This is a personal project I decided to take on to help myself learn web development.
To be honest, I never thought I'd make it to this point, and I'm so excited to see where I can take it from here.
I owe a lot of thanks to my friends who showed interest in this stupid project of mine; it really helped me push through some of the tougher parts

To play the game, run the [main.js](main.js) file
Local players can join by connecting to your computer's local IP on port 3000
The following shell commands can be ran to find your local IP

Mac/Linux
```
ifconig
```
Windows 
```
ipconfig
```

Currently, this game doesn't have a proper form of player handling, to players cannot join or leave mid-game,
just make sure all players are connected before the game is started
The first player to join the lobby is the admin and has control over selected packs and starting the game

# Rules

The rules function exactly as they do in Cards Against Humanity, the only notable difference being the hand size of ten instead of seven

Further explanation of the CAH rules can be found [HERE](https://s3.amazonaws.com/cah/CAH_Rules.pdf).

Additionally, this version of the game has a wagering system.
 - Players can set their wager value to some number no less than 1 and no greater than their current score.
 - When a card is selected at the end of the round, the winning player's score will be increased by their wager value.
 - All losing players' scores are reduced by their wager values minus one, so wagers of one do not see score reductions.

# Dependencies

This project runs off of [Express](https://github.com/expressjs/expressjs.com),  [HTTP](https://nodejs.org/api/http.html), and [Socket.io](https://github.com/socketio/socket.io)

These can be installed with
```
npm install express http socket.io
```
