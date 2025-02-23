// Audio
let Aud = {
	soundtrackMuted: false,
	soundEffectsMuted: false,
	primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71],
	samples: [],
	soundtrack: [], // multiple loops of different length running in parallel
	audioCtx: undefined,
	newSamples: [],
	soundtrackSamples: [],
	primeDecompositionSamples: [],
	primeSelectionSamples: [],
	levelUpSamples: [],
	shuffleSamples: [],
	incorrectSample: null
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
Aud.initLegacyDOMSamples = () => {
	// Create audio DOM nodes for sound effects
	let sfxSources = ['incorrect', 'xp-up', 'xp-down']
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
		let maxPrime = 71 // Should be the maxPrime of whole game but for now it's enough
		let numberOfSamples = Math.floor(Math.log2(maxPrime) / Math.log2(p)) // Max possible number of this prime in decomposition
		numberOfSamples *= 2 // Double it to really avoid all samples being already played (btw they can't be restarted that's why we're injecting so many samples of the same source)
		for (let i = 1; i <= numberOfSamples; i++) {
			Aud.addNewPrimeSample('selection', 'prime-' + p + '-selection-' + i, p)
			Aud.addNewPrimeSample('decomposition', 'prime-' + p + '-decomposition-' + i, p)
		}
	})

	Aud.addNewPrimeSample('selection', 'prime-max-selection-', 'max')
	Aud.addNewPrimeSample('decomposition', 'prime-max-decomposition-', 'max')
}
Aud.legacyDOMplay = (type, playbackRate = 1) => {
	if (type == 'soundtrack' && Aud.soundtrackMuted) return false
	if (type != 'soundtrack' && Aud.soundEffectsMuted) return false
	
	let samples = Aud.samples.filter((el) => {
		return el.type == type
	})

	let s = 0
	while (s < samples.length) {
		if (!samples[s].node.currentTime || samples[s].node.currentTime == 0) {
			if (playbackRate != 1) {
				samples[s].node.playbackRate = playbackRate
				samples[s].node.preservesPitch = false
			}
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
Aud.playPrime = (prime, type = 'selection') => {
	// valid types are:
	// 	- 'selection'
	// 	- 'decomposition'
	
	if (Aud.soundEffectsMuted) return false

	let playbackRate = 1
	let max = Aud.primes[Aud.primes.length - 1]
	if (prime > max) {
		let n = primes.indexOf(prime) - primes.indexOf(max)

		if (n <= 24) {
			// repitch highest prime up to 2 octaves
			playbackRate = 2**(n/12)
			prime = max
		} else {
			// play 'max.mp3' sample for all higher primes
			playbackRate = 1
			prime = 'max'
		}
	}

	Aud.play('prime-' + prime + '-' + type, playbackRate)
	
}
Aud.playFullDecomposition = (factors) => {
	if (Aud.soundEffectsMuted) return false

	factors.sort((a, b) => a > b) // Play notes in ascending order of pitch
	factors.forEach((f, i) => {
		let delay = i * 165

		setTimeout(() => {
			Aud.playPrime(f, 'decomposition')
		}, delay)
	})
}
Aud.initSamples = () => {
	// Fill soundtrack sample array
	Aud.soundtrackSamples.push({
		path: "./audio/soundtrack/soundtrack-low.mp3",
		buffer: null
	})
	Aud.soundtrackSamples.push({
		path: "./audio/soundtrack/soundtrack-mid.mp3",
		buffer: null
	})

	// Fill primes sample arrays
	Aud.primes.forEach((p, index) => {
		Aud.primeDecompositionSamples.push({
			path: "./audio/sfx/decomposition/" + p + ".mp3",
			buffer: null
		})
		Aud.primeSelectionSamples.push({
			path: "./audio/sfx/selection/" + p + ".mp3",
			buffer: null
		})
	})
	Aud.primeDecompositionSamples.push({
		path: "./audio/sfx/decomposition/max.mp3",
		buffer: null
	})
	Aud.primeSelectionSamples.push({
		path: "./audio/sfx/selection/max.mp3",
		buffer: null
	})


	// Fill other sample containers
	Aud.levelUpSamples.push({ path: "./audio/sfx/level-up/level-up-1.mp3", buffer: null })
	Aud.levelUpSamples.push({ path: "./audio/sfx/level-up/level-up-2.mp3", buffer: null })
	Aud.levelUpSamples.push({ path: "./audio/sfx/level-up/level-up-3.mp3", buffer: null })
	Aud.levelUpSamples.push({ path: "./audio/sfx/level-up/level-up-4.mp3", buffer: null })
	Aud.levelUpSamples.push({ path: "./audio/sfx/level-up/level-up-5.mp3", buffer: null })
	Aud.shuffleSamples.push({ path: "./audio/sfx/shuffle/shuffle-1.mp3", buffer: null })
	Aud.shuffleSamples.push({ path: "./audio/sfx/shuffle/shuffle-2.mp3", buffer: null })
	Aud.shuffleSamples.push({ path: "./audio/sfx/shuffle/shuffle-3.mp3", buffer: null })
	Aud.incorrectSample = { path: "./audio/sfx/incorrect.mp3", buffer: null }
}
Aud.loadSamples = async () => {
	const allSamples = [...Aud.soundtrackSamples, ...Aud.primeDecompositionSamples, ...Aud.primeSelectionSamples, ...Aud.levelUpSamples, ...Aud.shuffleSamples,	Aud.incorrectSample]

	// Pre-fetch all samples (asynchronously)
	let promises = []
	let loadCount = 0
	let totalLoadCount = allSamples.length
	allSamples.forEach((s, i) => {
		promises.push(async () => {
			return await fetch(s.path).then(response => {
				// Check sample load
				if (response.ok) {
					return Promise.resolve(response)
				}
				else {
					return Promise.reject("Failed loading audio sample at " + s.path)
				}
			})
			.then(response => response.arrayBuffer())
			.then(arrayBuffer => Aud.audioCtx.decodeAudioData(arrayBuffer))
			.then(buffer => {
				s.buffer = buffer
				loadCount++
				UI.updateLoadingProgress(Math.round(loadCount / totalLoadCount * 100))
				return Promise.resolve("Sample number " + i + " was successfully loaded." )
			})
			.catch(error => {
				return Promise.reject(error)
			})
		})
	})

	return await new Promise((resooolve, rejeeect) => {
		Promise.all(promises.map(prom => prom()))
			.then(results => {
				//console.log("Oh yeaah")
				//console.log(results)
				resooolve("All fetch calls were successfully loaded that's cool man")
			})
			.catch(err => rejeeect(err))
	})
}
Aud.play = (sample) => {
	const sourceNode = Aud.audioCtx.createBufferSource()
	sourceNode.buffer = sample.buffer
	sourceNode.connect(Aud.audioCtx.destination)
	sourceNode.start()
	// In case of performance issues in the future, Add a Disconnect after sample has ended
}
Aud.start = async () => {
	return await new Promise((reso, reje) => {
		// Init audio context (has to be triggered by used interaction)
		Aud.audioCtx = new AudioContext()

		Aud.initSamples()
		
		Aud.loadSamples()
			.then(res => {
				// Start soundtrack samples
				console.log('playing soundtracks')
				Aud.play(Aud.soundtrackSamples[0])
				Aud.play(Aud.soundtrackSamples[1])
				
				reso()
			}).catch(err => {
				console.error(err)
				reje()
			})
	})
}
