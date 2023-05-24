// Audio
let Aud = {
	soundtrackMuted: false,
	soundEffectsMuted: false,
	primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61],
	samples: [],
	soundtrack: [], // multiple loops of different length running in parallel
}
Aud.addNewSample = (src, type, id) => {
	// type is 'decomposition', 'selection' (prime stuff) or 'soundtrack' or 'correct'... (sound effects)
	let audioElement = document.createElement('audio')
	audioElement.id = id
	audioElement.preload = true
	audioElement.loop = type == 'soundtrack'
	let audioSourceElement = document.createElement('source')
	audioSourceElement.src = src
	audioSourceElement.type = 'audio/mp3'
	audioElement.appendChild(audioSourceElement)
	audioElement.addEventListener('ended', (event) => {
		event.target.currentTime = 0 // Restart when over
	})
	// Inject DOM node in body
	document.getElementsByTagName('body')[0].appendChild(audioElement)
	// Add to reference array
	if (type != 'soundtrack') {
		Aud.samples.push({
			id: id,
			type: type,
			node: document.getElementById(id)
		})
	} else {
		Aud.soundtrack.push({
			id: id,
			type: type,
			node: document.getElementById(id)
		})
	}
	
}
Aud.addNewPrimeSample = (type, id, prime) => {
	// type is 'selection' of 'decomposition'
	let src = 'audio/sfx/' + type + '/' + prime + '.mp3'
	let newType = 'prime-' + prime + '-' + type
	Aud.addNewSample(src, newType, id)
}
Aud.initSamples = () => {
	// Create audio DOM nodes for sound effects
	let sfxSources = ['correct', 'incorrect', 'xp-up', 'xp-down', 'button-hover']
	sfxSources.forEach((source) => {
		let src = 'audio/sfx/' + source + '.mp3'
		let type = source
		let id = source
		Aud.addNewSample(src, type, id)
	})

	let sfxMultiSources = ['shuffle']
	sfxMultiSources.forEach((source) => {
		// TODO: list all mp3 files from audio/sfx/source/
		for (let i = 1, len = 3; i <= len; i++) {
			let src = 'audio/sfx/' + source + '/' + source + '-' + i + '.mp3'
			let type = source
			let id = source + '-' + i
			Aud.addNewSample(src, type, id)
		};
	})

	sfxMultiSources = ['level-up']
	sfxMultiSources.forEach((source) => {
		// TODO: list all mp3 files from audio/sfx/source/
		for (let i = 1, len = 5; i <= len; i++) {
			let src = 'audio/sfx/' + source + '/' + source + '-' + i + '.mp3'
			let type = source
			let id = source + '-' + i
			Aud.addNewSample(src, type, id)
		};
	})

	// Create audio DOM node for soundtrack
	Aud.addNewSample('audio/soundtrack/soundtrack-low.mp3', 'soundtrack', 'soundtrack-low')
	Aud.addNewSample('audio/soundtrack/soundtrack-mid.mp3', 'soundtrack', 'soundtrack-mid')

	// Create log2(maxPrime) audio DOM nodes for 2, log3(maxPrime) for 3, log5(maxPrime) for 5
	// And double it: 'selection' + 'decomposition' types
	Aud.primes.forEach((p) => {
		// 2 * logp(maxPrime) samples per prime of each type (to handle multiple clicks and making room for possible next ntg with the same factors)
		let maxPrime = 61 // Should be the maxPrime of whole game but for now it's enough
		let numberOfSamples = Math.floor(Math.log2(maxPrime) / Math.log2(p)) // Max possible number of this prime in decomposition
		numberOfSamples *= 2 // Double it to really avoid all samples being already played (btw they can't be restarted that's why we're injecting so many samples of the same source)
		for (let i = 1; i <= numberOfSamples; i++) {
			Aud.addNewPrimeSample('selection', 'prime-' + p + '-selection-' + i, p)
			Aud.addNewPrimeSample('decomposition', 'prime-' + p + '-decomposition-' + i, p)
		}
	})
}
Aud.play = (type) => {
	if (type == 'soundtrack' && Aud.soundtrackMuted) return false
	if (type != 'soundtrack' && Aud.soundEffectsMuted) return false
	
	let samples = Aud.samples.filter((el) => {
		return el.type == type
	})

	let s = 0
	while (s < samples.length) {
		if (!samples[s].node.currentTime || samples[s].node.currentTime == 0) {
			samples[s].node.play()
			s = 10000 // Break while loop
		}
		s++
	}
}
Aud.playSoundtrack = () => {
	Aud.soundtrack.forEach((track) => {
		track.node.play()
	})
}
Aud.pauseSoundtrack = () => {
	Aud.soundtrack.forEach((track) => {
		track.node.pause()
	})
}
Aud.playMulti = (type) => {
	// Play a random sample out of all samples with the same type
	// Should maybe be part of Audio.play
	if (type == 'soundtrack' && Aud.soundtrackMuted) return false
	if (type != 'soundtrack' && Aud.soundEffectsMuted) return false
	
	let samples = Aud.samples.filter((el) => {
		return el.type == type
	})

	// play a random sample from the list
	randomSample = samples[Math.floor(Math.random()*samples.length)]

	if (!randomSample.node.currentTime || randomSample.node.currentTime == 0) {
		randomSample.node.play()
	}
}
Aud.playPrime = (prime) => {
	if (Aud.soundEffectsMuted) return false

	let max = Aud.primes[Aud.primes.length - 1]
	if (prime > max) prime = max // Max of prime samples

	Aud.play('prime-' + prime + '-selection')
	
}
Aud.playFullDecomposition = (factors) => {
	if (Aud.soundEffectsMuted) return false

	factors.sort((a, b) => a > b) // Play notes in ascending order of pitch
	factors.forEach((f, i) => {
		let delay = i * 165

		let max = Aud.primes[Aud.primes.length - 1]
		if (f > max) f = max // Max of prime samples
		
		setTimeout(() => {
			Aud.play('prime-' + f + '-decomposition')
		}, delay)
	})
}
Aud.start = () => {
	Aud.initSamples()
}
