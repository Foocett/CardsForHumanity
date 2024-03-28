document.addEventListener('DOMContentLoaded', function() {
    //Prompt for username before loading page content
    console.log("connected");
    let username = prompt("Please enter your username:");
    while (username === null || username.trim() === "") {
        alert("You must enter a username to continue.");
        username = prompt("Please enter your username:");
    }

    const socket = io(); // Connect to the server
    let self;
    const handCards = document.querySelectorAll(".white-card");
    let handElementsText = []
    let handElementsPack = []
    let selectedIndex;
    let selectedText;
    let selectedPack;
    let submittedText;
    let submittedPack;

    function debug(message){
        socket.emit("debug", message);
    }

    for(let i = 1; i<=7; i++){
        handElementsText.push(document.getElementById("white-card-"+i+"-text"))
        handElementsPack.push(document.getElementById("white-card-"+i+"-pack"))
    }

    socket.emit('requestPlayerData', username, (response) => {
        self = response.rawPlayerInfo
        populateCardsFromHand(self);
    });

    socket.on("updatePlayerList", (playerInfo) => {
        updateConnectedPlayers(playerInfo)
    })

    function populateCardsFromHand(self) {
        for(let i = 0; i<7;i++){
            handElementsText[i].textContent = self.hand[i].text;
            handElementsPack[i].textContent = getProperName(self.hand[i].pack);
        }
    }

    for(let i=0;i<7;i++){
        handCards[i].addEventListener('click', function() {
            selectedIndex = i;
            selectedText = self.hand[i].text;
            selectedPack = self.hand[i].pack;
            handCards.forEach(element => {
                element.classList.remove("selected-card");
                element.style.backgroundColor = "white"; // Reset background color
                element.style.color = "black"; // Reset text color
            });

            // Add the selected class to the clicked card
            this.classList.add("selected-card");
        });
    }

    function getProperName(name){
        switch(name){
            case "uwu":
                return "UwU Pack";
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
            case "ap":
                return "Family Friendly Pack";
        }
    }

    const submitButton = document.getElementById("submit-button");
    submitButton.onclick = () => {
        let payload = {username:self.name, submission:selectedText, submissionPack: selectedPack, submissionIndex:selectedIndex, id: self.id}
        socket.emit('submit-cards', payload, (response) => {
            self = response.rawPlayerInfo;
            populateCardsFromHand(self);
            submittedText = selectedText;
            submittedPack = selectedPack;
            handCards.forEach(element => {
                element.classList.remove("selected-card");
                element.style.backgroundColor = "white"; // Reset background color
                element.style.color = "black"; // Reset text color
            });
        });
        submitButton.disabled = true;
    };

    const publicContainer = document.getElementById("cards-public-container")
    let submittedPublicCardElements = [];

    socket.on("pushSubmittedCards", (payload) => {
        displaySubmittedCards(payload.submissions, payload.showContent)
    })
    function displaySubmittedCards(submissions, showContent){
        debug("displaying cards")
        submittedPublicCardElements.forEach(card => {
            card.remove();
        })
        let firstCard = true;
        submissions.forEach ( card => {
            const submittedCard = document.createElement("div");
            submittedPublicCardElements.push(submittedCard);
            const cardText = document.createElement("p");
            const cardPack = document.createElement("p")
            submittedCard.classList.add("white-card");
            cardText.classList.add("white-card-text");
            cardPack.classList.add("white-card-pack");
            if(showContent){
                cardText.textContent = card.text;
                cardPack.textContent = card.pack;
                cardText.style.display = "p";
                cardPack.style.display = "p";
            } else if (firstCard) {
                firstCard = false;
                cardText.textContent = submittedText;
                cardPack.textContent = submittedPack;
                cardText.style.display = "p";
                cardPack.style.display = "p";
            } else {
                cardText.style.display = "none";
                cardPack.style.display = "none";
            }
            submittedCard.appendChild(cardText);
            submittedCard.appendChild(cardPack);
            publicContainer.appendChild(submittedCard);
        });
    }

    let connectedPlayerObjects = [];
    function updateConnectedPlayers(playerInfo) {
        let playerContainer = document.getElementById("score-display-container")
        connectedPlayerObjects.forEach(item => {
            item.remove();
        })
        for (let i = 0; i < playerInfo.length; i++) {
            let newPlayerObject = document.createElement("div");
            newPlayerObject.classList.add("player-score-item");

            let newPlayerObjectUsername = document.createElement("h");
            let newPlayerObjectScore = document.createElement("h");
            newPlayerObjectUsername.classList.add("player-score-item-username");
            newPlayerObjectScore.classList.add("player-score-item-score");
            newPlayerObjectUsername.textContent = playerInfo[i].name;
            newPlayerObjectScore.textContent = playerInfo[i].score;
            if(i % 2 === 1)  {
                newPlayerObject.style.backgroundColor = "#d1d1e0"
            } else {
                newPlayerObject.style.backgroundColor = "#a3a3c2"
            }
            newPlayerObject.appendChild(newPlayerObjectUsername);
            newPlayerObject.appendChild(newPlayerObjectScore);
            playerContainer.appendChild(newPlayerObject);
            connectedPlayerObjects.push(newPlayerObject);
        }
    }
});

