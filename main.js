const { readdir } = require('node:fs/promises');
let folderData = [];
let packs = [];
let packNames = [];
async function getPacks() {
    try {
        const files = await readdir("./Packs");
        for (const file of files)
            folderData.push(require("./Packs/" + file.slice(0,file.length-5)))
    } catch (err) {
        console.error(err);
    }
}
getPacks().then(() => {
    folderData.forEach(obj => {
        packs[obj["packName"]] = obj;
        packNames.push(obj["packName"]);
    })
});


//Global thingies
let clients = {}; //keeps track of connected socket objects
let clientIDs = [];
let cardSubmissions = []; //holds received cards
let submissionCount = 0; //counts card submissions
let hasFirstPlayerJoined = false; //used to determining czar/admin
let hasFirstTurnStarted = false; //used to maintain properties between waiting phase and first turn
let displayTime = 5; //time for cards to be displayed after czar makes a selection (in seconds)
//import pack files
const config = require("./config.json");

//Create server
// This section was sourced from the official Socket.IO documentation (https://socket.io/docs/v4/server-api/)
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
io.disconnectSockets()
app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/client.html');
});
app.use(express.static('public'));


//handle client events
io.on('connection', (socket) => {
    const ipAddress = socket.handshake.address;
    if(!game.bannedIPs.includes(ipAddress)) {
        clients[socket.id] = socket; //add new connection to client list
        socket.on("requestPlayerData", (username, ackCallback) => { //create and return new player object from new client username
            if(!game.usedUsernames.includes(username.toLowerCase())) {
                const newPlayer = new Player(username, socket.id, !hasFirstPlayerJoined, ipAddress); //create player object
                console.log('A user connected:', username); //display when socket connection is made
                clientIDs.push(socket.id)
                newPlayer.czar = !hasFirstPlayerJoined; //if client is first player, make czar for first round
                game.addPlayer(newPlayer); //add player object to game.players
                const responseData = { //data to be returned to player (formatted as object for possible future features)
                    rawPlayerInfo: newPlayer,
                    gameStarted: hasFirstTurnStarted,
                    packNames: packNames,
                };
                ackCallback(responseData); //returns new player object to client
            } else {
                ackCallback(false);
            }
        });
    } else {
        socket.emit("deactivatePageKicked")
    }

    socket.on('pack-selection', (data) => {
        io.emit('update-packs', data);
    });

    socket.on('chat message', (msg) => {
        let payload = {
            msg: msg,
            user: game.playerLibrary[socket.id].name
        }
        io.emit('chat message', payload);
    });

    socket.on("update-self", (username, ackCallback) => { //returns corresponding player object to client
        const responseData = { //data to be returned to player
            rawPlayerInfo: game.playerLibrary[socket.id] //gets player based on client socket id
        };
        ackCallback(responseData); //returns player data to requesting client
    });

    socket.on("verifyAdminPassword", (input, ackCallback) => { //returns corresponding player object to client
        ackCallback(input === config.adminPassword);
    });

    socket.on("nukeGame", () => {
        Admin.nukeGame();
    });

    socket.on("setScore", (packet) => {
        Admin.setPlayerScore(packet.player, packet.val);
    });

    socket.on("kickPlayer", (player) => {
        Admin.kickPlayer(player);
    });

    socket.on("forceNextTurn", () => {
        Admin.forceNextTurn();
    });

    socket.on("dumpHand", (player) => {
        Admin.dumpHand(player);
    });

    socket.on("warnPlayers", (packet) => {
        Admin.warnPlayers(packet.players, packet.warningMessage);
    });

    socket.on("warnLobby", (warningMessage) => {
        Admin.warnLobby(warningMessage)
    });

    socket.on("increase-wager", (payload, ackCallback) => {
        let player = game.playerLibrary[socket.id];
        if(player.score > 1 && player.wager < player.score) {
            player.wager++;
        }
        ackCallback(player.wager)
    });

    socket.on("decrease-wager", (payload, ackCallback) => {
        let player = game.playerLibrary[socket.id];
        if(player.score > 1 && player.wager > 1 ) {
            player.wager--;
        }
        ackCallback(player.wager)
    });

    socket.on("begin-game", (packStates) => {
        let enabledPacks = [];
        let i = 0
        packStates.forEach(item => {
           if(item.checked){
               enabledPacks.push(packNames[i])
               i++
           }
        });
        game.deck = new Deck(enabledPacks)
        io.emit("hide-waiting-overlay");
        game.setGamePhase("submitting"); //begins game
    });

    socket.on("submit-cards", (payload, ackCallback) => { //handles client card submission
        submissionCount++; //add to total submitted count
        let newCard = new WhiteCard(payload.submission, payload.submissionPack);
        newCard.setOwner(game.playerLibrary[socket.id]);
        cardSubmissions.push(newCard); //creates card object from client data
        const submittingPlayer = game.playerLibrary[payload.id]; //gets corresponding player for submitting client
        if(submittingPlayer !== null && !submittingPlayer.czar) {
            submittingPlayer.hand.splice(payload.submissionIndex, 1); //removes submitted card from player hand
            submittingPlayer.topUpCards(game.deck); //repopulates player hand
        }
        const responseData = { //data to be returned to player
            rawPlayerInfo: submittingPlayer
        };
        ackCallback(responseData); //returns data to player
        let showContent = submissionCount >= game.players.length - 1; //determines if all cards have been submitted
        if (showContent) {
            game.setGamePhase("judging"); //if all cards received, set phase to judging
        }
        let displaying;
        if(submittingPlayer) {
            displaying = submittingPlayer.czar;
        }
        let text = payload.submission;
        let winningIndex;
        if(displaying) {
            text = cardSubmissions[payload.submissionIndex].text;

            for(let i = 0; i<cardSubmissions.length;i++) {
                if(cardSubmissions[i].text === text) {
                    cardSubmissions[i].owner.score+=cardSubmissions[i].owner.wager;
                    cardSubmissions[i].owner.justWon = true;
                    winningIndex = i;
                    game.setGamePhase("displaying");
                    let payload = {
                        msg: (cardSubmissions[i].owner.name + " has won the round and their score is now " + cardSubmissions[i].owner.score),
                        user: "System"
                    }
                    io.emit('chat message', payload);
                } else if(!cardSubmissions[i].owner.czar){
                    cardSubmissions[i].owner.score -= (cardSubmissions[i].owner.wager -1);
                }
            }
            updateClientPlayerLists();
        }
        let data = { //card display information
            submissions: cardSubmissions,
            showContent: showContent,
            displaying: displaying,
            cardText: text,
            winningIndex: winningIndex
        };
        io.emit("pushSubmittedCards", data); //sends all submitted cards to all players
    });

    socket.on('disconnect', () => { //on player disconnect
        let playerIndex;
        if(clientIDs.includes(socket.id)) {
            game.players.forEach(player => { //for each player
                if (game.playerLibrary[socket.id] != null) {
                    if (player.name === game.playerLibrary[socket.id].name) { //if name matches DC-ing socket's associated name...
                        playerIndex = game.players.indexOf(player); //get index of removed player
                    }
                }
            });
            console.log("A user has disconnected: " + game.playerLibrary[socket.id].name);
            game.players.splice(playerIndex, 1); //remove player from game list
            game.usedUsernames.splice(playerIndex, 1);
            if(game.playerLibrary[socket.id].czar) { //starts next turn if card czar leaves
                Admin.forceNextTurn(); //technically an issue could arise if player has already submitted however an admin can just start turn manually
            }
            delete game.playerLibrary[socket.id]; //remove player from game library
            delete clients[socket.id]; //remove player from global clients library
            updateClientPlayerLists(); //push changes to all clients
            if(game.playerLibrary.length === undefined) {
                hasFirstPlayerJoined = false;
            }
        }
    });
});

