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
    for(let i = 1; i<=7; i++){
        handElementsText.push(document.getElementById("white-card-"+i+"-text"))
        handElementsPack.push(document.getElementById("white-card-"+i+"-pack"))
    }

    socket.emit('requestPlayerData', username, (response) => {
        self = response.rawPlayerInfo
        populateCardsFromHand(self);
    });

    function populateCardsFromHand(self) {
        socket.emit("serverDebug", "Callback Received");
        for(let i = 0; i<7;i++){
            handElementsText[i].textContent = self.hand[i].text;
            handElementsPack[i].textContent = getProperName(self.hand[i].pack);
        }
    }

    for(let i=0;i<7;i++){
        handCards[i].addEventListener('click', function() {
            selectedIndex = i;
            selectedText = self.hand[i].text;
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
            case "familyFriendly":
                return "Family Friendly Pack";
        }
    }

    const submitButton = document.getElementById("submit-button");
    submitButton.onclick = () => {
        let payload = {username:self.name, submission:selectedText, submissionIndex:selectedIndex, id: self.id}
        socket.emit('submit-cards', payload, (response) => {
            self = response.rawPlayerInfo;
            populateCardsFromHand(self);
            handCards.forEach(element => {
                element.classList.remove("selected-card");
                element.style.backgroundColor = "white"; // Reset background color
                element.style.color = "black"; // Reset text color
            });
        });
        submitButton.disabled = true;
    };
});

