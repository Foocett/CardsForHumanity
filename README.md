# CardsForHumanity V1.1.0
### __! If you're looking for rules on how to submit cards, they are at the bottom of this file !__

This is a personal project I decided to take on to help myself learn web development.
To be honest, I never thought I'd make it to this point, and I'm so excited to see where I can take it from here.
As of the most recent update, this project consists of ~2000 lines of code (closer to 3000 if you count extra files like card packs), 
and I owe a lot of thanks to my friends who showed interest in this stupid project of mine; it really helped me push through some of 
the tougher parts, because there were some moments when I didn't think I was going to be able to do it

To play the game, simply run the [main.js](main.js) file
By default, the admin password is "js is mid", however it is recommended that you change the admin password before hosting a game, this can be done in [config.json](config.json)
More information can be found about admin commands below

Local players can join by connecting to your computer's local IP on port 3000 (this can be changed manually in [main.js](main.js))

The following shell commands can be run to find your local and global IP addresses

**Mac/Linux**
```
ifconig
```
**Windows** 
```
ipconfig
```
If you want to play with people on a non-local network, you need to set up port forwarding on your router, I won't elaborate on how you do that, but it's pretty simple so just google it

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

# Dependencies

This project runs off of [Express](https://github.com/expressjs/expressjs.com),  [HTTP](https://nodejs.org/api/http.html), and [Socket.io](https://github.com/socketio/socket.io)

These can be installed with
```
npm install express http socket.io
``` 

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

# How to Submit Cards
this guide is for people who don't have a background in GitHub; if you already know what a pull request is, you're probably good to skip this

### 1. **Create a GitHub Account**
If you don't have one already, sign up at [GitHub](https://github.com).

### 2. **Fork the Repository**
- Navigate to the main repository page [here](https://github.com/Foocett/CardsForHumanity).
- Click the **Fork** button at the top right to create your own copy of the repository.

### 3. **Edit the JSON File**
- In your forked repository, navigate to the Packs folder and choose the json file you wish to edit.
- Click the file, then click the pencil icon (Edit) to start making changes.
- Be careful to maintain the formatting of the file, or else everything breaks
  - White cards are simply comma-separated string values surrounded in quotes; make sure the last card does **not** have a comma after it
```
{
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

### 4. **Commit Your Changes**
- After editing, scroll to the bottom of the page.
- Provide a brief description of your changes in the **Commit changes** box.
- Choose "Create a new branch for this commit and start a pull request," then click **Propose changes**.

### 5. **Open a Pull Request**
- On the new page, click **Create pull request**.
- Add a suitable title and a detailed description of your changes.
- Click **Create pull request** again to submit your changes for review.

### 6. **Await Approval**
 - There's Not a lot to say here; cards with content that contains slurs or other clearly malicious language will be removed
 - To clarify, this game is supposed to be crude and funny, but not at the expense of specific groups or people based solely on their nature.


# Known Issues
- Despite major bugfixes in the last two updates mostly resolving the problem, the server does still occasionally crash when the last player disconnects
- Card czar submit button isn't deactivated, clicking doesn't cause problems so only visual
- Players joining after game starts are not properly dealt in and are stuck on waiting screen

# Likely coming in next few update(s)
- More keybinds for choosing and submitting cards, mice are for losers anyway lmao
- Themes (maybe idk?)


# Final Words

Once again, huge thanks to everyone who's helped out with this; it means the world to me <3
