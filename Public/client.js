// TODO wager with arrow keys
// TODO de-focus text box with esc
// TODO remove credit from black card blank filling
// TODO submit card on double click?
// TODO !IMPORTANT move {...} in pack JSON files to pack text
const socket = io();
let self; //will be given value after client is initialized with server
let buttonStates = [];
const packButtons = () => {
    return(document.querySelectorAll(".pack-input"))
}
// Connect to the server
document.addEventListener('DOMContentLoaded', function () {
    const waitingOverlay = document.getElementById('waiting-overlay');
    populateThemeDropdown();
    loadTheme(getCookie("themeName"));
    let username = prompt("Please enter your username:"); //Prompt for username before loading page content
    while (username === null || username.trim() === "" || username.length >= 20 || username.includes("\\")) { //check valid username
        if (username.length >= 20) {
            alert("Username must be no longer than 20 characters")
        } else if (username.includes("\\")) {
            alert("Username cannot contain backslashes")
        } else if (username.includes(",")) {
            alert("Username cannot contain commas")
        } else if (username.startsWith(" ")) {
            alert("Username cannot start with a space")
        } else {
            alert("You must enter a username to continue."); //if input is invalid, prompt again
        }
        username = prompt("Please enter your username:");
    }

    const handCards = document.querySelectorAll(".white-card"); //all cards in hand
    const selectedCardIndex = -1;
    const selectedHandCardIndex = function() {
        for(let i = 0; i<10; i++) {
            if(handCards[i].classList.contains("selected-card")) {
                return i;
            }
        }
        return -1;
    }
    let handElementsText = []; //white card text objects
    let handElementsPack = []; //white card pack objects
    let selectedIndex; //index of selected card
    let selectedText; //text of selected card
    let selectedPack; //pack of selected card
    let submittedText; //text of submitted card
    let submittedPack; //pack of submitted card
    let mySubmission = false //used to prevent repetitive vine boomage
    let hasCardBeenSelected = false; //used to prevent submission before selection
    let hasCardBeenSubmitted = false; //used to prevent multiple submissions
    let isHovering = false; //used for hover animations
    let wrapCards = false; //Used when displaying submitted cards
    //get HTML objects from document
    const startGameButton = document.getElementById("start-turn-button");
    const blackText = document.getElementById("black-card-text");
    const blackPack = document.getElementById("black-card-pack");
    const submitButton = document.getElementById("submit-button");
    const publicContainer = document.getElementById("cards-public-container");
    const playerContainer = document.getElementById("score-display-container");
    const vineBoom = document.getElementById("vine-boom");
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    const wagerLeft = document.getElementById("wager-left");
    const wagerRight = document.getElementById("wager-right");
    const wagerValue = document.getElementById("wager-value");
    const aboutButton = document.getElementById("about");
    const adminButton = document.getElementById("admin-settings");
    const themesButton = document.getElementById("themes");
    const adminOverlay = document.getElementById("admin-overlay");
    const adminCloseButton = document.getElementById("exit-admin-button");
    const themeCloseButton = document.getElementById("exit-theme-button");
    const nukeButton = document.getElementById("nuke");
    const setScoreButton = document.getElementById("setScore");
    const kickButton = document.getElementById("kickPlayer");
    const forceTurnButton = document.getElementById("forceNextTurn");
    const dumpHandButton = document.getElementById("dumpHand");
    const warnPlayerButton = document.getElementById("warnPlayers");
    const warnLobbyButton = document.getElementById("warnLobby");
    const themeOverlay = document.getElementById("theme-overlay");
    const themeDropdown = document.getElementById("theme-select");
    const handTextElements = document.querySelectorAll(".white-card-text")
    const handPackElements = document.querySelectorAll(".white-card-pack");
    handPackElements.forEach(obj => {
        obj.classList.add("unselectable")
    })
    handTextElements.forEach(obj => {
        obj.classList.add("unselectable")
    })
    submitButton.disabled = true; //disable submit button by default
    let isTextBoxFocused = false;

    input.addEventListener('focus', () => {
        isTextBoxFocused = true;
    });

// Event listener for when the text box loses focus
    input.addEventListener('blur', () => {
        isTextBoxFocused = false;
    });


    themeDropdown.onchange = function () {
        loadTheme(this.value)
        setCookie("themeName", this.value);
    }
    vineBoom.volume = 1;

    themesButton.addEventListener("click", function (e) {
        e.preventDefault();
        themeOverlay.style.display = "flex";
    });

    wagerRight.addEventListener("click", function (e) {
        e.preventDefault()
        if (!hasCardBeenSubmitted && !self.czar) {
            socket.emit("increase-wager", 0, (response) => {
                wagerValue.innerHTML = response.toString();
            });
        }
    });

    wagerLeft.addEventListener("click", function (e) {
        e.preventDefault()
        if (!hasCardBeenSubmitted && !self.czar) {
            socket.emit("decrease-wager", 0, (response) => {
                wagerValue.innerHTML = response.toString();
            });
        }
    });

    aboutButton.addEventListener("click", function () {
        window.open("https://github.com/Foocett/CardsForHumanity/blob/main/README.md")
    });

    socket.on("reset-wager", () => {
        wagerValue.innerHTML = "1"
    })


    adminButton.addEventListener("click", function () {
        let passwordInput = prompt("Enter Admin Password");
        socket.emit("verifyAdminPassword", passwordInput, (response) => {
            if (response) {
                adminOverlay.style.display = "flex";
            } else if (passwordInput !== null) {
                alert("Sorry, that password is incorrect\nIf you are the host, you can configure the password in config.json");
            }
        });
    });

    adminCloseButton.addEventListener("click", function () {
        adminOverlay.style.display = 'none';
    })

    themeCloseButton.addEventListener("click", function () {
        themeOverlay.style.display = 'none';
    })


    nukeButton.onclick = () => {
        let warning = prompt("Warning, this will completely reset the server and kick all players\nRe-enter admin password to continue...")
        socket.emit("verifyAdminPassword", warning, (response) => {
            if (response) {
                socket.emit("nukeGame");
            } else {
                alert("Incorrect Password");
            }
        });
    }

    setScoreButton.onclick = () => {
        let player = prompt("Input target player's username: ");
        let val = prompt("Input score value: ");
        let packet = {
            player: player,
            val: val
        }
        socket.emit("setScore", packet);
    }

    kickButton.onclick = () => {
        let player = prompt("Input target player's username: ");
        socket.emit("kickPlayer", player);
    }

    socket.on('kick', () => {
        alert("You have been removed from the lobby. The page will now reload.");
        setTimeout(function () {
            window.location.reload();
        }, 2000);  // Delay reload by 3 seconds to allow user to read message.
    });

    forceTurnButton.onclick = () => {
        socket.emit("forceNextTurn");
    }

    dumpHandButton.onclick = () => {
        let player = prompt("Input target player's username: ");
        socket.emit("dumpHand", player);
    }

    warnPlayerButton.onclick = () => {
        let player = prompt("Input target players' usernames (comma separated): ");
        let playersList = parseCSV(player);
        let message = prompt("Input warning message: ");
        let packet = {
            players: playersList,
            warningMessage: message
        }
        socket.emit("warnPlayers", packet);
    }

    warnLobbyButton.onclick = () => {
        let warningMessage = prompt("Input warning message to be sent to the entire lobby: ");
        socket.emit("warnLobby", warningMessage)
    }

    function parseCSV(csvString) { //assumes that commas have spaces after them
        return csvString.split(", ");
    }

    document.onkeyup = function (e) {
        //e = e || window.event;
        if (e.key === "Escape") {
            if (adminOverlay.style.display === 'flex') {
                adminOverlay.style.display = 'none';
            }
            if (themeOverlay.style.display === 'flex') {
                themeOverlay.style.display = 'none';
            }
        }
        if ((e.key === "Enter" || e.key === " ") && !isTextBoxFocused) {
            if (!startGameButton.disabled && !(waitingOverlay.style.display === "none")) { //If the start button is clickable and overlay is visible
                e.preventDefault();
                startGameButton.click();
            }
        }
        if(isTextBoxFocused && e.key === "Escape") {
            input.blur()
        }
        if((e.key==="+" || e.key === "=") && !isTextBoxFocused) {
            wagerRight.click()
        }
        if((e.key === "-" || e.key === "_") && !isTextBoxFocused) {
            wagerLeft.click()
        }
    }

    socket.on('triggerAlert', (message) => {
        alert(message);
    });

    for (let i = 1; i <= 10; i++) { //get HTML objects for each card
        handElementsText.push(document.getElementById("white-card-" + i + "-text")); //text object
        handElementsPack.push(document.getElementById("white-card-" + i + "-pack")); //pack object
    }


    document.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && !submitButton.disabled && !isTextBoxFocused) {
            submitButton.click();
        } else if( e.key === "/" && !isTextBoxFocused) {
            e.preventDefault();
            input.focus();
        }
        if(e.key === "ArrowRight" && !isTextBoxFocused) {
            let idx = selectedHandCardIndex();
            if(idx === -1 || idx === 9) {
                handCards[0].click()
            } else {
                handCards[idx+1].click();
            }
        }
        if(e.key === "ArrowLeft" && !isTextBoxFocused) {
            let idx = selectedHandCardIndex();
            if(idx === -1 || idx === 0) {
                handCards[0].click()
            } else {
                handCards[idx-1].click();
            }
        }
        if(e.key === "ArrowUp" && !isTextBoxFocused) {
            let idx = selectedHandCardIndex();
            if(idx === -1) {
                handCards[0].click()
            } else if(idx < 5){
                handCards[idx+5].click();
            } else {
                handCards[idx-5].click();
            }
        }
        if(e.key === "ArrowDown" && !isTextBoxFocused) {
            let idx = selectedHandCardIndex();
            if(idx === -1) {
                handCards[0].click()
            } else if(idx > 5){
                handCards[idx-5].click();
            } else {
                handCards[idx+5].click();
            }
        }
    })

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    });

    socket.on('chat message', (payload) => {
        addMessage(payload.msg, payload.user)
    });

    socket.on('update-packs', (data) => {
        let noneAreChecked = true;
        for (let i = 0; i < packButtons().length; i++) {
            packButtons()[i].checked = data[i];
            if (data[i] && self.admin) {
                startGameButton.disabled = false;
                noneAreChecked = false;
            }
        }
        if (self.admin && noneAreChecked) {
            startGameButton.disabled = true;
        }
    });

    socket.on("forceSelfUpdate", () => {
        updateSelf();
    })

    socket.on("deactivatePage", () => {
        alert("The game has been reset, please refresh your page");
        document.addEventListener("click", function () {
            alert("The game has been reset, please refresh your page")
        });
        document.addEventListener("keyup", function () {
            alert("You have been banned from this session")
        })
    });

    socket.on("deactivatePageKicked", () => {
        document.addEventListener("click", function () {
            alert("You have been banned from this session")
        });
        document.addEventListener("keyup", function () {
            alert("You have been banned from this session")
        })
    });

    socket.emit('requestPlayerData', username, (response) => { //send username to server and get self player object back
        if(!response) {
            alert("Someone with this username already exists")
            window.location.reload()
        } else {
            self = response.rawPlayerInfo; //set self equal to returned player object
            startGameButton.disabled = true; //deactivate button
            populatePacks(response.packNames);
            if (self.admin) { //if admin, show start game button
                startGameButton.style.display = "block";
                startGameButton.onclick = () => {
                    let packState = [];
                    packButtons().forEach(button => {
                        let individualPack = {
                            name: button.id,
                            checked: button.checked
                        }
                        packState.push(individualPack);
                    });
                    socket.emit("begin-game", (packState)); //send begin game signal to server
                    waitingOverlay.style.display = "none"; //hide after click
                };
            } else {
                packButtons().forEach(button => {
                    button.disabled = true;
                });
            }
        }
    });


    socket.on("updatePlayerList", (playerInfo) => { //updates list of connected players
        updateConnectedPlayers(playerInfo);
    });


    /*
     * FIXME: - Auto hide overlay if game has already started
     */

    /*
     * TODO: - After fixing above issue, create mid-game player queue
     */
    socket.on("hide-waiting-overlay", () => {
        waitingOverlay.style.display = "none";
    })

    socket.on("start-turn", (gameData) => { //on start turn command receive
        hasCardBeenSelected = false; //reset selected cards
        hasCardBeenSubmitted = false;
        handCards.forEach(card => { //remove selected class from all HTML objects
            card.classList.remove("selected-card");
            if (!self.czar) {
                card.classList.add("clickable");
            }
        });
        submittedPublicCardElements.forEach(card => {
            card.remove();
        });
        updateSelf();


        submitButton.disabled = true
        blackText.innerHTML = extractBlock(gameData.currentBlackCard.text)[0]; //set black card text
        console.log(gameData.currentBlackCard.text)
        console.log(extractBlock(gameData.currentBlackCard.text))
        console.log(extractBlock(gameData.currentBlackCard.text)[0])
        console.log(blackText.innerHTML)
        if (gameData.currentBlackCard.text.includes("vine")) {
            thatMomentWhen();
        }
        blackPack.innerHTML = gameData.currentBlackCard.pack + extractBlock(gameData.currentBlackCard.text)[1]; //get full pack name
        updateConnectedPlayers(gameData.players); //updates connected players
    });

    function populateCardsFromHand(self) { //update HTML cards with info in hand
        for (let i = 0; i < 10; i++) { //for each of ten cards
            if(self.hand[i].text === "Subway Surfers.") {
                handElementsText[i].parentElement.classList.add("subway")
                handElementsPack[i].color = "white";
                handElementsText[i].innerHTML = extractBlock(self.hand[i].text)[0]; //set text to card.text
                handElementsPack[i].innerHTML = self.hand[i].pack + extractBlock(self.hand[i].text)[1]; //set pack to card.pack's full nam
            } else {
                handElementsText[i].parentElement.classList.remove("subway")
                handElementsPack[i].color = "black";
                handElementsText[i].innerHTML = extractBlock(self.hand[i].text)[0]; //set text to card.text
                handElementsPack[i].innerHTML = self.hand[i].pack + extractBlock(self.hand[i].text)[1];
            }
        }
    }

    for (let i = 0; i < 10; i++) { //add click listeners to each card
        handCards[i].addEventListener('click', function () {
            if (this.classList.contains("clickable")) { //if the card is currently clickable...
                selectedIndex = i; //set selected card index to position in for loop
                selectedText = self.hand[i].text; //set global selected text
                selectedPack = self.hand[i].pack; //set global selected pack
                if (!this.classList.contains("selected-card") && selectedText.includes("vine")) { //play vine boom if vine boom card & card isn't already selected
                    thatMomentWhen();
                }
                let wasSelectedAlready = this.classList.contains("selected-card");
                handCards.forEach(element => { //for each card element
                    element.classList.remove("selected-card"); //remove selected class from all cards
                    element.style.backgroundColor = "white"; //reset card background color
                    element.style.color = "black"; //reset card text color
                });
                // Add the selected class to the clicked card
                if(!wasSelectedAlready) {
                    this.classList.add("selected-card"); //add selected card class to clicked card
                    hasCardBeenSelected = true; //a card has been selected
                    submitButton.disabled = false; //re-enable submit button
                } else {
                    this.classList.remove("selected-card"); //add selected card class to clicked card
                    hasCardBeenSelected = false; //a card has been selected
                    submitButton.disabled = true; //re-enable submit button
                }
            }
            if (!this.classList.contains('clickable')) {
                // Check if the card is currently being hovered
                const isHovering = this.matches(':hover');
                this.style.setProperty('--scale-factor', isHovering ? '1.05' : '1');
                this.classList.add('shake');
                setTimeout(() => {
                    this.classList.remove('shake');
                    this.style.removeProperty('--scale-factor');
                }, 350); // slightly longer than the animation duration
            }
        });
        /*
        * this code used to insert white card content into blanks in black cards when they're hovered
        * I'm keeping the code but not using it because it was buggy and looked a lot cooler in my head
        handCards[i].addEventListener("mouseover", function () {
            if (this.classList.contains("clickable") && !isHovering) {
                let replacementText = '<span class="underlined">' + extractBlock(self.hand[i].text) + '</span>';
                blackText.innerHTML = blackText.innerHTML.replace("_____", replacementText);
                isHovering = true
            }
        });

        handCards[i].addEventListener("mouseleave", function () {
            isHovering = false
            blackText.innerHTML = blackText.innerHTML.replace(extractBlock(self.hand[i].text)[0], "_____");
        });
        */
    }

    submitButton.onclick = () => { //on submit button click
        if (hasCardBeenSelected) { //only execute if a card is selected
            let payload = { //data to be sent to server
                username: self.name,
                submission: selectedText,
                submissionPack: selectedPack,
                submissionIndex: selectedIndex,
                id: self.id
            }
            mySubmission = true
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
        displaySubmittedCards(payload.submissions, payload.showContent, payload.displaying, payload.winningIndex); //display all clients' submitted cards
    });

    function displaySubmittedCards(submissions, showContent, displaying, winningIndex) {
        updateSelf();
        submittedPublicCardElements.forEach(card => { //remove all current elements
            card.remove();
        });
        submittedPublicTextElements.forEach(obj => { //remove all current elements
            obj.remove();
        });
        let firstCard = true; //to track which card is the first card
        let submissionsLength = submissions.length;
        wrapCards = submissionsLength > 4 && !displaying;

        if (displaying) {
            submissionsLength--;
        }
        for (let i = 0; i < submissionsLength; i++) {
            const submittedCard = document.createElement("div"); //create new card
            if (!wrapCards) {
                submittedCard.classList.add("tall");
            }
            const cardText = document.createElement("p"); //create text object child
            const cardPack = document.createElement("p"); //create pack object child
            cardPack.classList.add("unselectable");
            cardText.classList.add("unselectable")
            submittedCard.classList.add("white-card"); //add white card class for CSS formatting
            submittedCard.classList.add("submitted-card"); //designate card as a selected card
            cardText.classList.add("white-card-text"); //add white card text class for CSS formatting
            cardText.classList.add("submitted-card-text"); //designate card text
            cardPack.classList.add("white-card-pack"); //add white card pack class for CSS formatting
            cardText.innerHTML = extractBlock(submissions[i].text)[0]; //set card text content
            cardPack.innerHTML = submissions[i].pack + extractBlock(submissions[i].text)[1]; //set pack text
            if (displaying && i === winningIndex) {
                submittedCard.classList.add("selected-card");
                if (submissions[i].text.includes("vine")) {
                    for (let i = 0; i < 10; i++) {
                        thatMomentWhen(); //vine boom if "*vine boom* wins;
                        setTimeout(() => {
                        }, 100);
                    }
                }
            }
            submittedPublicCardElements.push(submittedCard); //add to element list
            submittedPublicTextElements.push(cardText);


            submittedCard.addEventListener('click', function () {
                if (this.classList.contains('clickable')) {
                    selectedIndex = i;
                    selectedText = submittedPublicTextElements[i]; //since text list will always align with card list
                    /*
                    if(!this.classList.contains("selected-card") && selectedText.includes("vine")) { //play vine boom if vine boom card & card isn't already selected
                        thatMomentWhen();
                    }
                     */
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
                if(!this.classList.contains('clickable')) {
                    // Check if the card is currently being hovered
                    const isHovering = this.matches(':hover');
                    this.style.setProperty('--scale-factor', isHovering ? '1.05' : '1');
                    this.classList.add('shake');
                    setTimeout(() => {
                        this.classList.remove('shake');
                        this.style.removeProperty('--scale-factor');
                    }, 350); // slightly longer than the animation duration
                }
            });

            submittedCard.addEventListener("mouseover", function () {
                if (this.classList.contains("clickable") && !isHovering) {
                    let replacementText = '<span class="underlined">' + extractBlock(submissions[i].text)[0] + '</span>';
                    blackText.innerHTML = blackText.innerHTML.replace("_____", replacementText);
                }
            });

            submittedCard.addEventListener("mouseleave", function () {
                blackText.innerHTML = blackText.innerHTML.replace(extractBlock(submissions[i].text)[0], "_____");
            });

            if (showContent) { //if content is to be shown to all
                if(cardText.textContent === "Subway Surfers.") {
                    submittedCard.classList.add('subway')
                }
                if (cardText.innerHTML.includes("vine")) {
                    thatMomentWhen();
                }
                cardText.style.display = "p"; //make card text visible
                cardPack.style.display = "p"; //make card pack visible
                if (self.czar && !hasCardBeenSubmitted) {
                    submittedPublicCardElements.forEach(card => {
                        card.classList.add("clickable");
                    });
                }
            } else if (firstCard && hasCardBeenSubmitted) { //if it's the first card
                if(submittedText === "Subway Surfers.") {
                    submittedCard.classList.add('subway')
                }
                firstCard = false; //disable first card
                cardText.innerHTML = extractBlock(submittedText)[0]; //display personal submission text on first card
                if (submittedText.includes("vine") && mySubmission) {
                    thatMomentWhen();
                    mySubmission = false;
                }
                cardPack.innerHTML = submittedPack + extractBlock(submittedText)[1]; //display personal submission pack on first card
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
        });
        for (let i = 0; i < playerInfo.length; i++) { //for each current player
            let newPlayerObject = document.createElement("div"); //create new player/score container object
            newPlayerObject.classList.add("player-score-item"); //add class for CSS
            let newPlayerObjectUsername = document.createElement("h"); //create username text
            let newPlayerObjectScore = document.createElement("h"); //create score text
            newPlayerObjectUsername.classList.add("unselectable")
            newPlayerObjectScore.classList.add("unselectable")
            newPlayerObjectUsername.classList.add("player-score-item-username"); //add class for CSS
            newPlayerObjectScore.classList.add("player-score-item-score"); //add class for CSS
            newPlayerObjectUsername.innerHTML = playerInfo[i].name; //set username text content
            newPlayerObjectScore.innerHTML = playerInfo[i].score; //set score text content
            if (i % 2 === 1) { //change color every other iteration
                newPlayerObject.style.backgroundColor = "rgba(0,0,0,.2)";
            } else {
                newPlayerObject.style.backgroundColor = "rgba(0,0,0,.1)";
            }

            if (playerInfo[i].czar) { //if player is czar, set color to gray
                newPlayerObjectUsername.innerHTML = (playerInfo[i].name + " [Card Czar]");
            }

            if (playerInfo[i].justWon) { //if player has justWon status, highlight their item
                newPlayerObject.style.backgroundColor = "rgba(0,0,0,.5)";
            }

            newPlayerObject.appendChild(newPlayerObjectUsername); //add username as child of player object
            newPlayerObject.appendChild(newPlayerObjectScore); //add score as child of player object
            playerContainer.appendChild(newPlayerObject); //add player as child of main container object
            connectedPlayerObjects.push(newPlayerObject); //add player object to list of player elements
        }
    }

    function updateSelf() {
        socket.emit('update-self', username, (response) => { //requests updated personal info
            self = response.rawPlayerInfo;
            setCardsClickable(!self.czar && !hasCardBeenSubmitted); //if player is czar, make hand cards unclickable
            populateCardsFromHand(self)
        });
    }

    function setCardsClickable(state) { //set all cards' clickability
        handCards.forEach(card => { //for each card
            if (state) { //if set to true
                if (!card.classList.contains("clickable")) { //if card does not have clickable class
                    card.classList.add("clickable"); //add clickable class
                }
            } else {
                card.classList.remove("clickable"); //remove clickable class
            }
        });
    }

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(message, author) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = author + ": " + message;
        messages.appendChild(messageElement);
        scrollToBottom();
    }

    const thatMomentWhen = () => {
        vineBoom.play();
    }


    function populateThemeDropdown() {
        fetch('themes.json')
            .then(response => response.json())
            .then(themes => {
                for (let key in themes) {
                    let theme = themes[key];
                    const newOption = document.createElement("option");
                    newOption.innerHTML = theme["name"];
                    themeDropdown.appendChild(newOption);
                }
                if (getCookie("themeName")) {
                    themeDropdown.value = getCookie("themeName");
                }
            });
    }

    function loadTheme(themeName) {
        fetch('./themes.json')
            .then(response => response.json())
            .then(themes => {
                let theme = themes[themeName];
                document.documentElement.style.setProperty('--themeGradient', theme["themeGradient"]);
                document.documentElement.style.setProperty('--activeBefore', theme["activeBefore"]);
                document.documentElement.style.setProperty('--buttonHover', theme["buttonHover"]);
                document.documentElement.style.setProperty('--darkeningFactor', theme["darkeningFactor"]);
                document.documentElement.style.setProperty('--primaryColor', theme["primaryColor"])
            })
            .catch(error => console.error('Error loading the themes:', error));
    }
});

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
}