/*
 * FIXME: - Weird crash when players leave caused by drawBlack() somehow, most likely drawing null from deck (still broken)
 */
class Deck { //deck object
    constructor(selectedPacks) { //given all inputted packs
        this.whiteDeck = []; //all white card objects
        this.blackDeck = []; //all black card objects
        this.whiteDiscard = []; //used white cards
        this.blackDiscard = []; //used black cards

        selectedPacks.forEach(pack => { //for each selected pack
            let curPack = packs[pack]
            curPack["whiteCards"].forEach(white => { //for white text component
                this.whiteDeck.push(new WhiteCard(white, pack)); //create new white card objects
            });
            curPack["blackCards"].forEach(black => { //for each black card object
                this.blackDeck.push(new BlackCard(black["text"], pack)); //create new black card object
            });
        });
    }

    drawWhite(){
        let index = getRandom(0, this.whiteDeck.length); //random index in white card list
        let card = this.whiteDeck[index]; //get card corresponding to random index
        this.whiteDiscard.push(card); //add card to discarded list
        this.whiteDeck.splice(index, 1); //remove card from game list
        return(card); //return selected card object
    }

    drawBlack(){
        let index = getRandom(0, this.blackDeck.length); //random index in black card list
        let card = this.blackDeck[index]; //get card corresponding to random index
        this.blackDiscard.push(card); //add card to discarded list
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
    constructor(text, pack) {
        this.text = text;
        this.pack = pack;
    }

    toString() {
        return this.text;
    }
}

class Player { //player object
    constructor(username, id, admin, ip) {
        this.name = username; //inputted player username
        this.id = id; //player socket id
        this.score = 0; //player score
        this.hand = []; //populated on player creation
        this.czar = false; //false by default, possibly changed on player creation
        this.admin = admin; //grants power to "use start game"
        this.justWon = false;
        this.wager = 1;
        this.ip = ip;
    }


