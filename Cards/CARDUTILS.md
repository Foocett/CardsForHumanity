# Card Utils
### Card utils are part of a feature added in the 1.2 update when card handling as a whole was reworked
- To preface, using these will require you to know how to run a python file, if you're stuck, just google it
- Originally, card packs were based on independent JSON files, which was really annoying, and it made adding cards overly difficult
- As a solution I merged all cards into a single JSON file [(this one)](cards.json) with a more standard notation
- Now, technically, this file is more verbose, however I created [addCardUtil](addCardUtil.py) which should make creating cards much faster
- To clarify, the card submission form in the readme file still exists, and it is for cards that should be added to the main game
- the Add Card Utility is designed for users who want to add their own personal cards such as inside jokes that would not be public
- I put zero effort into idiot-proofing this thing so just don't do anything dumb
## Add Card Util
- As mentioned, [Add Card Util](addCardUtil.py) is a tool to add cards much faster
- Not gonna like, I wrote the whole skeleton in HTML then had ChatGPT make that in tktinker
- The UI is super simple and there is a very low chance that I'm gonna change that, cry about it
- The add card util posts cards to [cards.json](cards.json), as well as [userSubmittedCards.json](userSubmittedCards.json)
- The secondary file was a slightly later addition that has to do with the [JSON Merge Util](jsonMergeUtil.py)
## JSON Merge Util
- I created [JSON Merge Util](jsonMergeUtil.py) to make transferring user-created cards across different versions much smoother
- Because [userSubmittedCards.json](userSubmittedCards.json) exists, users should be able to merge previously created cards to new versions when they are released
- Once again, I put no effort into idiot-proofing, for the love of god, don't go importing random JSON files
- 

## In the Future
  - This might still be up for change, and this game is still in its early phases
  - There's a small chance I'll compile it down into an executable form, but I tried once already, and it didn't go well so yeah
  - If you have ideas for how this can be improved, contact me at ajfawcett@gmail.com or through the feature request form in README.md