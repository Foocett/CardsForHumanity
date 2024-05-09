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
