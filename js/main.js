// Game - Globals
let numberToGuess
let ntgDecomposition, ntgDecompositionLeftToFind, ntgFound
let primes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321
]
let level, xp, orbit = 1
let log = console.log

// Game - Math
let decompose = (n) => {
  let i = 0,
      stop = false,
      iMax = 1000,
      testedPrimeIndex = 0,
      testedPrime = primes[0],
      quotient = n,
      factors = []
  
  while (!stop) {
    // Final step
    if (quotient == testedPrime) {
      factors.push(quotient)
      stop = true
    }
    // Square root of n reached
    else if (factors.length == 0 && testedPrime > Math.sqrt(n)) {
      factors.push(n)
      stop = true
    }
    // Match with current prime
    else if (quotient % testedPrime == 0) {
      factors.push(testedPrime)
      quotient /= testedPrime
    }
    // No match, check next prime
    else {
      testedPrimeIndex++
      if (testedPrimeIndex < primes.length) {
        testedPrime = primes[testedPrimeIndex]
      }
    }
    
    i++
    if (i > 1000) {
      stop = true
      log('No prime found for number ' + n + 'within ' + iMax + ' attempts.')
    }
  }
  
  return factors
}

// Game - Mechanics
let orbitLevels = [1, 16, 40, 72, 112, 160, 216]
let pickedMenuLevel = 50
let gameMode = "exploration"
let changeGameMode = (mode) => {
  if (mode == "exploration") gameMode = "exploration"
  else if (mode == "workout") gameMode = "workout"
  else {
    console.error("Game mode '" + mode + "' in changeGameMode() does not exist.")
    return false
  }
  UI.updateInfoArea()
}
let handleClickOnPrime = (event) => {
  if (UI.freezeUIinteraction) return false
  
  // Get selected prime info
  let selectCount = event.target.getAttribute('data-select-count')
  let prime = Number(event.target.innerText)
  if (ntgDecompositionLeftToFind.includes(prime)) {
    // Increase counter for this prime
    selectCount++
    event.target.setAttribute('data-select-count', selectCount)
    
    // Remove prime from current remaining decomposition array
    let ltf = ntgDecompositionLeftToFind
    let found = ltf.splice(ltf.indexOf(prime), 1) // Remove and save in found
    ntgFound.push(found[0])
    
    // If empty, you found all of them!
    if (ltf.length == 0) {
      handleCorrect()
    }
  } else {
    handleIncorrect()
  }
  
  UI.updateFeedbackText()
}
let handleCorrect = () => {
  // Grant XP in exploration mode
  if (gameMode == "exploration") {
    let ggXP = 0
    ggXP = 5
    addXP(ggXP)
  } else if (gameMode == "workout") {
    // Update completion
    currentWorkout.completion[step] = true
    
    // Increase workout step and progression
    step++
    UI.updateStepBar()
  }
  
  // Play sound
  Aud.play('correct')
  
  // Prepare callback (nextAction) for after animation
  let nextAction, shuffle
  if (gameMode == "exploration") {
    if (level < maxLevel) {
      nextAction = generate // New random number
      shuffle = 'shuffle'
    } else {
      nextAction = endExploration
      shuffle = 'noshuffle'
    }
  } else if (gameMode == "workout") {
    if (step < currentWorkout.sequence.length) {
      // Workout next level
      nextAction = () => {
        let newNumber = currentWorkout.sequence[step] // Next number in workout sequence!
        UI.updateInfoArea()
        generate(newNumber)
      }
      shuffle = 'shuffle'
    } else if (step == currentWorkout.sequence.length) {
      // Workout end
      nextAction = endWorkout
      shuffle = 'noshuffle'
    }
  }
  
  UI.endAnimation('win', shuffle, nextAction)
}
let handleIncorrect = () => {
  // Grant (negative) XP in exporation mode
  if (gameMode == "exploration") {
    let erfXP = 0
    erfXP = -1
    addXP(erfXP)
  }
  
  // Play sound
  Aud.play('incorrect')
  
  // Prepare next action for after animation
  let nextAction
  if (gameMode == "exploration") nextAction = generate // Random number
  else if (gameMode == "workout") nextAction = () => { // Repeat same number in sequence
    // Fill-in with same sequence number
    let newNumber = currentWorkout.sequence[step]
    generate(newNumber)
  }
  
  // Launch animation with callback
  UI.endAnimation('lose', 'shuffle', nextAction)
}

