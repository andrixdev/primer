// UI and DOM
let UI = {}
let dom = {
	html: document.getElementsByTagName('html')[0],
	body: document.getElementsByTagName('body')[0],
	overlay: document.getElementById('screen-overlay'),
	templates: {
		landing: document.getElementById('landing-template'),
		loading: document.getElementById('loading-template'),
		menu: document.getElementById('menu-template'),
		gameOver: document.getElementById('game-over-template'),
		workoutComplete: document.getElementById('workout-complete-template')
	},
	loadingProgress: document.getElementById('loading'),
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
	submenuModeChangeLeft: document.getElementById('mode-change-button-left'),
	submenuModeChangeRight: document.getElementById('mode-change-button-right'),
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
			soundtrackToggle: document.getElementById('soundtrack-toggle'),
			soundtrackInfo: document.getElementById('soundtrack-info'),
			soundEffectsToggle: document.getElementById('sound-effects-toggle'),
			soundEffectsInfo: document.getElementById('sound-effects-info'),
			themeToggle: document.getElementById('theme-toggle'),
			themeToggleInfo: document.getElementById('theme-toggle-info'),
			share: document.getElementById('share'),
			shareButton: document.getElementById('share-button')
		}
	}
}
let explorationMenuLevels = [1, 10, 20, 30]
UI.freezeUIinteraction = false
UI.menuIsOpen = false
UI.fillOverlayUI = (newTemplateNode) => {
	dom.body.append(dom.overlay.firstElementChild)
	dom.overlay.appendChild(newTemplateNode)
	dom.overlay.className = '' // Removes potential .hidden class
}
UI.updateLoadingProgress = (value) => {
	dom.loadingProgress.innerHTML = value
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
		dom.submenuModeName.innerHTML = "EXPLORATION 🚀"
		dom.submenus.exploration.submenu.className = "submenu"
	} else if (gameModeName == "workout") {
		dom.submenuModeName.innerHTML = "WORKOUTS 💪"
		dom.submenus.workouts.submenu.className = "submenu"
	} else if (gameModeName == "settings") {
		dom.submenuModeName.innerHTML = "SETTINGS 🎮"
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

		// Go to loading screen
		UI.fillOverlayUI(dom.templates.loading)

		// Start loading audio
		Aud.start()
			.then(() => {
				dom.overlay.className = 'hidden'

				// Boot game at level 1
				startExploration(1)

				UI.scrollToCenter()
			})
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
	dom.submenuModeChangeLeft.addEventListener('click', () => {
		if (UI.freezeUIinteraction) return false
		if (UI.submenuGameMode == "exploration") UI.updateSubmenuGameMode("settings")
		else if (UI.submenuGameMode == "workout") UI.updateSubmenuGameMode("exploration")
		else if (UI.submenuGameMode == "settings") UI.updateSubmenuGameMode("workout")
	})
	dom.submenuModeChangeRight.addEventListener('click', () => {
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
	// Soundtrack
	dom.submenus.settings.soundtrackToggle.addEventListener('click', () => {
		// Action
		Aud.soundtrackMuted = !Aud.soundtrackMuted
		if (Aud.soundtrackMuted) Aud.pauseSoundtrack()
		else Aud.playSoundtrack()

		// UI
		dom.submenus.settings.soundtrackToggle.classList = "switch " + (Aud.soundtrackMuted ? "off" : "on")
		dom.submenus.settings.soundtrackInfo.innerHTML = "Soundtrack is " + (Aud.soundtrackMuted ? "muted 🤫" : "playing 🎵")
	})

	// Sound effects
	dom.submenus.settings.soundEffectsToggle.addEventListener('click', () => {
		// Action
		Aud.soundEffectsMuted = !Aud.soundEffectsMuted

		// UI
		dom.submenus.settings.soundEffectsToggle.classList = "switch " + (Aud.soundEffectsMuted ? "off" : "on")
		dom.submenus.settings.soundEffectsInfo.innerHTML = "Sound effects are " + (Aud.soundEffectsMuted ? "muted 🤫" : "playing 🎶")
	})

	// Themes
	let themes = ["dark-theme", "bw-theme"]
	let themeNames = ["dark night 🌒", "b & w 🖤"]
	let themeID = 0
	dom.submenus.settings.themeToggle.addEventListener('click', () => {
		themeID = (themeID + 1) % 2
		dom.html.classList = themes[themeID]
		dom.submenus.settings.themeToggle.classList = "switch " + (themeID == 0 ? "on" : "off")
		dom.submenus.settings.themeToggleInfo.innerHTML = "Theme: " + themeNames[themeID]
	})

	// Share
	if (!navigator.canShare) {
		dom.submenus.settings.share.classList.toggle("hidden")
	} else {
		dom.submenus.settings.shareButton.addEventListener('click', () => {
			share()
	   	})
	}
	
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
UI.endAnimation = (winOrLose = 'win', isShuffle = 'shuffle', callback) => {
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
	Aud.playMulti('shuffle')
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
UI.updateXpBar = (isLevelUp = false) => {
	let interval = levelXPinterval(level)

	if (!isLevelUp) {
		// Easing
		dom.xp.style.transition = "height 500ms ease-out"
		// Increase xp bar height
		dom.xp.style.height = 100 * level + 100 * (xp - interval.start) / (interval.end - interval.start) + '%'
		// Make sure bar has proper offset
		dom.xp.style.bottom = -100 * level + '%'
	} else {
		// Easing
		dom.xp.style.transition = "height 250ms linear"
		// Take half the time (250ms) to increase to 100%
		dom.xp.style.height = 100 * level + '%'
		setTimeout(() => {
			// Abrupt move to 0%
			dom.xp.style.bottom = -100 * level + '%'
			// Take half the time (250ms) to increase to the right height %
			dom.xp.style.height = 100 * level + 100 * (xp - interval.start) / (interval.end - interval.start) + '%'
		}, 250)
	}
	
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
