// Audio
let Aud = {
	soundtrackMuted: false,
	soundEffectsMuted: false,
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

	// Load sound FX
	let sfxFolder = 'audio/sfx/'
	let soundtrackFolder = 'audio/soundtrack/'
	let sfx_sources = ['soundtrack', 'correct', 'incorrect', 'xp_up', 'xp_down', 'level_up', 'button_hover']
	for (source of sfx_sources) {
		// Create an audio node
		let audioElement = document.createElement('audio')
		audioElement.id = source
		audioElement.preload = true
		audioElement.loop = source == 'soundtrack' ? true : false
		let audioSourceElement = document.createElement('source')
		audioSourceElement.src = (source == 'soundtrack' ? soundtrackFolder : sfxFolder) + source + '.mp3'
		audioSourceElement.type = 'audio/mp3'
		audioElement.appendChild(audioSourceElement)

		document.getElementsByTagName('body')[0].appendChild(audioElement)
	}
	
	Aud.samples.soundtrack = document.getElementById('soundtrack')
	Aud.samples.correct = document.getElementById('correct')
	Aud.samples.incorrect = document.getElementById('incorrect')
	Aud.samples.xp_up = document.getElementById('xp_up')
	Aud.samples.xp_down = document.getElementById('xp_down')
	Aud.samples.level_up = document.getElementById('level_up')
	Aud.samples.button_hover = document.getElementById('button_hover')
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
}
Aud.start = () => {
	Aud.initSamples()
}
