// Audio
let Aud = {
	soundtrackMuted: false,
	soundEffectsMuted: false,
	primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71],
	audioCtx: undefined,
	soundtrackSamples: [], // multiple loops of different length running in parallel
	primeDecompositionSamples: [],
	primeSelectionSamples: [],
	maxPrimeDecompositionSample: null,
	maxPrimeSelectionSample: null,
	levelUpSamples: [],
	shuffleSamples: [],
	incorrectSample: null
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
Aud.legacyPlayPrime = (prime, type = "selection") => {
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
			Aud.playPrime(f, "decomposition")
		}, delay)
	})
}
Aud.playRandomShuffle = () => {
	const size = Aud.shuffleSamples.length
	let randIndex = Math.floor(size * Math.random())
	Aud.play(Aud.shuffleSamples[randIndex])
}
Aud.playRandomLevelUp = () => {
	const size = Aud.levelUpSamples.length
	let randIndex = Math.floor(size * Math.random())
	Aud.play(Aud.levelUpSamples[randIndex])
}
Aud.playPrime = (prime, type = "selected") => {
	// Check that we do have a prime
	if (primes.indexOf(prime) < 0) {
		console.error("Input number is not in list of primes")
		return false
	}

	const size = Aud.primes.length
	const lastAudioPrime = Aud.primes[size - 1]

	if (prime > lastAudioPrime) {
		// Play last prime audio sample with a faster playback rate up to 2 octaves higher
		// Above that, play the "max" sample
		let noteDifference = primes.indexOf(prime) - primes.indexOf(lastAudioPrime)
		let playbackRate = 1
		let sample
		if (noteDifference <= 24) {
			// Increase playback rate & play last prime sample
			playbackRate = 2 ** (noteDifference / 12)

			if (type == "selected") sample = Aud.primeSelectionSamples[size - 1]
			else if (type == "decomposition") sample = Aud.primeDecompositionSamples[size - 1]

			Aud.play(sample, playbackRate)
		} else {
			// Keep normal playback rate & play special "max" sample
			playbackRate = 1

			if (type == "selected") sample = Aud.maxPrimeSelectionSample
			else if (type == "decomposition") sample = Aud.maxPrimeDecompositionSample

			Aud.play(sample, playbackRate)
		}
	}
	else {
		// Look for prime in array
		let index = Aud.primes.indexOf(prime)

		// Play corresponding sample
		if (type == "selected") Aud.play(Aud.primeSelectionSamples[index])
		else if (type == "decomposition") Aud.play(Aud.primeDecompositionSamples[index])
	}
	
}
Aud.playIncorrect = () => {
	Aud.play(Aud.incorrectSample)
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
	Aud.maxPrimeDecompositionSample = {
		path: "./audio/sfx/decomposition/max.mp3",
		buffer: null
	}
	Aud.maxPrimeSelectionSample = {
		path: "./audio/sfx/selection/max.mp3",
		buffer: null
	}

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
	const allSamples = [...Aud.soundtrackSamples, ...Aud.primeDecompositionSamples, ...Aud.primeSelectionSamples, Aud.maxPrimeDecompositionSample, Aud.maxPrimeSelectionSample, ...Aud.levelUpSamples, ...Aud.shuffleSamples, Aud.incorrectSample]

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
Aud.loop = (sample) => {
	// Start a loop with sample
}
Aud.play = (sample, playbackRate = 1) => {
	const sourceNode = Aud.audioCtx.createBufferSource()
	sourceNode.buffer = sample.buffer
	sourceNode.playbackRate.value = playbackRate
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
			.then(() => {
				// Start soundtrack samples
				Aud.play(Aud.soundtrackSamples[0])
				Aud.play(Aud.soundtrackSamples[1])
				reso()
			}).catch(err => {
				console.error(err)
				reje()
			})
	})
}