// Game - Exploration mode XP and level
let maxLevel = primes.length - 1
let levelXPinterval = (lvl) => {
  return {
    start: Math.floor(2 * Math.pow(2 * lvl, 1.5)),
    end: Math.floor(2 * Math.pow(2 * (lvl + 1), 1.5))
  }
}
let maxXP = levelXPinterval(maxLevel).end
let getLevelOrbit = (lvl) => {
  if (lvl < 1) { log("Error in getLevelOrbit: level inferior to 1") }
  return lvl < orbitLevels[1] ? 1 : (lvl < orbitLevels[2] ? 2 : (lvl < orbitLevels[3] ? 3 : (lvl < orbitLevels[4] ? 4 : (lvl < orbitLevels[5] ? 5 : 6))))
}
let getLevelFromNumber = (nb) => {
  return primes.filter((el) => {
    return el <= nb + 1
  }).length - 1
}
let addXP = (newXP) => {
  let interval = levelXPinterval(level)
  
  // newXP can be negative, minimum should be start of level
  xp = Math.max(interval.start, xp + newXP)
  
  // Check potential level up
  if (xp >= interval.end) {
    levelUp()
    interval = levelXPinterval(level)
  }
  
  // If higher than maximal xp, cap
  xp = Math.min(xp, maxXP)
  
  UI.updateXpBar()
}
let changeLevelTo = (newLevel) => {
  level = newLevel
  
  // Enable playable primes
  UI.unveilPrimes()
  
  // Update top info
  UI.updateInfoArea()
  
  // Keep track of orbit
  orbit = getLevelOrbit(level)
}
let levelUp = () => {
  if (level < maxLevel) {
    changeLevelTo(level + 1)
  }
}
let startExploration = (lvl) => {
  resetWorkout()
  changeGameMode("exploration")
  start(lvl)
  generate()
}
let resetExploration = () => {
  xp = 0
}
let endExploration = () => {
  UI.fillOverlayUI(dom.templates.gameOver)
  // Back to exploration debuts (in case button is not clicked and menu is closed)
  resetExploration()
  startExploration(1)
}

// Game - Workout mode
let workouts = [{
  name: "Toddler",
  id: 1,
  sequence: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  completion: [],
  maxPrimeLevel: 6,
  difficulty: undefined
}, {
  name: "Orbit one",
  id: 2,
  sequence: [2, 9, 49, 13, 15, 22, 30, 36, 43, 42, 32, 53],
  completion: [],
  maxPrimeLevel: 15,
  difficulty: undefined
}, {
  name: "Small pie",
  id: 3,
  sequence: [3, 14, 15, 92, 65, 35, 89, 79, 32, 38, 46, 26, 43, 38, 32, 79, 50, 28, 84, 19, 71, 69, 39, 93, 75, 10],
  completion: [],
  maxPrimeLevel: 39,
  difficulty: undefined
}, {
  name: "Big pie",
  id: 4,
  sequence: [3, 14, 159, 265, 358, 97, 93, 238, 46, 264, 338, 327, 95, 0288, 41, 97, 169, 39, 93, 75, 105, 82, 097, 49, 44, 59, 230, 78, 164, 062, 86, 208, 99, 86, 280, 348, 253, 42, 117, 067, 98],
  completion: [],
  maxPrimeLevel: 71, 
  difficulty: undefined
}, {
  name: "Ghis",
  id: 5,
  sequence: [411, 311, 211, 111, 11, 13, 113, 213, 313, 413, 417, 317, 217, 117, 17, 19, 219, 319, 419, 421, 411],
  completion: [],
  maxPrimeLevel: 111,
  difficulty: undefined
}, {
  name: "Akanaka",
  id: 6,
  sequence: [8, 11, 101, 111, 121, 212, 232, 323, 353, 373, 414, 484, 515, 525, 636, 696, 747, 757],
  completion: [],
  maxPrimeLevel: 159,
  difficulty: undefined
}, {
  name: "Dubos",
  id: 7,
  sequence: [53, 653, 53, 753, 153, 853, 253, 953, 353, 1053, 453, 1153, 553, 1253],
  completion: [],
  maxPrimeLevel: primes.length - 1,
  difficulty: undefined
}]
let step
let prepareWorkouts = () => {
  workouts.forEach((w) => {
    // Compute difficulty
    let sum = 0
    w.sequence.forEach((value) => sum += value)
    let average = sum / w.sequence.length
    w.difficulty = getLevelFromNumber(Math.round(average))
    
    // Init completion array with falses
    w.sequence.forEach(() => w.completion.push(false))
  })
  
  // Re-order workouts by ascending difficulty
  workouts.sort((w1, w2) => w1.difficulty > w2.difficulty)
}
let currentWorkout = workouts[0]
let startWorkout = (id) => {
  resetExploration()
  changeGameMode("workout")
  resetWorkout()
  
  // Select workout
  currentWorkout = workouts.filter((w) => {
    return w.id == id
  })[0]
  let cw = currentWorkout
  log("Starting workout " + cw.id + " named " + cw.name + "!")
  
  // Start with first sequence number!
  start(cw.maxPrimeLevel) // Display all necessary primes (maxPrimeLevel config)
  generate(cw.sequence[0])
}
let resetWorkout = () => {
  currentWorkout.completion.forEach((el) => { el = false }) // Reset completion
  step = 0
  UI.updateStepBar()
}
let endWorkout = () => {
  UI.fillOverlayUI(dom.templates.workoutComplete)
  // Back to exploration debuts (in case button is not clicked and menu is closed)
  resetWorkout()
  startExploration(1)
}

