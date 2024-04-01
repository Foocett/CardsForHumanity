const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let clients = {};
let cardSubmissions = [];
let submissionCount = 0;
let hasFirstPlayerJoined = false;
let hasFirstTurnStarted = false;
app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/client.html');
});

app.use(express.static('public'));
io.on('connection', (socket) => {
    clients[socket.id] = socket;
    socket.on("serverDebug", (message) => {
        console.log("-----\nClient Debug:\n"+message+"\n-----");
    });

    socket.on("requestPlayerData", (username, ackCallback) => {
        const newPlayer = new Player(username, socket.id, !hasFirstPlayerJoined);
        newPlayer.topUpCards();
        newPlayer.czar = !hasFirstPlayerJoined;
        game.addPlayer(newPlayer);
        // Process request and prepare the response
        const responseData = {
            rawPlayerInfo: newPlayer,
        };
        // Use the callback function to send the response back to the client
        ackCallback(responseData);
    })


    socket.on("update-self", (username, ackCallback) => {
        console.log(game.playerLibrary[socket.id].name + " has been updated, czar: " + game.playerLibrary[socket.id].czar);
        const responseData = {
            rawPlayerInfo: game.playerLibrary[socket.id]
        };
        ackCallback(responseData);
    })


    socket.on("begin-game", () => {
        game.setGamePhase("submitting")
    });


    socket.on("submit-cards", (payload, ackCallback) => {
        console.log("Submission received from " + payload.username + " at index " + payload.submissionIndex +" :");
        submissionCount++;
        cardSubmissions.push(new WhiteCard(payload.submission, payload.submissionPack));
        const submittingPlayer = game.playerLibrary[payload.id];
        submittingPlayer.hand.splice(payload.submissionIndex, 1);
        submittingPlayer.topUpCards(game.deck);
        const responseData = {
            rawPlayerInfo: submittingPlayer
        };
        ackCallback(responseData)
        let showContent = submissionCount >= game.players.length-1;
        if(showContent){
            game.setGamePhase("judging");
        }
        let data = {
            submissions: cardSubmissions,
            showContent: showContent
        }
        io.emit("pushSubmittedCards", data);
    });
    
    socket.on('disconnect', () => {
        let playerIndex;
        game.players.forEach(player => {
            if(player.name === game.playerLibrary[socket.id].name) {
                playerIndex = game.players.indexOf(player)
            }
        });
        game.players.splice(playerIndex, 1);
        delete game.playerLibrary[socket.id];
        delete clients[socket.id];
        console.log("A user has disconnected: " + socket.id);
        updateClientPlayerLists();
    });

    console.log('A user connected:', socket.id);
});
// Additional event listeners for game actions...

server.listen(3000, () => {
    console.log('listening on *:3000');
});


const rawBuiltin = require('./Packs/builtinPack.json');
const rawAutism = require('./Packs/autismPack.json');
const rawWoke = require('./Packs/wokePack.json');
const rawDutch = require('./Packs/dutchPack.json');
const rawStem = require('./Packs/stemPack.json');
const rawUwU = require('./Packs/uwuPack.json');
const allWhiteCards = {
    "builtin": rawBuiltin.whiteCards,
    "autism": rawAutism.whiteCards,
    "woke": rawWoke.whiteCards,
    "dutch": rawDutch.whiteCards,
    "stem": rawStem.whiteCards,
    "uwu": rawUwU.whiteCards,
};
const allBlackCards = {
    "builtin": rawBuiltin.blackCards,
    "autism": rawAutism.blackCards,
    "woke": rawWoke.blackCards,
    "dutch": rawDutch.blackCards,
    "stem": rawStem.blackCards,
    "uwu": rawUwU.blackCards,
};

class Deck {
    constructor(...selectedPacks) {
        this.whiteDeck = [];
        this.blackDeck = [];
        this.whiteDiscrard = [];
        this.blackDiscard = [];

        selectedPacks.forEach(pack => {
            allWhiteCards[pack].forEach(white => {
                this.whiteDeck.push(new WhiteCard(white, pack));
            });
            allBlackCards[pack].forEach(black => {
                this.blackDeck.push(new BlackCard(black["text"], black["blanks"], pack))
            });
        });
    }

    drawWhite(){
        let index = getRandom(0, this.whiteDeck.length);
        let card = this.whiteDeck[index];
        this.whiteDiscrard.push(card)
        this.whiteDeck.splice(index, 1);
        return(card);
    }

    drawBlack(){
        let index = getRandom(0, this.blackDeck.length);
        let card = this.blackDeck[index];
        this.blackDiscard.push(card)
        this.blackDeck.splice(index, 1);
        return(card);
    }
}



class WhiteCard {
    constructor(text, pack) {
        this.text = text;
        this.pack = pack;
    }

    toString() {
        return this.text;
    }
}

class BlackCard {
    constructor(text, blanks, pack) {
        this.text = text;
        this.blanks = blanks;
        this.pack = pack
    }

    toString() {
        return this.text;
    }
}

class Player {
    constructor(username, id, admin) {
        this.name = username;
        this.id = id;
        this.score = 0;
        this.hand = [];
        this.czar = false;
        this.admin = admin
    }


    topUpCards(deck) {
        while(this.hand.length < 7) {
            this.hand.push(game.deck.drawWhite());
        }
    }
}

class Game {
    constructor(deck) {
        this.deck = deck;
        this.players = [];
        this.playerLibrary = {};
        this.czarIndex = 0;
        this.czar = 0;
        this.currentBlackCard = 0;
        this.phase = 'waiting'; // Example phases: waiting, submitting, judging, results

    }

    addPlayer(player) {
        this.players.push(player);
        this.playerLibrary[player.id] = player;
        player.topUpCards(this.deck);
        updateClientPlayerLists();
        hasFirstPlayerJoined = true;
    }

    setGamePhase(phase) {
        switch(phase){
            case "submitting":
                this.phase = "submitting"
                this.startSubmissionPhase()
                return;
            case "judging":
                this.phase = "judging"

                return;
            case "displaying":
                this.phase = "displaying"
                return;
        }
    }

    selectNextCzar() {
        this.players.forEach(player => {
            player.czar = false;
        });

        if(!hasFirstTurnStarted){
            this.czarIndex = 0;
            this.czar = this.players[0];
        } else {
            this.czarIndex = (this.czarIndex + 1) % this.players.length;
            this.czar = this.players[this.czarIndex]
        }
        this.czar.czar = true;
    }

    startSubmissionPhase() {
        this.currentBlackCard = this.deck.drawBlack();
        game.selectNextCzar();
        hasFirstTurnStarted = true;
        submissionCount = 0;
        cardSubmissions = [];
        io.emit("start-turn", (this));
    }

    startJudgingPhase() {

        io.emit("start-judging", (this));
    }
}

const gameDeck = new Deck("builtin", "uwu", "woke", "dutch", "autism", "stem");
//const gameDeck = new Deck("stem", "dutch", "ap");
const game = new Game(gameDeck);
function getRandom(min, max) { //shortcut function to make my life easier
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function updateClientPlayerLists(){
    let playerInfo = game.players
    io.emit("updatePlayerList", (playerInfo));
}


module.exports = { Deck, WhiteCard, BlackCard }; // Exporting the classes for use in other files

