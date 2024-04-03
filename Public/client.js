document.addEventListener('DOMContentLoaded', function() {
    let username = prompt("Please enter your username:"); //Prompt for username before loading page content
    while (username === null || username.trim() === "") { //check valid username
        alert("You must enter a username to continue."); //if input is invalid, prompt again
        username = prompt("Please enter your username:");
    }

    const socket = io(); // Connect to the server
    let self; //will be given value after client is initialized with server
    const handCards = document.querySelectorAll(".white-card"); //all cards in hand
    let handElementsText = []; //white card text objects
    let handElementsPack = []; //white card pack objects
    let selectedIndex; //index of selected card
    let selectedText; //text of selected card
    let selectedPack; //pack of selected card
    let submittedText; //text of submitted card
    let submittedPack; //pack of submitted card
    let hasCardBeenSelected = false; //used to prevent submission before selection
    let hasCardBeenSubmitted = false; //used to prevent multiple submissions

    //get HTML objects from document
    const startGameButton = document.getElementById("start-turn-button");
    const blackText = document.getElementById("black-card-text");
    const blackPack = document.getElementById("black-card-pack");
    const submitButton = document.getElementById("submit-button");
    const publicContainer = document.getElementById("cards-public-container")
    const playerContainer = document.getElementById("score-display-container")
    submitButton.disabled = true; //disable submit button by default

    for(let i = 1; i<=7; i++){ //get HTML objects for each card
        handElementsText.push(document.getElementById("white-card-"+i+"-text")) //text object
        handElementsPack.push(document.getElementById("white-card-"+i+"-pack")) //pack object
    }

    socket.emit('requestPlayerData', username, (response) => { //send username to server and get self player object back
        self = response.rawPlayerInfo //set self equal to returned player object
        populateCardsFromHand(self); //convert self.hand into HTML elements
        if(self.admin){ //if admin, show start game button
            startGameButton.style.display = "block";
            startGameButton.onclick = () => {
                socket.emit("begin-game"); //send begin game signal to server
                startGameButton.style.display = "none"; //hide after click
            }
        } else {
            startGameButton.style.display = "none"; //hide button
        }
    });

    socket.on("updatePlayerList", (playerInfo) => { //updates list of connected players
        updateConnectedPlayers(playerInfo)
    })


    socket.on("start-turn", (gameData) => { //on start turn command receive
        hasCardBeenSelected = false; //reset selected cards
        hasCardBeenSubmitted = false;
        handCards.forEach(card => { //remove selected class from all HTML objects
            card.classList.remove("selected-card");
            if(!self.czar) {
                card.classList.add("clickable");
            }
        })
        submittedPublicCardElements.forEach(card => {
           card.remove();
        });
        updateSelf();
        submitButton.disabled = self.czar; //if player is czar, disable submit button
        blackText.textContent = gameData.currentBlackCard.text; //set black card text
        blackPack.textContent =  getProperName(gameData.currentBlackCard.pack); //get full pack name
        updateConnectedPlayers(gameData.players); //updates connected players
    });

    socket.on("start")

    function populateCardsFromHand(self) { //update HTML cards with info in hand
        for(let i = 0; i<7;i++){ //for each of seven cards
            handElementsText[i].textContent = self.hand[i].text; //set text to card.text
            handElementsPack[i].textContent = getProperName(self.hand[i].pack); //set pack to card.pack's full name
        }
    }

    for(let i=0;i<7;i++){ //add click listeners to each card
        handCards[i].addEventListener('click', function() {
            if(this.classList.contains("clickable")){ //if the card is currently clickable...
                selectedIndex = i; //set selected card index to position in for loop
                selectedText = self.hand[i].text; //set global selected text
                selectedPack = self.hand[i].pack; //set global selected pack
                handCards.forEach(element => { //for each card element
                    element.classList.remove("selected-card"); //remove selected class from all cards
                    element.style.backgroundColor = "white"; //reset card background color
                    element.style.color = "black"; //reset card text color
                });
                // Add the selected class to the clicked card
                this.classList.add("selected-card"); //add selected card class to clicked card
                hasCardBeenSelected = true; //a card has been selected
                submitButton.disabled = false; //re-enable submit button
            }
        });
    }

    function getProperName(name){ //returns the full formatted name of a pack given an inputted shorthand
        switch(name){
            case "brainrot":
                return "Brainrot Pack";
            case "builtin":
                return "Built In Pack";
            case "woke":
                return "Woke Pack";
            case "dutch":
                return "Dutch Pack";
            case "autism":
                return "Autism Pack";
            case "stem":
                return "STEM Pack";
            case "festival":
                return "EDM Festival Pack"
        }
    }

    submitButton.onclick = () => { //on submit button click
        if(hasCardBeenSelected) { //only execute if a card is selected
            let payload = { //data to be sent to server
                username: self.name,
                submission: selectedText,
                submissionPack: selectedPack,
                submissionIndex: selectedIndex,
                id: self.id
            }
            socket.emit('submit-cards', payload, (response) => { //send cards to server
                self = response.rawPlayerInfo; //update self based on server callback
                populateCardsFromHand(self); //reset cards in hand
                submittedText = selectedText; //set global submitted text to currently selected text
                submittedPack = selectedPack; //set global submitted pack to currently selected pack
                handCards.forEach(element => { //reset all cards and make hand unclickable to prevent more submissions
                    element.classList.remove("selected-card");
                    element.classList.remove("clickable");
                    element.style.backgroundColor = "white"; // Reset background color
                    element.style.color = "black"; // Reset text color
                });
            });
            submitButton.disabled = true; //disable submit button
            hasCardBeenSubmitted = true;
        }
    };

    let submittedPublicCardElements = []; //hold submitted card HTML elements
    let submittedPublicTextElements = []; //hold submitted text HTML elements
    socket.on("pushSubmittedCards", (payload) => {
        displaySubmittedCards(payload.submissions, payload.showContent, payload.displaying, payload.winningIndex) //display all clients' submitted cards
    })
    function displaySubmittedCards(submissions, showContent, displaying, winningIndex){
        updateSelf();
        submittedPublicCardElements.forEach(card => { //remove all current elements
            card.remove();
        })
        submittedPublicTextElements.forEach(obj => { //remove all current elements
            obj.remove();
        })
        let firstCard = true; //to track which card is the first card
        let submissionsLength = submissions.length;
        if(displaying) {
            submissionsLength--;
        }
        for(let i=0; i<submissionsLength;i++){
            const submittedCard = document.createElement("div"); //create new card
            const cardText = document.createElement("p"); //create text object child
            const cardPack = document.createElement("p"); //create pack object child
            submittedCard.classList.add("white-card"); //add white card class for CSS formatting
            submittedCard.classList.add("submitted-card"); //designate card as a selected card
            cardText.classList.add("white-card-text"); //add white card text class for CSS formatting
            cardText.classList.add("submitted-card-text"); //designate card text
            cardPack.classList.add("white-card-pack"); //add white card pack class for CSS formatting
            cardText.textContent = submissions[i].text; //set card text content
            cardPack.textContent = getProperName(submissions[i].pack); //set pack text
            if(displaying && i === winningIndex) {
                submittedCard.classList.add("selected-card");
            }
            submittedPublicCardElements.push(submittedCard); //add to element list
            submittedPublicTextElements.push(cardText);

            submittedCard.addEventListener('click', function() {
                if(this.classList.contains('clickable')){
                    selectedIndex = i;
                    selectedText = submittedPublicTextElements[i]; //since text list will always align with card list
                    submittedPublicCardElements.forEach(element => { //for each card element
                        element.classList.remove("selected-card"); //remove selected class from all cards
                        element.style.backgroundColor = "white"; //reset card background color
                        element.style.color = "black"; //reset card text color
                    });
                    // Add the selected class to the clicked card
                    this.classList.add("selected-card"); //add selected card class to clicked card
                    hasCardBeenSelected = true; //a card has been selected
                    submitButton.disabled = false; //re-enable submit button
                }
            });

            if(showContent){ //if content is to be shown to all
                cardText.style.display = "p"; //make card text visible
                cardPack.style.display = "p"; //make card pack visible
                if(self.czar  && !hasCardBeenSubmitted) {
                    submittedPublicCardElements.forEach(card => {
                        card.classList.add("clickable")
                    });
                }
            } else if (firstCard && hasCardBeenSubmitted) { //if it's the first card
                firstCard = false; //disable first card
                cardText.textContent = submittedText; //display personal submission text on first card
                cardPack.textContent = getProperName(submittedPack); //display personal submission pack on first card
                cardText.style.display = "p"; //make card text visible
                cardPack.style.display = "p"; //make card pack visible
            } else { //else do not show any text content; display blank card, applies to czar and unsubmitted players
                cardText.style.display = "none"; //hide card text
                cardPack.style.display = "none"; //hide card pack
            }
            submittedCard.appendChild(cardText); //add text as child of card element
            submittedCard.appendChild(cardPack); //add pack as child of card element
            publicContainer.appendChild(submittedCard); //add card as child of card container
        }
    }

    let connectedPlayerObjects = []; //HTML elements for displaying players

    function updateConnectedPlayers(playerInfo) { //update list of connected players on client side
        connectedPlayerObjects.forEach(item => { //remove all existing elements
            item.remove();
        })
        for (let i = 0; i < playerInfo.length; i++) { //for each current player
            let newPlayerObject = document.createElement("div"); //create new player/score container object
            newPlayerObject.classList.add("player-score-item"); //add class for CSS
            let newPlayerObjectUsername = document.createElement("h"); //create username text
            let newPlayerObjectScore = document.createElement("h"); //create score text
            newPlayerObjectUsername.classList.add("player-score-item-username"); //add class for CSS
            newPlayerObjectScore.classList.add("player-score-item-score"); //add class for CSS
            newPlayerObjectUsername.textContent = playerInfo[i].name; //set username text content
            newPlayerObjectScore.textContent = playerInfo[i].score; //set score text content
            if(i % 2 === 1)  { //change color every other iteration (disabled right now, might add back later)
                newPlayerObject.style.backgroundColor = "#cfcfd3";
            } else {
                newPlayerObject.style.backgroundColor = "#cfcfd3";
            }

            if(playerInfo[i].czar) { //if player is czar, set color to gray
                newPlayerObject.style.backgroundColor = "#99999a";
                newPlayerObjectUsername.textContent = (playerInfo[i].name + " [Card Czar]");
            }

            if(playerInfo[i].justWon) { //if player has justWon status, highlight their item
                newPlayerObject.style.backgroundColor = "#dea2bd";
            }

            newPlayerObject.appendChild(newPlayerObjectUsername); //add username as child of player object
            newPlayerObject.appendChild(newPlayerObjectScore); //add score as child of player object
            playerContainer.appendChild(newPlayerObject); //add player as child of main container object
            connectedPlayerObjects.push(newPlayerObject); //add player object to list of player elements
        }
    }

    function updateSelf() {
        socket.emit('update-self', username, (response) => { //requests updated personal info
            self = response.rawPlayerInfo
            setCardsClickable(!self.czar && !hasCardBeenSubmitted); //if player is czar, make hand cards unclickable
        });
    }

    function setCardsClickable(state){ //set all cards' clickability
        handCards.forEach(card => { //for each card
            if(state) { //if set to true
                if (!card.classList.contains("clickable")) { //if card does not have clickable class
                    card.classList.add("clickable") //add clickable class
                }
            }
            else {
                card.classList.remove("clickable"); //remove clickable class
            }
        });
    }
});