// DOM and UI
let dom = {
  body: document.getElementsByTagName('body')[0],
  overlay: document.getElementById('screen-overlay'),
  templates: {
    landing: document.getElementById('landing-template'),
    menu: document.getElementById('menu-template'),
    gameOver: document.getElementById('game-over-template'),
    workoutComplete: document.getElementById('workout-complete-template')
  },
  menu: document.getElementById('menu'),
  infoContent: document.getElementById('info-content'),
  playArea: document.getElementById('play-area'),
  numberContainer: document.getElementById('number-container'),
  ntg: document.getElementById('number-to-guess'),
  primeContainer: document.getElementById('prime-container'),
  primes: undefined,
  feedbackContainer: document.getElementById('feedback-container'),
  feedback: document.getElementById('feedback'),
  xp: document.getElementById('xp-bar'),
  stepBar: document.getElementById('step-bar'),
  gameOverRestart: document.getElementById('game-over-restart'),
  workoutCompleteRestart: document.getElementById('workout-complete-restart'),
  submenuModeSelector: document.getElementById('submenu-mode-selector'),
  submenuModeName: document.getElementById('submenu-mode-name'),
  submenus: {
    exploration: {
      submenu: document.getElementById('submenu-exploration'),
      levelPicker: {
        minus: document.querySelector('#menu-content #level-picker #minus'),
        plus: document.querySelector('#menu-content #level-picker #plus'),
        picked: document.querySelector('#menu-content #level-picker #picked-level')
      }
    },
    workouts: {
      submenu: document.getElementById('submenu-workouts'),
      list: document.getElementById('submenu-workout-list')
    },
    settings: {
      submenu: document.getElementById('submenu-settings'),
      audioMuteToggle: document.getElementById('audio-mute-toggle'),
      audioMuteInfo: document.getElementById('audio-mute-info')
    }
  }
}
let UI = {}
let explorationMenuLevels = [1, 10, 20, 30]
UI.freezeUIinteraction = false
UI.menuIsOpen = false
UI.fillOverlayUI = (newTemplateNode) => {
  dom.body.append(dom.overlay.firstElementChild)
  dom.overlay.appendChild(newTemplateNode)
  dom.overlay.className = '' // Removes potential .hidden class
}
UI.scrollToCenter = () => {
    document.body.scrollTo(1/2 * (dom.playArea.clientWidth - document.body.clientWidth), 1/2 * (dom.playArea.clientHeight - document.body.clientHeight))
}
UI.openMenu = () => {
  UI.fillOverlayUI(dom.templates.menu)
  dom.overlay.className = ''
  dom.body.className = 'frozen' // for scroll
  dom.menu.classList = 'open'
  UI.menuIsOpen = true
}
UI.closeMenu = () => {
  dom.overlay.className = 'hidden'
  dom.body.className = ''
  dom.menu.classList = 'closed'
  UI.menuIsOpen = false
  UI.scrollToCenter()
}
UI.submenuGameMode = "exploration" // This is toggled independenly from actual gameMode
UI.updateSubmenuGameMode = (gameModeName) => {
  // Hide all
  dom.submenus.exploration.submenu.className = "submenu hidden"
  dom.submenus.workouts.submenu.className = "submenu hidden"
  dom.submenus.settings.submenu.className = "submenu hidden"
  // Display only the chosen one
  if (gameModeName == "exploration") {
    dom.submenuModeName.innerHTML = "EXPLORATION"
    dom.submenus.exploration.submenu.className = "submenu"
  } else if (gameModeName == "workout") {
    dom.submenuModeName.innerHTML = "WORKOUTS"
    dom.submenus.workouts.submenu.className = "submenu"
  } else if (gameModeName == "settings") {
    dom.submenuModeName.innerHTML = "SETTINGS"
    dom.submenus.settings.submenu.className = "submenu"
  }
  UI.submenuGameMode = gameModeName
}
UI.initWorkoutsSubmenu = () => {
  // Update UI workout descriptions
  let markup = ""
  workouts.forEach((w) => {
    markup += '<button data-workout-id="' + w.id + '" class="btn"><strong>' + w.name + '</strong> <span>(&#9876; ' + w.difficulty + ')</span></button>'
  })
  dom.submenus.workouts.list.innerHTML = markup
}
UI.initExplorationSubmenu = () => {
  // Exploration jump-to-level buttons
  Array.from(document.getElementsByClassName('jump-to-level')).forEach((el, index) => {
    let lvl = explorationMenuLevels[index]
    el.innerHTML = index == 0 ? "Restart game" : "Jump to level " + lvl
  })
}
UI.initListeners = () => {
  // Tap to start
  document.getElementById('landing-content').addEventListener('click', () => {
    if (UI.freezeUIinteraction) return false
    dom.overlay.className = 'hidden'
    UI.scrollToCenter()
  })
  
  // Menu toggle mechanics
  dom.menu.addEventListener('click', () => {
    if (UI.freezeUIinteraction) return false
    if (!UI.menuIsOpen) {
      UI.openMenu()
    } else {
      UI.closeMenu()
    }
  })
  
  // Submenu toggle mechanics
  dom.submenuModeSelector.addEventListener('click', () => {
    if (UI.freezeUIinteraction) return false
    if (UI.submenuGameMode == "exploration") UI.updateSubmenuGameMode("workout")
    else if (UI.submenuGameMode == "workout") UI.updateSubmenuGameMode("settings")
    else if (UI.submenuGameMode == "settings") UI.updateSubmenuGameMode("exploration")
  })
  
  // Submenus
  UI.initExplorationSubmenuListeners()
  UI.initWorkoutsSubmenuListeners()
  UI.initSettingsSubmenuListeners()
  
  // Game over and workout complete restart buttons
  dom.gameOverRestart.addEventListener('click', () => {
    if (UI.freezeUIinteraction) return false
    startExploration(1)
    UI.closeMenu()
  })
  dom.workoutCompleteRestart.addEventListener('click', () => {
    if (UI.freezeUIinteraction) return false
    startWorkout(currentWorkout.id)
    UI.closeMenu()
  })
}
UI.initExplorationSubmenuListeners = () => {
  // Exploration jump-to-level buttons
  Array.from(document.getElementsByClassName('jump-to-level')).forEach((el, index) => {
    let lvl = explorationMenuLevels[index]
    el.addEventListener('click', () => {
      if (UI.freezeUIinteraction) return false
      startExploration(lvl)
      UI.closeMenu()
    })
  })
  
  // Exploration level picker final buttons
  UI.updatePickedMenuLevel()
  // Minus button
  let minusTimeout, minusInterval, minusDown = false
  let onMinusDown = () => {
    minusDown = true
    minusTimeout = setTimeout(() => {
      if (minusDown) {
        minusInterval = setInterval(() => {
          pickedMenuLevel--
          pickedMenuLevel = Math.max(1, pickedMenuLevel)
          UI.updatePickedMenuLevel()
        }, 40) // Increase rapidly
      }
    }, 200) // Start after some tap/click duration
  }
  let onMinusUp = () => {
    if (minusDown) {
      clearTimeout(minusTimeout)
      clearInterval(minusInterval)
      pickedMenuLevel--
      pickedMenuLevel = Math.max(1, pickedMenuLevel)
      UI.updatePickedMenuLevel()
    }
    minusDown = false
  }
  let onMinusOut = () => {
    minusDown = false
    clearTimeout(minusTimeout)
    clearInterval(minusInterval)
  }
  dom.submenus.exploration.levelPicker.minus.addEventListener('pointerdown', onMinusDown)
  dom.submenus.exploration.levelPicker.minus.addEventListener('pointerup', onMinusUp)
  dom.submenus.exploration.levelPicker.minus.addEventListener('pointerout', onMinusOut)
  // Plus button
  let plusTimeout, plusInterval, plusDown = false
  let onPlusDown = () => {
    plusDown = true
    plusTimeout = setTimeout(() => {
      if (plusDown) {
        plusInterval = setInterval(() => {
          pickedMenuLevel++
          pickedMenuLevel = Math.min(maxLevel, pickedMenuLevel)
          UI.updatePickedMenuLevel()
        }, 40) // Increase rapidly
      }
    }, 200) // Start after some tap/click duration
  }
  let onPlusUp = () => {
    if (plusDown) {
      clearTimeout(plusTimeout)
      clearInterval(plusInterval)
      pickedMenuLevel++
      pickedMenuLevel = Math.min(maxLevel, pickedMenuLevel)
      UI.updatePickedMenuLevel()
    }
    plusDown = false
  }
  let onPlusOut = () => {
    plusDown = false
    clearTimeout(plusTimeout)
    clearInterval(plusInterval)
  }
  dom.submenus.exploration.levelPicker.plus.addEventListener('pointerdown', onPlusDown)
  dom.submenus.exploration.levelPicker.plus.addEventListener('pointerup', onPlusUp)
  dom.submenus.exploration.levelPicker.plus.addEventListener('pointerout', onPlusOut)
  // Central button
  dom.submenus.exploration.levelPicker.picked.addEventListener('click', () => {
    if (UI.freezeUIinteraction) return false
    startExploration(pickedMenuLevel)
    UI.closeMenu()
  })
}
UI.initWorkoutsSubmenuListeners = () => {
  document.querySelectorAll('button[data-workout-id]').forEach((el) => {
    el.addEventListener('click', () => {
      if (UI.freezeUIinteraction) return false
      let id = Number(el.getAttribute('data-workout-id'))
      startWorkout(id)
      UI.closeMenu()
    })
  })
}
UI.initSettingsSubmenuListeners = () => {
  dom.submenus.settings.audioMuteToggle.addEventListener('click', () => {
    Aud.muted = !Aud.muted
    dom.submenus.settings.audioMuteToggle.innerHTML = (Aud.muted ? "Unmute" : "Mute") + " audio"
    dom.submenus.settings.audioMuteInfo.innerHTML = "Audio " + (Aud.muted ? "muted" : "unmuted")
  })
}
UI.generatePrimesNodes = () => {
  // This method should be called just once at game start
  // Model: <div class="prime hidden" data-select-count="0"><p>2</p></div>
  
  // Clear prime divs in case of restart
  //dom.primeContainer.innerHTML = ""
  
  // Generate each prime div
  for (let i = 0; i < primes.length; i++) {
    let primePnode = document.createElement("p")
    primePnode.appendChild(document.createTextNode(primes[i]))
    
    let primeDivNode = document.createElement("div")
    primeDivNode.appendChild(primePnode)
    primeDivNode.className = 'prime hidden'
    primeDivNode.setAttribute('data-select-count', 0)
    
    dom.primeContainer.appendChild(primeDivNode)
  }
  
  dom.primes = document.getElementsByClassName('prime')
}
UI.unveilPrimes = () => {
  // Hide all but primes of this level
  let limit
  if (gameMode == "exploration") { limit = level }
  else if (gameMode == "workout") { limit = currentWorkout.maxPrimeLevel }
  
  Array.from(document.getElementsByClassName('prime')).forEach((el, index) => {
    el.className = 'prime' + (index <= limit ? '' : ' hidden')
  })
}
UI.primeIDtoGridPosition = (i) => {
  let x = 0, y = 0
  
  let rad = Math.ceil((-1 + Math.sqrt(1+i)) / 2) // Yeah
  
  let offsetIndex = 8 * (rad * (rad - 1)) / 2 // Offset index is 1 at each new square layer
  let oI = i - offsetIndex
  let L = 2 * rad
  let sideIndex = Math.ceil(oI / L) // [|1, 4|]
  switch (sideIndex) {
    case 1:
      x = -rad + oI
      y = -rad
      break;
    case 2:
      x = rad
      y = -rad + oI - L
      break;
    case 3:
      x = rad - (oI - 2*L)
      y = rad
      break;
    case 4:
      x = -rad
      y = rad - (oI - 3*L)
      break;
    default:
     break;
  }
  
  //console.log("i is " + i, "rad is " + rad, "oI is " + oI, "side is " + sideIndex, "x is " + x, "y is " + y)
      
  return {x, y}
}
UI.positionCentralAndPrimeNodes = () => {
  let baseCellSize = 50 //px
  
  // Central number
  let numberSize = 3 * baseCellSize
  dom.numberContainer.style.width = numberSize + "px"
  dom.numberContainer.style.height = numberSize + "px"
  
  let playAreaSize = {
    w: dom.playArea.offsetWidth,
    h: dom.playArea.offsetHeight
  }
  let center = { x: playAreaSize.w / 2, y: playAreaSize.h / 2 }
  
  // Position central number
  dom.numberContainer.style.left = center.x - numberSize / 2 + "px"
  dom.numberContainer.style.top = center.y - numberSize / 2 + "px"
  
  // Prime spiral
  let primeSize = baseCellSize * 1
  Array.from(dom.primes).forEach((el, i) => {
    
    let xy = UI.primeIDtoGridPosition(i + 9) // Offset the spiral positioning so it doesn't start right at the center
    
    dom.primes[i].style.width = primeSize + "px"
    dom.primes[i].style.height = primeSize + "px"
    dom.primes[i].style.left = center.x - primeSize / 2 + xy.x * baseCellSize + "px"
    dom.primes[i].style.top = center.y - primeSize / 2 + xy.y * baseCellSize + "px"
    
  })
}
UI.endAnimation = (winOrLose, isShuffle, callback) => {
  // winOrLose is 'win' or 'lose'
  // isShuffle is 'shuffle' or 'noshuffle'
  UI.freezeUIinteraction = true
  dom.numberContainer.className = winOrLose
  dom.feedbackContainer.className = winOrLose
  
  let extraTimeout = isShuffle == 'shuffle' ? 400 : 0
  setTimeout(() => {
    dom.numberContainer.className = ''
    dom.feedbackContainer.className = ''
    if (isShuffle == 'shuffle') UI.fakeShuffleAnimation(400)
  }, 1000)
  setTimeout(() => {
    UI.freezeUIinteraction = false
    callback()
  }, 1000 + extraTimeout)
}
UI.fakeShuffleAnimation = (durationMS) => {
  dom.ntg.classList = "shuffling"
  let startTime = new Date().getTime()
  let glitchDurationMS = 30
  // Frantically change displayed ntg before new real pick
  let interval = setInterval(() => {
    let numberOfDigits = level <= 3 ? 1 : (level <= 24 ? 2 : 3)
    dom.ntg.innerHTML = 1 + Math.floor((Math.pow(10, numberOfDigits) - 1) * Math.random())
  }, glitchDurationMS)
  setTimeout(() => {
    clearInterval(interval)
  }, durationMS - 2 * glitchDurationMS) // Removing 1 glitch duration to prevent change after actual new ntg has been chosen
  setTimeout(() => { dom.ntg.classList = "" }, durationMS)
  
}
UI.updateFeedbackText = () => {
  let feedbackMarkup = numberToGuess + ' = '
  ntgFound.forEach((n, i) => {
    feedbackMarkup += n
    if (i < ntgDecomposition.length - 1) {
      feedbackMarkup += '<span> x </span>'
    }
  })
  if (ntgFound.length < ntgDecomposition.length) {
    feedbackMarkup += '?'
  }
  dom.feedback.innerHTML = feedbackMarkup
}
UI.updateXpBar = () => {
  let interval = levelXPinterval(level)
  // Increase xp bar height
  dom.xp.style.height = 100 * level + 100 * (xp - interval.start) / (interval.end - interval.start) + '%'
  // Make sure bar has proper offset
  dom.xp.style.bottom = -100 * level + '%'
}
UI.updateStepBar = () => {
  let size = currentWorkout.sequence.length
  let percent = step * 100 * 1 / size
  dom.stepBar.style.width = percent + '%'
}
UI.updatePickedMenuLevel = () => {
  dom.submenus.exploration.levelPicker.picked.innerHTML = "Jump to level " + pickedMenuLevel
  
  // Display button as inactive if min or max possible level
  let minusClasses = 'btn square-btn'
  let plusClasses = 'btn square-btn'
  if (pickedMenuLevel == primes.length - 1) {
    plusClasses += ' inactive'
  } else if (pickedMenuLevel == 1) {
    minusClasses += ' inactive'
  }
  dom.submenus.exploration.levelPicker.minus.className = minusClasses
  dom.submenus.exploration.levelPicker.plus.className = plusClasses
}
UI.updateInfoArea = () => {
  let infoModeText, infoStepType
  if (gameMode == "exploration") {
    dom.infoContent.innerHTML = "Level <span>" + level + "</span>"
  } else if (gameMode == "workout") {
    dom.infoContent.innerHTML = "<strong>" + currentWorkout.name + "</strong> step <span>" + (step + 1) + "</span>"//" of " + currentWorkout.sequence.length
  }
}

