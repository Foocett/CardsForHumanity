# CHANGELOG V1.2.0      

## Overview
  - Added keybinds
  - Major and minor bugfixes
  - Small Visual Changes

# Keybinds
  - Rewrote admin menu closing keybind to remove deprecated code
  - Pack selection form can now be submitted with enter key
  - Pack selection can now be done with number buttons instead of clicking boxes

# Bugfixes
  - Fixed bug where pack selection submitting was not activating/deactivating properly
  - Fixed bug where game breaks if all players leave
    - Problem arose as server tried to set player.czar property on nonexistent player object
    - As solution, game now resets (server runs Admin.nuke()) when no players are present in game
  - Fixed bug where wager could be set to a negative value
  - Fixed bug where wager could be changed after card was submitted
  - Fixed bug to that wager value is reset on card submission
  - Fixed bug where Admin.setScore() set player score to a string value

# Visual Changes
 - Added top border to page footer
 - Changed card submission container to scroll on overflow
 - Changed player/score container to scroll on overflow

# Known Issues
  - Despite major bugfixes in the last two updates mostly resolving the problem, the server does still occasionally crash when the last player disconnects
  - Card czar submit button isn't deactivated, clicking doesn't cause problems so only visual
  - Players joining after game starts are not properly dealt in and are stuck on waiting screen
  - Czar can be changed when new player joins

# Likely coming in next few update(s)
  - More keybinds for choosing and submitting cards, mice are for losers anyway lmao
  - Themes (maybe idk?)
  - I will attempt to create a queue for players joining mid-game, storing on server and pushing info to clients only at the start of a round
    - Note for myself, make sure to check queue size when players leave so new turn starts instead of game restarting if there aren't enough players