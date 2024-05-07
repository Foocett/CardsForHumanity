# CardsForHumanity V1.2.3
### __Suggest Features [HERE](https://forms.gle/wMJ3wAkWuBf9xk5c6)!__
### __Submit Cards [HERE](https://forms.gle/JD7iUcmttC9GB4gU6)!__ (Read submission rules at the bottom of this file before submitting)
_____

This is a personal project I decided to take on to help myself learn web development.
To be honest, I never thought I'd make it to this point, and I'm so excited to see where I can take it from here.
As of the most recent update, this project consists of ~2000 lines of code (closer to 3000 if you count extra files like card packs), 
and I owe a lot of thanks to my friends who showed interest in this stupid project of mine; it really helped me push through some of 
the tougher parts, because there were some moments when I didn't think I was going to be able to do it

# How To Play!
For help or assistance, contact me at ajfawcett@gmail.com

### 1) Download Node.js and run the installer
  - Download for Mac x64 [Here](https://nodejs.org/dist/v20.12.2/node-v20.12.2.pkg)
  - Download for Windows x64 [Here](https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi)
  - If you have trouble with those, view all download options [Here](https://nodejs.org/en/download)

### 2) Install The Latest Release From GitHub
  - Navigate to the latest release [Here]
  - (https://github.com/Foocett/CardsForHumanity(https://github.com/Foocett/CardsForHumanity/releases/tag/v1.1.0))

### 3) Scroll to the bottom and download src.zip, then unzip the file
<img width="1218" alt="Screenshot 2024-04-24 at 12 58 48 PM" src="https://github.com/Foocett/CardsForHumanity/assets/141191160/7408308c-a70f-425f-97a3-e958d8a7f354">

### 4) Open Terminal or Command Prompt
 - On Mac
   - Open spotlight search with command + space
   - Search for Terminal
 - On Windows
   - Open search with window key
   - Type "cmd" and hit enter

### 5) Navigate to Cards For Humanity Folder
- This process is basically the same on Windows and Mac
  - use the "cd" command (short for current directory) to navigate to the app folder
  - If the app folder is still in your Downloads folder, your command should look something like this
  - ```cd Downloads/CardsForHumanity-1.2.0 ```
  - More info about the cd command can be found [Here](https://tutorials.codebar.io/command-line/introduction/tutorial.html#:~:text=The%20cd%20command%20allows%20you,%24%20ls)

### 6) Run the server file
  - First make sure you have all dependencies installed
    - This project runs off of [Express](https://github.com/expressjs/expressjs.com),  [HTTP](https://nodejs.org/api/http.html), and [Socket.io](https://github.com/socketio/socket.io)
    - These can be installed with this command in terminal
      ```
      npm install express http socket.io
      ``` 
  - Once you're in the folder, run this command
  - ```Node Main.js```
  - If it worked it should return ```"Listening on *:3000```

### 7) Connect to the Server
  - Players can connect to the lobby by putting in your device's local IP address followed by :3000
  - To find your IP address, open a NEW instance of terminal (it won't work in the one you already have open) and run the following commands
  - Local players can join by connecting to your computer's local IP on port 3000 (this can be changed manually in [main.js](main.js))
    - Mac/Linux:  ```ifconig```
    - Windows: ```ipconfig```
  - You're going to see a lot of information when you do this, but the bit you're looking for is 'inet'; it should look something like this, somewhat near the top
    - <img width="437" alt="Screenshot 2024-04-24 at 1 42 32 PM" src="https://github.com/Foocett/CardsForHumanity/assets/141191160/b1d08fbc-7b50-44f5-91cf-78cf0fcfc74f">
  - The first number is the one we're after, and it's the address off the server that players need to connect to
  - In the case of that screenshot, the address you need to connect to will be ```172.16.53.216:3000```, connect to it like any other website by putting it in your browser search bar
  - Lucky for you, if you're the one hosting the server, you might be able to connect to the server by putting ```localhost:3000``` in your search bar, but all other players need to use the full IP
  - Keep in mind this only works for devices on the same Wi-Fi network as you, if you would like to play with people on different networks, you will have to set up a port forwarding rule on your router, this shouldn't be too technical, but I'll spare the details here because they're slightly different for every router; Google has very good guides on how to do it though.

### 8) Extra bits for server hosts
  - By default, the admin password is "js is mid", however it is recommended that you change the admin password before hosting a game, this can be done in [config.json](config.json), you can just open it in any text editor
More information can be found about admin commands below

Currently, this game doesn't have a proper form of player handling, as players cannot join or leave mid-game,
just make sure all players are connected before the game is started
The first player to join the lobby is the admin and has control over selected packs and starting the game
Note that this 'admin' is different that the admin commands, which are protected by a password set by the server host in [config.json](config.json)

# About
In its current state, this game has seven unique packs to play with; here's a brief rundown of them all

[Autism Pack](Packs/autismPack.json)
 - I added this one for personal reasons, I am diagnosed with ASD (autism spectrum disorder), and I think it plays a really big role in who I am as a person, so I wanted to add a pack that's targeted specifically towards people like me. At the moment, it's the smallest pack, but I plan on working on it soon.

[Base Pack](Packs/basePack.json)
 - This is really just the general pack for whatever stupid ideas I might have. There aren't really any rules for this pack.

[Brainrot Pack](Packs/brainrotPack.json)
 - This is by far the stupidest pack I have. It speaks for itself, and I will not elaborate.

[Dutch Pack](Packs/dutchPack.json)
 - I can't go into too much detail, but this pack is pretty much just inside jokes from my high school; it's best if you ignore this one.

[Festival Pack](Packs/festivalPack.json)
 - This pack was created by my friend and me, who share an interest in EDM music and whatnot.

[STEM Pack](Packs/stemPack.json)
 - This pack is for anything STEM-related. Personally, I'm a massive nerd who loves programming, math, engineering, etc., so I made this pack to contain all my obscure nerd jokes.

[Woke Pack](Packs/wokePack.json)
 - This pack contains anything that could be political in nature. Personally, I'm a pretty openly progressive person, which definitely shows in some of the cards, but I definitely don't mind bashing both political parties.


# Rules

The rules function exactly as they do in Cards Against Humanity, the only notable difference being the hand size of ten instead of seven

Further explanation of the CAH rules can be found [HERE](https://s3.amazonaws.com/cah/CAH_Rules.pdf).

Additionally, this version of the game has a wagering system.
 - Players can set their wager value to some number no less than 1 and no greater than their current score.
 - When a card is selected at the end of the round, the winning player's score will be increased by their wager value.
 - All losing players' scores are reduced by their wager values minus one, so wagers of one do not see score reductions.

# Admin Commands
Admin commands were added in v1.1.0
Here is a brief list of all of them 

### Nuke Game
 - This command effectively restarts the server, reverting all global variables back to their initial state and force-reloading all players
 - Inputs:
   - None
### Set Score
 - This command allows a specified player's score to be manually set
 - Inputs:
   - Player Name : String
   - Score Value : Number
### Kick Player
  - This command allows a specified player to be kicked and banned from the lobby until the game is reloaded (see Nuke Game)
  - Inputs: 
    - Player Name : String
### Force Next Turn
  - This command automatically begins the submission phase of the next round, useful for players disconnecting mid-round
  - Inputs:
    - None
### Dump Hand
  - This command allows a specified player's hand to be completely refreshed
  - Inputs:
    - Player : String
### Warn Player
  - This command sends a browser alert to all specified players
  - Inputs:
    - Players : String (comma separated)
        - ``"PlayerFoo, PlayerBar"`` 
        - (note the space after the comma, that's important)
    - Message : String
### Warn Lobby
  - This command Functions exactly the same as warn player, however the message is sent to the whole lobby
  - Inputs:
      - Message : String

# How to Add Your Own Cards
In order to get a card into the main game, use the card submission form at the top of this file, if you want to add your own private card pack 
though, here are some brief instructions
### 1. **Download a version newer than 1.2.0
### 2. **Edit the JSON File**
- Navigate to the Packs folder in your text editor of choice and choose the json file you wish to edit, or create a new file.
- Be careful to maintain the formatting of the file, or else everything breaks
- If you're creating a new file, paste this skeleton into your empty JSON file
- ```
    {
      "packName": "",
      "whiteCards": [
    
      ],
      "blackCards": [
      ]
    }
  ```
- White cards are simply comma-separated string values surrounded in quotes; make sure the last card does **not** have a comma after it
```
  "whiteCards": [
    "card text",
    "other card text",
    "final card text"
  ],
```
  - Black cards are a bit trickier, as they contain two properties and thus are formatted as objects
```
  "blackCards": [
    {
     "text": "black card text",
     "blanks": 1
    },
    {
     "text": "other black card text",
     "blanks": 1
    },
    {
     "text": "final black card text",
     "blanks": 1
    }
  ]
}
```
  - Funny enough, the game actually does not currently support cards with more than one blank, so idk why I even formatted it like that lol

# Known Issues
- Players joining after game starts are not properly dealt in and are stuck on waiting screen

# Likely coming in next few update(s)
- Waiting player queue

# Final Words

Once again, huge thanks to everyone who's helped out with this; it means the world to me <3