// Audio
let Aud = {
  playing: false,
  muted: false,
  samples: {
    correct: undefined,
    incorrect: undefined
  }
}
Aud.initSamples = () => {
  for (let i = 1; i <= 2; i++) {
    // Create an audio node
    let audioElement = document.createElement('audio')
    audioElement.id = "sample-" + i
    audioElement.preload = true
    audioElement.loop = false
    let audioSourceElement = document.createElement('source')
    audioSourceElement.src = 'https://alexandrix.com/misc/primer-audio/s' + i + '.mp3'
    audioSourceElement.type = 'audio/mp3'
    audioElement.appendChild(audioSourceElement)

    document.getElementsByTagName('body')[0].appendChild(audioElement)
  }
  
  Aud.samples.correct = document.getElementById('sample-1')
  Aud.samples.incorrect = document.getElementById('sample-2')
}
Aud.play = (type) => {
  if (Aud.muted) return false
  
  // tape can be 'correct' or 'incorrect'
  if (type == 'correct') {
    Aud.samples.correct.play()
  } else if (type == 'incorrect') {
    Aud.samples.incorrect.play()
  }
  
  Aud.playing = true
  setTimeout(() => {
    Aud.playing = false
  }, 1000)
}
Aud.start = () => {
  Aud.initSamples()
}

