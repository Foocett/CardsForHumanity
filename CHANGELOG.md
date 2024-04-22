# CHANGELOG V1.1.1

## Overview
  - Added keybinds
  - Major and minor bugfixes

# Keybinds
  - Rewrote admin menu closing keybind to remove deprecated code
  - Pack selection form can now be submitted with enter key
  - Pack selection can now be done with number buttons instead of clicking boxes

# Bugfixes
  - Fixed bug where pack selection submitting was not activating/deactivating properly
  - Fixed bug where game breaks if all players leave
    - Problem arose as server tried to set player.czar property on nonexistent player object
    - As solution, game now resets (server runs Admin.nuke()) when no players are present in game

# Known Issues
  - Despite major bugfixes in the last two updates mostly resolving the problem, the server does still occasionally crash when the last player disconnects
  - Card czar submit button isn't deactivated, clicking doesn't cause problems so only visual
  - Players joining after game starts are not properly dealt in and are stuck on waiting screen

# Likely coming in next few updates
  - More keybinds for choosing and submitting cards, mice are for losers anyway lmao