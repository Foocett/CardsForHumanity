const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/main.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
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
    constructor(username, address) {
        this.name = username;
        this.address = address;
        this.score = 0;
        this.hand = [];
        this.czar = false;
    }
    
    setCzar(state){
        this.czar = state;
    }

    topUpCards(){
        while(this.hand.length < 7){
            this.hand.push(gameDeck.drawWhite());
        }
    }
}

class Game {
    #currentCzar = 0;
    #playerCount = 0;
    constructor() {
        this.deck = new Deck();
        this.players = [];

        this.players.forEach(player =>{
            player.topUpCards();
        })
    }

    startTurn() {
        this.players.forEach(player =>{
            player.topUpCards();
        })
        this.updatePlayerCount();
        this.setCzar();
    }

    setCzar(){
        if(this.#currentCzar < this.#playerCount-1){
            this.#currentCzar++;
        } else {
            this.#currentCzar = 0;
        }
        this.players.forEach(player => {
            player.setCzar(false);
        })
        this.players[this.#currentCzar].setCzar(true);
    }
    
    updatePlayerCount(){
        this.#playerCount = this.players.length;
    }
    
    addPlayer(player) {
        this.players.push(player);
    }

    distributeCards(){
        let cardIndex;
        this.players.forEach(player =>{
            while(player.hand.length < 7){
                cardIndex = getRandom(0, Deck.whiteDeck.length);
            }
        })
    }
}

function getRandom(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}


const gameDeck = new Deck("builtin", "uwu", "woke");


module.exports = { Deck, WhiteCard, BlackCard }; // Exporting the classes for use in other files
