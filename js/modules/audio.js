// Audio
let Aud = {
	soundtrackMuted: false,
	soundEffectsMuted: false,
	samples: {
		soundtrack: undefined,
		correct: undefined,
		incorrect: undefined,
		xpUp: undefined,
		xpDown: undefined,
		levelUp: undefined,
		buttonHover: undefined,
	},
	primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61],
	primeSelectionSamples: [],
	primeDecompositionSamples: []
}
Aud.initSamples = () => {
	// Create audio DOM nodes for soundtrack and gameplay sounds
	let sfxFolder = 'audio/sfx/'
	let soundtrackFolder = 'audio/soundtrack/'
	let sfxSources = ['soundtrack', 'correct', 'incorrect', 'xp-up', 'xp-down', 'level-up', 'button-hover']

	sfxSources.forEach((source) => {
		let audioElement = document.createElement('audio')
		audioElement.id = source
		audioElement.preload = true
		audioElement.loop = source == 'soundtrack' ? true : false
		let audioSourceElement = document.createElement('source')
		audioSourceElement.src = (source == 'soundtrack' ? soundtrackFolder : sfxFolder) + source + '.mp3'
		audioSourceElement.type = 'audio/mp3'
		audioElement.appendChild(audioSourceElement)
		document.getElementsByTagName('body')[0].appendChild(audioElement)
	})
	
	Aud.samples.soundtrack = document.getElementById('soundtrack')
	Aud.samples.correct = document.getElementById('correct')
	Aud.samples.incorrect = document.getElementById('incorrect')
	Aud.samples.xpUp = document.getElementById('xp-up')
	Aud.samples.xpDown = document.getElementById('xp-down')
	Aud.samples.levelUp = document.getElementById('level-up')
	Aud.samples.buttonHover = document.getElementById('button-hover')

	// Create 2 audio DOM nodes for each prime, 'selection' and 'decomposition' samples
	Aud.primes.forEach((p) => {
		let audioElement = document.createElement('audio')
		let id = 'selection-' + p
		audioElement.id = id
		audioElement.preload = true
		audioElement.loop = false
		let audioSourceElement = document.createElement('source')
		audioSourceElement.src = 'audio/sfx/selection/' + p + '.mp3'
		audioSourceElement.type = 'audio/mp3'
		audioElement.appendChild(audioSourceElement)
		document.getElementsByTagName('body')[0].appendChild(audioElement)
		Aud.primeSelectionSamples.push(document.getElementById(id))
	})
	Aud.primes.forEach((p) => {
		let audioElement = document.createElement('audio')
		let id = 'decomposition-' + p
		audioElement.id = id
		audioElement.preload = true
		audioElement.loop = false
		let audioSourceElement = document.createElement('source')
		audioSourceElement.src = 'audio/sfx/decomposition/' + p + '.mp3'
		audioSourceElement.type = 'audio/mp3'
		audioElement.appendChild(audioSourceElement)
		document.getElementsByTagName('body')[0].appendChild(audioElement)
		Aud.primeDecompositionSamples.push(document.getElementById(id))
	})
}
Aud.play = (type) => {
	if (type == 'soundtrack' && Aud.soundtrackMuted) return false
	if (type != 'soundtrack' && Aud.soundEffectsMuted) return false
	
	switch (type) {
		case 'soundtrack':
			Aud.samples.soundtrack.play()
			break
		case 'correct':
			Aud.samples.correct.play()
			break
		case 'incorrect':
			Aud.samples.incorrect.play()
			break
		case 'xpUp':
			Aud.samples.xpUp.play()
			break
		case 'xpDown':
			Aud.samples.xpDown.play()
			break
		case 'levelUp':
			Aud.samples.levelUp.play()
			break
		case 'buttonHover':
			Aud.samples.buttonHover.play()
			break
	}
}
Aud.playPrime = (prime) => {
	
}
Aud.start = () => {
	Aud.initSamples()
}
