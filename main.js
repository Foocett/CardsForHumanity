const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let clients = {};
app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/main.html');
});

app.use(express.static('public'));
io.on('connection', (socket) => {
    clients[socket.id] = socket;

    socket.on("serverDebug", (message) => {
        console.log("-----\nClient Debug:\n"+message+"\n-----");
    });

    socket.on("requestPlayerData", (username, ackCallback) => {
        const newPlayer = new Player(username, socket.id);
        newPlayer.topUpCards();
        game.addPlayer(newPlayer);
        // Process request and prepare the response
        const responseData = {
            rawPlayerInfo: newPlayer,
        };
        // Use the callback function to send the response back to the client
        ackCallback(responseData);
    })

    socket.on("submit-cards", (payload, ackCallback) => {
        console.log("Submission received from " + payload.username + " at index " + payload.submissionIndex +" :");
        console.log(payload.submission)
        const submittingPlayer = game.playerLibrary[payload.id];
        console.log(submittingPlayer.hand);
        submittingPlayer.hand.splice(payload.submissionIndex);
        submittingPlayer.topUpCards(game.deck);
        console.log(submittingPlayer.hand)
        const responseData = {
            rawPlayerInfo: submittingPlayer
        };
        ackCallback(responseData)
    });
    
    socket.on('disconnect', () => {
        delete clients[socket.id]; // Remove socket when client disconnects
        let playerIndex;
        game.players.forEach(player => {
            if(player.name === game.playerLibrary[socket.id].name) {
                playerIndex = game.players.indexOf(player)
            }
        });
        game.players.splice(playerIndex);
        delete game.playerLibrary[socket.id];
        console.log("A user has disconnected: " + socket.id);
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
const rawAP = require("./Packs/apPack.json")

const allWhiteCards = {
    "builtin": rawBuiltin.whiteCards,
    "autism": rawAutism.whiteCards,
    "woke": rawWoke.whiteCards,
    "dutch": rawDutch.whiteCards,
    "stem": rawStem.whiteCards,
    "uwu": rawUwU.whiteCards,
    "familyFriendly": rawAP.whiteCards
};
const allBlackCards = {
    "builtin": rawBuiltin.blackCards,
    "autism": rawAutism.blackCards,
    "woke": rawWoke.blackCards,
    "dutch": rawDutch.blackCards,
    "stem": rawStem.blackCards,
    "uwu": rawUwU.blackCards,
    "ap": rawAP.blackCards
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
            allBlackCards[pack].forEach(black =>{
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
        let card = this.whiteDeck[index];
        this.blackDiscard.push(card)
        this.blackDeck.push(index);
        return(card);
    }
}



class WhiteCard {
    constructor(text, pack) {
        this.text = text;
        this.pack = pack;
        this.owner;
    }

    setOwner(player){
        this.owner = player;
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
    constructor(username, id) {
        this.name = username;
        this.id = id;
        this.score = 0;
        this.hand = [];
        this.czar = false;
    }

    setCzar(state) {
        this.czar = state;
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
        this.playerLibrary = {}
        this.currentCzarIndex = 0;
        this.gamePhase = 'waiting'; // Example phases: waiting, submitting, judging, results
    }

    addPlayer(player) {
        this.players.push(player);
        this.playerLibrary[player.id] = player;
        player.topUpCards(this.deck);
    }

    removePlayer(playerId) {
        // Assuming playerId is something you can use to uniquely identify players (e.g., socket.id)
        this.players = this.players.filter(player => player.id !== playerId);
        // Handle the case where the game might need to pause or adjust because of the player count change
    }

    startGame() {
        this.gamePhase = 'submitting';
        this.players.forEach(player => player.topUpCards(this.deck));
        this.selectNextCzar();
    }

    selectNextCzar() {
        this.currentCzarIndex = (this.currentCzarIndex + 1) % this.players.length;
        this.players.forEach((player, index) => player.setCzar(index === this.currentCzarIndex));
    }

    startTurn() {
        this.currentBlackCard = this.deck.drawBlack();
        this.gamePhase = 'submitting';
        this.players.forEach(player => {
            player.topUpCards(this.deck);
            player.submittedCards = []; // Reset submitted cards for the new round
        });
        this.selectNextCzar();
        // Notify players about the new black card and that a new turn has started
    }
    // Additional methods to handle submissions, judging, and scoring...
}

const gameDeck = new Deck("builtin", "uwu", "woke");
const game = new Game(gameDeck);

function getRandom(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

module.exports = { Deck, WhiteCard, BlackCard }; // Exporting the classes for use in other files

