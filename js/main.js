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

	// Play full decomposition of ntg
	Aud.playFullDecomposition(ntgDecomposition)
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
let share = () => {
	// Share Primer
	navigator.share({
		title: "Primer",
		text: "Decompose all the numbers!",
		url: "https://alexandrix.com/primer"
	}).then(() => {
		// Success
	}).catch((e) => {
		// Error
	})
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
