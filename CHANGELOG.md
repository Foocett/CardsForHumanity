# CHANGELOG V1.1.0

## Overview
  - Added admin window
  - Added Admin Commands
  - Major bugfixes with player handling
  - Changed username requirements
  - Added cards as usual (this will never not be here lol)
  - Revamped [README.md](README.md) a lil bit, I think it looks a lot better now


# Admin Window
  - Added the admin window and password protection, found in [config.json](config.json)
  - The admin window is literally just a clone of the pack selection window but yeah

# Admin Commands

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

# Other Bugfixes
  - Fixed bug where players leaving causes server crash (idk how it took me this long to fix, it was one line)
  - Fixed a bug that arose while implementing admin features where game does not correctly track player counts
  - Made it so that socket.on("disconnect") is only active when socket.id has been initialized as a player object before
  - Fixed a bug so that admin role can be reassigned if player count reaches zero