    topUpCards() {
        while(this.hand.length < 10) { //draw white cards until hand length equals seven
            this.hand.push(game.deck.drawWhite());
        }
        io.emit('update-hand', (this.hand))
    }
}

class Game {
    constructor() { //game object (created when file is ran)
        this.deck = []; //deck object
        this.players = []; //list of player objects for easier access
        this.usedUsernames = []; //list of usernames for easy access
        this.playerLibrary = {}; //library of players indexed by socket id
        this.czarIndex = 0; //position in the players list of the current czar
        this.czar = 0; //current card czar; will later be set to a player object
        this.currentBlackCard = 0; //current black card; will later be set to black card object
        this.bannedIPs = [];
    }

    addPlayer(player) { //adds and updates given player object
        this.players.push(player); //push player object to game array
        this.playerLibrary[player.id] = player; //add to player library as socket id
        this.usedUsernames.push(player.name.toLowerCase());
        updateClientPlayerLists(); //signals to all clients to update player list
        hasFirstPlayerJoined = true; //used to determine first player to join (admin/first czar)
    }

    setGamePhase(phase) { //runs code based on given game phase
        switch(phase){
            case "submitting":
                this.startSubmissionPhase();
                let payload = {
                    msg: ("The new Card Czar is " + game.czar.name + ", good luck!"),
                    user: "System"
                }
                io.emit("chat message", payload);
                return;
            case "judging":
                this.startJudgingPhase();
                return;
            case "displaying":
                this.startDisplayCount();
                return;
        }
    }

    /*
     * FIXME: - Sometimes next czar is selected when player joins I have no idea why lmao
     */
    selectNextCzar() { //selects next card czar
        this.players.forEach(player => { //remove czar status from all players
            player.czar = false;
        });

        if(!hasFirstTurnStarted){ //for first round, do not iterate to second player
            this.czarIndex = 0;
            this.czar = this.players[0];
        } else { //for all other rounds, iterate to next player in list
            this.czarIndex = (this.czarIndex + 1) % this.players.length; //iterate czar index, jump to zero if at end of list
            this.czar = this.players[this.czarIndex]; //set game.czar to new czar player object
        }
        if(this.czar != null) {
            this.czar.czar = true; //set player.czar to true for selected player
        } else {
            Admin.nukeGame();
        }
    }

    startSubmissionPhase() {
        game.resetPlayerWagers();
        if(this.deck) {
            this.currentBlackCard = this.deck.drawBlack(); //draw new black card
        }
        game.players.forEach(player => {
            player.justWon = false;
            player.topUpCards();
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
            game.setGamePhase("submitting");
        }, (displayTime*1000));
    }

    resetPlayerWagers() {
        io.emit("reset-wager");
        this.players.forEach(player => {
            player.wager = 1;
        });
    }
}

class Admin { //Static commands that can be run from the admin console
    static nukeGame(){ //completely resets game
        console.log("Game Nuked")
        io.emit("deactivatePage");
        io.disconnectSockets();
        clients = {}; //keeps track of connected socket objects
        cardSubmissions = []; //holds received cards
        submissionCount = 0; //counts card submissions
        hasFirstPlayerJoined = false; //used to determining czar/admin
        hasFirstTurnStarted = false; //used to maintain properties between waiting phase and first turn
        delete game.deck;
        game = new Game();
    }

    static setPlayerScore(player, val) { //can be used to manually change a player's score
        game.players.forEach(playerObj => {
            if(playerObj.name === player && typeof(parseInt(val)) === "number"){
                playerObj.score = parseInt(val);
            }
        })
        updateClientPlayerLists();
    }

    static kickPlayer(player) {
        game.players.forEach(playerObj => {
            if(playerObj.name === player){
                io.to(playerObj.id).emit("kick")
                game.bannedIPs.push(playerObj.ip);
            }
        });
    }

    static forceNextTurn() { //throws out current round and starts new round with next czar
        game.setGamePhase("submission")
        game.startSubmissionPhase();
    }

    static dumpHand(player) {
        game.players.forEach(playerObj => {
            if(playerObj.name === player){
                playerObj.hand = [];
                playerObj.topUpCards();
                io.to(playerObj.id).emit("forceSelfUpdate");
            }
        })
    }

    static warnPlayers(players, warningMessage) {
        game.players.forEach(player => {
            if(players.includes(player.name)){
                io.to(player.id).emit("triggerAlert", warningMessage);
            }
        })
    }

    static warnLobby(warningMessage) {
        io.emit("triggerAlert", warningMessage);
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

let game = new Game(); //create game object using newly created deck object
server.listen(3000, () => { //listen for client connections and interactions @ port 3000
    console.log('listening on *:3000');
});
module.exports = {Deck, WhiteCard, BlackCard, Game, Player}; // Exporting the classes for use in other files
