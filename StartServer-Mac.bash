#!/bin/bash

# Check for Command Line Tools for Xcode
if ! xcode-select -p &> /dev/null; then
  echo "Installing Command Line Tools for Xcode..."
  xcode-select --install
  read -p "Press enter once installation is complete" # Wait for user to confirm installation
fi

# Function to install Node.js using nvm
install_node() {
  echo "Installing Node.js..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # Load nvm
  nvm install node # Install the latest version of node
  nvm use node
}

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed."
    install_node
else
    echo "Node.js is already installed."
fi

# Run main.js file
node main.js &
pid=$! # Process ID of the node command

# Get and print the local IP address
local_ip=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
echo "Your local IP address is: $local_ip"

# Get and print the public IP address
public_ip=$(curl -s https://icanhazip.com)
echo "Your public IP address is: $public_ip"

# Instructions to terminate the program
echo "To terminate the program, type 'kill $pid' or press CTRL+C in this terminal."

# Wait for the node process to complete in case the user does not terminate it manually
wait $pid