function populatePacks(packs) {
    const packSelectionBox = document.getElementById("pack-selection-box")
    packs.forEach(pack => {
        const buttonsDiv = document.createElement("div")
        buttonsDiv.classList.add("pack-buttons");
        buttonsDiv.style.display = "flex";
        buttonsDiv.style.flexWrap = "wrap";
        buttonsDiv.style.flexDirection = "column"
        buttonsDiv.style.alignItems = 'center';
        const packLabel = document.createElement('label')
        packLabel.classList.add("unselectable")
        packLabel.id = pack + "Visual"
        packLabel.classList.add("checkBox")
        packLabel.for = pack;
        const packCheck = document.createElement('input');
        packCheck.id = pack;
        const packDiv = document.createElement('div');
        const visualPackLabel = document.createElement("label")
        visualPackLabel.classList.add("unselectable")
        visualPackLabel.for = pack + "Visual";
        visualPackLabel.innerHTML = pack
        visualPackLabel.style.marginTop = "5px"
        packDiv.classList.add("transition");
        packCheck.type = "checkbox";
        packCheck.classList.add("pack-input")
        buttonsDiv.appendChild(packLabel);
        packLabel.appendChild(packCheck);
        packLabel.appendChild(packDiv);
        buttonsDiv.appendChild(visualPackLabel)
        packSelectionBox.appendChild(buttonsDiv);
    })
    packButtons().forEach(button => {
        button.addEventListener("click", function () {
            if (self.admin) {
                let buttonStates = [];
                packButtons().forEach(box => {
                    buttonStates.push(box.checked);
                });
                socket.emit("pack-selection", buttonStates);
            }
        });
    });
    document.addEventListener("keydown", function (e) {
        let num = parseInt(e.key);
        if (self.admin && document.getElementById("pack-selection-box").style.display !== "none" && typeof (num) === "number") { // admin// and waiting overlay is visible and button pressed is a number
            if (num > 0 && num < packButtons().length + 1) {
                buttonStates = []
                packButtons()[num - 1].checked = !packButtons()[num - 1].checked;
                packButtons().forEach(box => {
                    buttonStates.push(box.checked);
                });
                socket.emit("pack-selection", buttonStates);
            }
        }
    })
}

function extractBlock(text) {
    // Find the index of the last opening brace '{'
    const startIndex = text.lastIndexOf('{');

    // Find the index of the last closing brace '}'
    const endIndex = text.lastIndexOf('}');

    // Initialize variables for the cleaned text and block content
    let cleanedText = text;
    let blockContent = '';
    // Check if both braces are found and the '{' is before the '}'
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        // Extract the content inside the last {} block
        const content = text.substring(startIndex + 1, endIndex);
        // Format the content if it exists
        blockContent = content ? ` (${content})` : '';
        // Remove the {} block from the original text
        cleanedText = text.substring(0, startIndex).trim();
    }
    // Return the cleaned text and the formatted content inside the {}
    console.table({cleanedText, blockContent});
    return [cleanedText, blockContent];
}
