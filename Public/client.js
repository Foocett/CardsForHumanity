document.addEventListener('DOMContentLoaded', function() {
    console.log("connected");
    const username = prompt("Please enter your username:");
    const socket = io(); // Connect to the server
    let self;
    let hand = []; // Track selected cards for submission
    let testHeader = document.getElementById("test-header");
    if (username !== null && username.trim() !== "") {
        socket.emit('requestPlayerData', username, (response) => {
            self = response.rawPlayerInfo
            socket.emit("received")
        });
        testHeader.textContent = "hand";
    } else {
        // Handle case where user does not input a name
        alert("You must enter a username to continue.");
        window.location.reload(); // Reload the page or redirect as needed
    }
});



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


