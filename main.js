const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/main.html');
});
app.use(express.static('public'));

io.on('connection', (socket) => {

    socket.on('registerUser', (data) => {
        console.log('Registering user:', data.username);
        const newPlayer = new Player(data.username, socket.id);
        game.addPlayer(newPlayer);

        // You might want to emit back some confirmation or game state
        socket.emit('userRegistered', { success: true });
        // Or broadcast/update all clients with the new player list or game state as needed
    });

    console.log('A user connected:', socket.id);
    let ip = socket.handshake.address;
    const newPlayer = new Player("User-" + game.players.length, socket.id);
    game.addPlayer(newPlayer);
    // Send the initial game state and player's hand to the connected player
    socket.emit('gameState', {game});
    socket.emit('initialHand', newPlayer.hand.map(card => card.toString()));



    // Listen for player actions, e.g., submitting cards
    socket.on('submitCards', (cardIds) => {
        // Handle card submission
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        game.removePlayer(socket.id); // You'll need to adjust your game logic to support this
        // Notify all players about the disconnection
        io.emit('playerDisconnected', { playerId: socket.id });
    });

    // Additional event listeners for game actions...
});

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
    "uwu": rawUwU.whiteCards
};
const allBlackCards = {
    "builtin": rawBuiltin.blackCards,
    "autism": rawAutism.blackCards,
    "woke": rawWoke.blackCards,
    "dutch": rawDutch.blackCards,
    "stem": rawStem.blackCards,
    "uwu": rawUwU.blackCards
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
    constructor(username, id) {
        this.name = username;
        this.id = id;
        this.score = 0;
        this.hand = [];
        this.czar = false;
        console.log(this);
    }

    setCzar(state) {
        this.czar = state;
    }

    topUpCards(deck) {
        while (this.hand.length < 7) {
            this.hand.push(deck.drawWhite());
        }
    }

    submitCards(cardIndices) {
        // Ensure the submitted card indices are valid
        if (cardIndices.length !== game.currentBlackCard.blanks) {
            throw new Error("Incorrect number of cards submitted.");
        }

        let submittedCards = cardIndices.map(index => {
            if (index < 0 || index >= this.hand.length) {
                throw new Error("Invalid card index.");
            }
            return this.hand.splice(index, 1)[0]; // Remove the card from the hand
        });

        // Further logic to handle the submission can go here
    }



    toString() {
        return `Name: ${this.name}\nIP: ${this.address}`;
    }
}

class Game {
    constructor(deck) {
        this.deck = deck;
        this.players = [];
        this.currentCzarIndex = 0;
        this.gamePhase = 'waiting'; // Example phases: waiting, submitting, judging, results
    }

    addPlayer(player) {
        this.players.push(player);
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


function getRandom(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

const gameDeck = new Deck("builtin", "uwu", "woke");
const game = new Game(gameDeck);

module.exports = { Deck, WhiteCard, BlackCard }; // Exporting the classes for use in other files
