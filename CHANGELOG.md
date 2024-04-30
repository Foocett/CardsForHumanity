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

# Keybinds
  - Rewrote admin menu closing keybind to remove deprecated code
  - Pack selection form can now be submitted with enter key
  - Pack selection can now be done with number buttons instead of clicking boxes
  - Card and form submission can now be done with the enter button and space button

# Bugfixes
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

# Visual Changes
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

# Themes
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

# Other
  - Refactored pack button and admin button names
  - Added a cookie to store last selected theme

# Known Issues
  - Despite major bugfixes in the last two updates mostly resolving the problem, the server does still occasionally crash when the last player disconnects
  - Card czar submit button isn't deactivated, clicking doesn't cause problems so only visual
  - Players joining after game starts are not properly dealt in and are stuck on waiting screen
  - Czar can be changed when new player joins

# Likely coming in next few update(s)
  - I will attempt to create a queue for players joining mid-game, storing on server and pushing info to clients only at the start of a round
    - Note for myself, make sure to check queue size when players leave so new turn starts instead of game restarting if there aren't enough players
  - Not likely soon but I might add a lobby system at some point
  - 