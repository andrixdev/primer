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
			log('No prime found for number ' + n + ' within ' + iMax + ' attempts.')
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

		// Play sound of found prime
		Aud.playPrime(prime)
		
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
	
	// Prepare callback (nextAction) for after animation
	let nextAction, shuffle
	if (gameMode == "exploration") {
		if (level <= maxLevel) {
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
	if (newXP > 0) {
		//Aud.play('xp-up')
	} else {
		//Aud.play('xp-down')
	}
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
		Aud.playMulti('level-up')
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
	name: "&#128519; Toddler",
	id: 1,
	sequence: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
	completion: [],
	maxPrimeLevel: 6,
	difficulty: undefined
}, {
	name: "&#10024; Orbit one",
	id: 2,
	sequence: [2, 9, 49, 13, 15, 22, 30, 36, 43, 42, 32, 53],
	completion: [],
	maxPrimeLevel: 15,
	difficulty: undefined
}, {
	name: "&#127811; Small pie",
	id: 3,
	sequence: [3, 14, 15, 92, 65, 35, 89, 79, 32, 38, 46, 26, 43, 38, 32, 79, 50, 28, 84, 19, 71, 69, 39, 93, 75, 10],
	completion: [],
	maxPrimeLevel: 39,
	difficulty: undefined
}, {
	name: "&#127810; Big pie",
	id: 4,
	sequence: [3, 14, 159, 265, 358, 97, 93, 238, 46, 264, 338, 327, 95, 0288, 41, 97, 169, 39, 93, 75, 105, 82, 097, 49, 44, 59, 230, 78, 164, 062, 86, 208, 99, 86, 280, 348, 253, 42, 117, 067, 98],
	completion: [],
	maxPrimeLevel: 71, 
	difficulty: undefined
}, {
	name: "&#128528; Ghis",
	id: 5,
	sequence: [411, 311, 211, 111, 11, 13, 113, 213, 313, 413, 417, 317, 217, 117, 17, 19, 219, 319, 419, 421, 411],
	completion: [],
	maxPrimeLevel: 111,
	difficulty: undefined
}, {
	name: "&#128551; Akanaka",
	id: 6,
	sequence: [8, 11, 101, 111, 121, 212, 232, 323, 353, 373, 414, 484, 515, 525, 636, 696, 747, 757],
	completion: [],
	maxPrimeLevel: 159,
	difficulty: undefined
}, {
	name: "&#128565; Dubos",
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
