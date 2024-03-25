let handElementsText = []
let handElementsPack = []
document.addEventListener('DOMContentLoaded', function() {
    console.log("connected");
    let username = prompt("Please enter your username:");
    while (username === null || username.trim() === "") {
        alert("You must enter a username to continue.");
        username = prompt("Please enter your username:");
    }
    const socket = io(); // Connect to the server
    let self;
    for(let i = 1; i<=7; i++){
        handElementsText.push(document.getElementById("white-card-"+i+"-text"))
        handElementsPack.push(document.getElementById("white-card-"+i+"-pack"))
    }
    socket.emit('requestPlayerData', username, (response) => {
        self = response.rawPlayerInfo
        populateCardsFromHand(self);
    });
    function populateCardsFromHand(self) {
        for(let i = 0; i<7;i++){

            handElementsText[i].textContent = self.hand[i].text;
            handElementsPack[i].textContent = getProperName(self.hand[i].pack);
        }
    }

    const handCards = document.querySelectorAll(".white-card");

    handCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove the selected class from all cards
            handCards.forEach(element => {
                element.classList.remove("selected-card");
                element.style.backgroundColor = "white"; // Reset background color
                element.style.color = "black"; // Reset text color
            });

            // Add the selected class to the clicked card
            this.classList.add("selected-card");
        });
    });

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

    function selectCard(index, cardElement) {
        const selectedIndex = selectedCards.indexOf(index);
        if (selectedIndex > -1) {
            selectedCards.splice(selectedIndex, 1); // Deselect
            cardElement.style.backgroundColor = ''; // Visual feedback for deselection
        } else {
            selectedCards.push(index);
            cardElement.style.backgroundColor = 'lightgreen'; // Visual feedback for selection
        }
        // Show submit button if the correct number of cards are selected
        submitButton.style.display = selectedCards.length === game.currentBlackCard.blanks ? 'block' : 'none';
    }

    // Submit selected cards
    submitButton.onclick = () => {
        socket.emit('submitCards', selectedCards);
        selectedCards = []; // Reset selection
        handDiv.querySelectorAll('div').forEach(div => div.style.backgroundColor = ''); // Reset visual feedback
        submitButton.style.display = 'none'; // Hide submit button
    };
});

