//Global thingies
let clients = {}; //keeps track of connected socket objects
let cardSubmissions = []; //holds received cards
let submissionCount = 0; //counts card submissions
let hasFirstPlayerJoined = false; //used to determining czar/admin
let hasFirstTurnStarted = false; //used to maintain properties between waiting phase and first turn
let displayTime = 5; //time for cards to be displayed after czar makes a selection (in seconds)

//import pack files
const rawBuiltin = require('./Packs/builtinPack.json'); //builtin pack
const rawAutism = require('./Packs/autismPack.json'); //autism pack (based)
const rawWoke = require('./Packs/wokePack.json'); //woke pack
const rawDutch = require('./Packs/dutchPack.json'); //dutch pack
const rawStem = require('./Packs/stemPack.json'); //STEM pack
const rawBrainrot = require('./Packs/brainrotPack.json'); //Brainrot pack
const rawFestival = require('./Packs/festivalPack.json'); //festival pack
const allWhiteCards = { //store white card components for all packs
    "builtin": rawBuiltin.whiteCards,
    "autism": rawAutism.whiteCards,
    "woke": rawWoke.whiteCards,
    "dutch": rawDutch.whiteCards,
    "stem": rawStem.whiteCards,
    "brainrot": rawBrainrot.whiteCards,
    "festival": rawFestival.whiteCards
};
const allBlackCards = { //store black card components for all packs
    "builtin": rawBuiltin.blackCards,
    "autism": rawAutism.blackCards,
    "woke": rawWoke.blackCards,
    "dutch": rawDutch.blackCards,
    "stem": rawStem.blackCards,
    "brainrot": rawBrainrot.blackCards,
    "festival": rawFestival.blackCards
};

//Create server
// This section was sourced from the official Socket.IO documentation (https://socket.io/docs/v4/server-api/)
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/client.html');
});
app.use(express.static('public'));


//handle client events
io.on('connection', (socket) => {
    clients[socket.id] = socket; //add new connection to client list
    socket.on("requestPlayerData", (username, ackCallback) => { //create and return new player object from new client username
        const newPlayer = new Player(username, socket.id, !hasFirstPlayerJoined); //create player object
        newPlayer.topUpCards(); //populate player hand
        newPlayer.czar = !hasFirstPlayerJoined; //if client is first player, make czar for first round
        game.addPlayer(newPlayer); //add player object to game.players
        const responseData = { //data to be returned to player (formatted as object for possible future features)
            rawPlayerInfo: newPlayer
        };
        ackCallback(responseData); //returns new player object to client
    });


    socket.on("update-self", (username, ackCallback) => { //returns corresponding player object to client
        const responseData = { //data to be returned to player
            rawPlayerInfo: game.playerLibrary[socket.id] //gets player based on client socket id
        };
        ackCallback(responseData); //returns player data to requesting client
    })


    socket.on("begin-game", () => {
        game.setGamePhase("submitting") //begins game
    });

    socket.on("submit-cards", (payload, ackCallback) => { //handles client card submission
        submissionCount++; //add to total submitted count
        let newCard = new WhiteCard(payload.submission, payload.submissionPack)
        newCard.setOwner(game.playerLibrary[socket.id]);
        cardSubmissions.push(newCard); //creates card object from client data
        const submittingPlayer = game.playerLibrary[payload.id]; //gets corresponding player for submitting client
        if(!submittingPlayer.czar) {
            submittingPlayer.hand.splice(payload.submissionIndex, 1); //removes submitted card from player hand
            submittingPlayer.topUpCards(game.deck); //repopulates player hand
        }
        const responseData = { //data to be returned to player
            rawPlayerInfo: submittingPlayer
        };
        ackCallback(responseData) //returns data to player
        let showContent = submissionCount >= game.players.length - 1; //determines if all cards have been submitted
        if (showContent) {
            game.setGamePhase("judging"); //if all cards received, set phase to judging
        }
        let displaying = submittingPlayer.czar;
        let text = payload.submission
        let winningIndex;
        if(displaying) {
            text = cardSubmissions[payload.submissionIndex].text;

            for(let i = 0; i<cardSubmissions.length;i++) {
                if(cardSubmissions[i].text === text) {
                    cardSubmissions[i].owner.score++;
                    cardSubmissions[i].owner.justWon = true;
                    winningIndex = i;
                    updateClientPlayerLists();
                    game.setGamePhase("displaying")
                }
            }
        }
        let data = { //card display information
            submissions: cardSubmissions,
            showContent: showContent,
            displaying: displaying,
            cardText: text,
            winningIndex: winningIndex
        }
        io.emit("pushSubmittedCards", data); //sends all submitted cards to all players
    });
    
    socket.on('disconnect', () => { //on player disconnect
        let playerIndex;
        game.players.forEach(player => { //for each player
            if(player.name === game.playerLibrary[socket.id].name) { //if name matches DC-ing socket's associated name...
                playerIndex = game.players.indexOf(player) //get index of removed player
            }
        });
        game.players.splice(playerIndex, 1); //remove player from game list
        delete game.playerLibrary[socket.id]; //remove player from game library
        delete clients[socket.id]; //remove player from global clients library
        console.log("A user has disconnected: " + socket.id);
        updateClientPlayerLists(); //push changes to all clients
    });
    console.log('A user connected:', socket.id); //display when socket connection is made
});