// General
let generate = (number) => {
  // If no number is passed generate a new number in dom.ntg and reset primes selection
  let maxNumber = primes[Math.min(level, primes.length - 1)]
  if (number) {
    numberToGuess = Math.max(2, Math.min(maxNumber, number))
  } else {
    // Pick new random number (+ decomposition + DOM update)
    let propensityToPickHigherNumbers = 1.5 + 1.5 * level / primes.length // max == power 3 (1+2), the higher the level the closest ntgs are picked to highest value
    numberToGuess = 1 + Math.ceil( (maxNumber - 1) * (1 - Math.pow(Math.random(), propensityToPickHigherNumbers)) )
  }
  
  ntgDecomposition = decompose(numberToGuess)
  ntgDecompositionLeftToFind = ntgDecomposition.map(x => x) // Creates copy, not reference
  ntgFound = []
  dom.ntg.innerHTML = numberToGuess
  UI.updateFeedbackText()
  
  // Primes select count init/reset and listeners
  Array.from(dom.primes).forEach((el) => {
    el.setAttribute('data-select-count', 0)
    el.removeEventListener('click', handleClickOnPrime)
    el.addEventListener('click', handleClickOnPrime)
  })
}
let start = (lvl) => {
  // Boot game at a given level (incl. view)
  
  // Check lvl value
  if (lvl > primes.length - 1) {
    log('Level ' + lvl + ' is too high and cannot be played (yet?).')
    start(primes.length - 1)
    return false
  }
  
  // Start level
  log('Starting at level ' + lvl)
  changeLevelTo(lvl)
  
  // (Re)start xp/step
  xp = levelXPinterval(level).start
  UI.updateXpBar()
  UI.updateStepBar()
}
window.onload = (event) => {
  // Starting on landing screen (Tap to start)
  UI.fillOverlayUI(dom.templates.landing)
  
  // Shape UI
  UI.generatePrimesNodes()
  UI.positionCentralAndPrimeNodes()
  
  // Start audio
  Aud.start()
  
  // Prepare workouts
  prepareWorkouts()
  
  // Prepare submenus
  UI.initWorkoutsSubmenu()
  UI.initExplorationSubmenu()
  
  // Start interactions
  UI.initListeners()
  
  // Boot game at level 1
  startExploration(1)
}
