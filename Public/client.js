let handElements = []

document.addEventListener('DOMContentLoaded', function() {
    console.log("connected");
    let username = prompt("Please enter your username:");
    while (username === null || username.trim() === "") {
        alert("You must enter a username to continue.");
        username = prompt("Please enter your username:");
    }
    const socket = io(); // Connect to the server
    let self;
    let hand = []; // Track selected cards for submission
    let testHeader = document.getElementById("test-header");
    socket.emit('requestPlayerData', username, (response) => {
        self = response.rawPlayerInfo
    });
    testHeader.textContent = "hand";
});

for(let i = 1; i<=7; i++){
    handElements.push(document.getElementById("white-card-"+i))
    console.log(handElements);
}

// Function to handle card selection
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


