# Primer
Mini-game for mental arithmetic training. Find all prime factors of the central number!

# The game
You can play the game here!
https://alexandrix.com/primer

# Developer information
* The **main** branch is deployed manually at https://alexandrix.com/primer
* The **dev** branch is deployed automatically at https://andrixdev.github.io/primer/

# Developer setup
* Install Node (https://nodejs.org/)
* Install npm (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* Install Git (https://git-scm.com/downloads)
* Clone this repository on your machine
* Open *index.html*

# Compiling LESS into CSS with Visual Studio Code
* Install the Easy LESS extension (by mrcrowl)
* All .less files are automatically compiled to CSS on file save

# Compiling LESS into CSS without Visual Studio Code
* Install the LESS preprocessor (https://lesscss.org/usage/)
* Run **lessc less/main.less css/main.css && lessc less/variables.less css/variables.css**
* Run **lessc less/modules/helpers.less css/helpers.css && lessc less/modules/items.less css/items.css**
* Now your can see your updated CSS

# Improvements and new features backlog (ordered)
* Move sound samples from DOM to Web Audio API
* Try to recreate bug where asked number in bottom bar is different from the central number (the number that then works is the one asked in the bottom bar)
* Swipe between menus
* Improve overall UX and game design
* Create logo & add favicons
* Handle all display sizes up to 4K
* Move .mp3 samples to .ogg
* Bell sounds saturate on phone speakers

# Discussion
* Create new sounds according to new overall game design with different instruments or textures
* XP up sounds that don't interfere
* Change each prime square size (move from a square radius of 3 to 2, orbit 1 size from 4x4 to 3x4)
* Upgrade to FMOD to handle audio logic if it becomes more complex
* Set up a Discord server
