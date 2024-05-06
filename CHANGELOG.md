# CHANGELOG V1.2.2

## HOTFIX
  - Turns out the pack selection introduced in 1.2.0 just didn't work and I was completely unaware
  - Due to an incorrectly placed 'i++', packs were determined by the number of checked boxes which ones were checked
  - This has now been fixed

## Other Changes
  - The brainrot pack now has a 'subway surfers card', the background of which is a gif of subway surfers gameplay
  - 'Light' and 'dark' categories removed from theme dropdown, it was a little too ambiguous

# CHANGELOG V1.2.1

## Visual Changes
  - Added effect on text box select
  - Added effect on checkboxes
  - Other minor visual bugfixes

## Other Changes
  - Chat can be focused with "/"
  - Added duplicate username validation

## Bugfixes
  - I think I finally fixed the server crashing issue when players leave oh my god

# CHANGELOG V1.2.0      

## Overview
  - Added keybinds
  - Major and minor bugfixes
  - Complete visual overhaul
  - Added themes
  - Added theme cookie
  - Complete change in how cards are handled
  - Card packs now have a pack name property
  - Clicking on a selected card now deselects it

## Keybinds
  - Rewrote admin menu closing keybind to remove deprecated code
  - Pack selection form can now be submitted with enter key
  - Pack selection can now be done with number buttons instead of clicking boxes
  - Card and form submission can now be done with the enter button and space button

## Bugfixes
  - Fixed bug where pack selection submitting was not activating/deactivating properly
  - Fixed bug where game breaks if all players leave
    - Problem arose as server tried to set player.czar property on nonexistent player object
    - As solution, game now resets (server runs Admin.nuke()) when no players are present in game
  - Fixed bug where wager could be set to a negative value
  - Fixed bug where wager could be changed after card was submitted
  - Fixed bug to that wager value is reset on card submission
  - Fixed bug where Admin.setScore() set player score to a string value
  - Fixed bug where submit button wasn't deactivating properly
  - Fixed "bug" (my stupidity) where wager values were reset prematurely
  - Fixed a bug where cards would be submitted with enter key while chat box was focused
  - Fixed a bug where cards would wrap when a winner is chosen
  - Fixed a bug where submit button would be disabled when other players submit cards

## Visual Changes
 - Added top border to page footer
 - Changed card submission container to scroll on overflow
 - Changed player/score container to scroll on overflow
 - Complete color overhaul, background is now based on a single gradient on the body object
 - Changed player score objects to take on a transparent color instead of hard coded grey
 - Added button design, will be changing color soon dw (update I did)
 - Changed pack and admin overlays to rely on same color as body gradient
 - Moved bug report button to footer
 - Made the buttons not ugly
 - Added theme functionality
 - Pack buttons now layout differently in game staring overlay

## Themes
  - Added Default Dark
  - Added Light Default
  - Added Sunset
  - Added Peach
  - Added Cold Steel
  - Added Grape
  - Added Cotton Candy
  - Added Charcoal
  - Added Clear Skies
  - Added Seafoam
  - Added Rosé
  - Added Blue Whale

## Other
  - Refactored pack button and admin button names
  - Added a cookie to store last selected theme

## Known Issues
  - Despite major bugfixes in the last two updates mostly resolving the problem, the server does still occasionally crash when the last player disconnects
  - Players joining after game starts are not properly dealt in and are stuck on waiting screen
  - Czar can be changed when new player joins

# Likely coming in next few update(s)
  - I will attempt to create a queue for players joining mid-game, storing on server and pushing info to clients only at the start of a round
    - Note for myself, make sure to check queue size when players leave so new turn starts instead of game restarting if there aren't enough players
  - Not likely soon but I might add a lobby system at some point



# v1.1.0

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