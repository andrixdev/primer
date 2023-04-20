// Audio
let Aud = {
	playing: false,
	muted: false,
	samples: {
		soundtrack: undefined,
		correct: undefined,
		incorrect: undefined,
		xp_up: undefined,
		xp_down: undefined,
		level_up: undefined,
		button_hover: undefined,
	}
}
Aud.initSamples = () => {
	// TODO: remove duplication
	// Load soundtrack
	let soundtrack_path = 'audio/soundtrack/placeholder_track.mp3'
	let audioElement = document.createElement('audio')
	audioElement.id = 'soundtrack'
	audioElement.preload = true
	audioElement.loop = true
	let audioSourceElement = document.createElement('source')
	audioSourceElement.src = soundtrack_path
	audioSourceElement.type = 'audio/mp3'
	audioElement.appendChild(audioSourceElement)

	document.getElementsByTagName('body')[0].appendChild(audioElement)

	// Load sound FX
	let sfxFolder = 'audio/sfx/'
	let sfx_sources = ['xp_up', 'xp_down', 'level_up', 'button_hover']
	for (source of sfx_sources) {
		// Create an audio node
		let audioElement = document.createElement('audio')
		audioElement.id = source
		audioElement.preload = true
		audioElement.loop = false
		let audioSourceElement = document.createElement('source')
		audioSourceElement.src = sfxFolder + source + '.mp3'
		audioSourceElement.type = 'audio/mp3'
		audioElement.appendChild(audioSourceElement)

		document.getElementsByTagName('body')[0].appendChild(audioElement)
	}

	// load alex' samples
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
	
	Aud.samples.soundtrack = document.getElementById('soundtrack')
	Aud.samples.correct = document.getElementById('sample-1')
	Aud.samples.incorrect = document.getElementById('sample-2')
	Aud.samples.xp_up = document.getElementById('xp_up')
	Aud.samples.xp_down = document.getElementById('xp_down')
	Aud.samples.level_up = document.getElementById('level_up')
	Aud.samples.button_hover = document.getElementById('button_hover')
}
Aud.play = (type) => {
	if (Aud.muted) return false
	
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
		case 'xp_up':
			Aud.samples.xp_up.play()
			break
		case 'xp_down':
			Aud.samples.xp_down.play()
			break
		case 'level_up':
			Aud.samples.level_up.play()
			break
		case 'button_hover':
			Aud.samples.button_hover.play()
			break
	}
	
	Aud.playing = true
	setTimeout(() => {
		Aud.playing = false
	}, 1000)
}
Aud.start = () => {
	Aud.initSamples()
}