class Deck { //deck object
    constructor(...selectedPacks) { //given all inputted packs
        this.whiteDeck = []; //all white card objects
        this.blackDeck = []; //all black card objects
        this.whiteDiscrard = []; //used white cards
        this.blackDiscard = []; //used black cards

        selectedPacks.forEach(pack => { //for each selected pack
            allWhiteCards[pack].forEach(white => { //for white text component
                this.whiteDeck.push(new WhiteCard(white, pack)); //create new white card objects
            });
            allBlackCards[pack].forEach(black => { //for each black card object
                this.blackDeck.push(new BlackCard(black["text"], black["blanks"], pack)) //create new black card object
            });
        });
    }

    drawWhite(){
        let index = getRandom(0, this.whiteDeck.length); //random index in white card list
        let card = this.whiteDeck[index]; //get card corresponding to random index
        this.whiteDiscrard.push(card) //add card to discarded list
        this.whiteDeck.splice(index, 1); //remove card from game list
        return(card); //return selected card object
    }

    drawBlack(){
        let index = getRandom(0, this.blackDeck.length); //random index in black card list
        let card = this.blackDeck[index]; //get card corresponding to random index
        this.blackDiscard.push(card) //add card to discarded list
        this.blackDeck.splice(index, 1); //remove card from game list
        return(card); //return selected card object
    }
}



class WhiteCard { //white card object
    constructor(text, pack) {
        this.text = text;
        this.pack = pack;
    }

    setOwner(player){
        this.owner = player;
    }
    toString() {
        return this.text;
    }
}

class BlackCard { //black card object
    constructor(text, blanks, pack) {
        this.text = text;
        this.blanks = blanks;
        this.pack = pack
    }

    toString() {
        return this.text;
    }
}

class Player { //player object
    constructor(username, id, admin) {
        this.name = username; //inputted player username
        this.id = id; //player socket id
        this.score = 0; //player score
        this.hand = []; //populated on player creation
        this.czar = false; //false by default, possibly changed on player creation
        this.admin = admin //grants power to "use start game"
        this.justWon = false;
    }


    topUpCards() {
        while(this.hand.length < 7) { //draw white cards until hand length equals seven
            this.hand.push(game.deck.drawWhite());
        }
    }
}

class Game {
    constructor(deck) { //game object (created when file is ran)
        this.deck = deck; //deck object
        this.players = []; //list of player objects for easier access
        this.playerLibrary = {}; //library of players indexed by socket id
        this.czarIndex = 0; //position in the players list of the current czar
        this.czar = 0; //current card czar; will later be set to a player object
        this.currentBlackCard = 0; //current black card; will later be set to black card object
    }

    addPlayer(player) { //adds and updates given player object
        this.players.push(player); //push player object to game array
        this.playerLibrary[player.id] = player; //add to player library as socket id
        player.topUpCards(this.deck); //top up player cards
        updateClientPlayerLists(); //signals to all clients to update player list
        hasFirstPlayerJoined = true; //used to determine first player to join (admin/first czar)
    }

    setGamePhase(phase) { //runs code based on given game phase
        switch(phase){
            case "submitting":
                this.startSubmissionPhase()
                return;
            case "judging":
                this.startJudgingPhase()
                return;
            case "displaying":
                this.startDisplayCount();
                return;
        }
    }

    selectNextCzar() { //selects next card czar
        this.players.forEach(player => { //remove czar status from all players
            player.czar = false;
        });

        if(!hasFirstTurnStarted){ //for first round, do not iterate to second player
            this.czarIndex = 0;
            this.czar = this.players[0];
        } else { //for all other rounds, iterate to next player in list
            this.czarIndex = (this.czarIndex + 1) % this.players.length; //iterate czar index, jump to zero if at end of list
            this.czar = this.players[this.czarIndex] //set game.czar to new czar player object
        }
        this.czar.czar = true; //set player.czar to true for selected player
    }

    startSubmissionPhase() {
        this.currentBlackCard = this.deck.drawBlack(); //draw new black card
        game.players.forEach(player => {
            player.justWon = false;
        });
        game.selectNextCzar(); //assign new card czar
        hasFirstTurnStarted = true; //checks if this is the first turn
        submissionCount = 0; //reset submission count
        cardSubmissions = []; //reset submission list
        updateClientPlayerLists();
        io.emit("start-turn", (this)); //send current game state to all connected clients
    }

    startJudgingPhase() {
    }

    startDisplayCount() {
        setTimeout(function() {
            game.setGamePhase("submitting")
        }, (displayTime*1000))
    }

}
function getRandom(min, max) { //shortcut function to make my life easier
    //currently I only use this for drawing cards, but I might use it for something else after
    const minCeiled = Math.ceil(min); //ceil min value
    const maxFloored = Math.floor(max); //floor max value
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); //calculate and floor random number
}

function updateClientPlayerLists(){
    io.emit("updatePlayerList", (game.players)); //send player list to all clients
}

const gameDeck = new Deck("builtin", "brainrot", "woke", "dutch", "autism", "stem", "festival"); //create game deck with all packs
//const gameDeck = new Deck("stem", "dutch", "ap"); //create deck with family friendly content
const game = new Game(gameDeck); //create game object using newly created deck object
server.listen(3000, () => { //listen for client connections and interactions @ port 3000
    console.log('listening on *:3000');
});
module.exports = { Deck, WhiteCard, BlackCard }; // Exporting the classes for use in other files

