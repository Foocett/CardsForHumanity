document.addEventListener('DOMContentLoaded', function() {
    console.log("stuff is happening");
    const socket = io(); // Connect to the server
    const gameInfo = document.getElementById('game-info');
    const handDiv = document.getElementById('hand');
    const submitButton = document.getElementById('submit-cards');

    let selectedCards = []; // Track selected cards for submission

    // Listen for game state updates
    socket.on('gameState', (state) => {
        // Update the game info display based on the received state
        gameInfo.textContent = `Current Czar: ${state.currentCzar}. Phase: ${state.gamePhase}`;
        // More detailed state handling here...
    });

    // Listen for updates to the player's hand
    socket.on('updateHand', (hand) => {
        handDiv.innerHTML = ''; // Clear current hand display
        hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.textContent = card.text;
            cardElement.onclick = () => selectCard(index, cardElement);
            handDiv.appendChild(cardElement);
        });
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

    // Additional listeners and functions as needed...
});
