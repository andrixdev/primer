// Audio
let Aud = {
	soundtrackMuted: false,
	soundEffectsMuted: false,
	primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71],
	audioCtx: undefined,
	masterGainNode: null,
	soundtrackGainNode: null,
	sfxGainNode: null,
	soundtrackSamples: [], // multiple loops of different length running in parallel
	primeDecompositionSamples: [],
	primeSelectionSamples: [],
	maxPrimeDecompositionSample: null,
	maxPrimeSelectionSample: null,
	levelUpSamples: [],
	shuffleSamples: [],
	incorrectSample: null,
	sountrackVolume: 0,
	sfxVolume: 0
}

Aud.playFullDecomposition = (factors) => {
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
	Aud.play(Aud.shuffleSamples[randIndex], "sfx")
}
Aud.playRandomLevelUp = () => {
	const size = Aud.levelUpSamples.length
	let randIndex = Math.floor(size * Math.random())
	Aud.play(Aud.levelUpSamples[randIndex], "sfx")
}
Aud.playSoundtrack = () => {
	// Start soundtrack samples
	Aud.play(Aud.soundtrackSamples[0], "soundtrack")
	Aud.play(Aud.soundtrackSamples[1], "soundtrack")
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

			Aud.play(sample, "sfx", playbackRate)
		} else {
			// Keep normal playback rate & play special "max" sample
			playbackRate = 1

			if (type == "selected") sample = Aud.maxPrimeSelectionSample
			else if (type == "decomposition") sample = Aud.maxPrimeDecompositionSample

			Aud.play(sample, "sfx", playbackRate)
		}
	}
	else {
		// Look for prime in array
		let index = Aud.primes.indexOf(prime)
		// Play corresponding sample
		if (type == "selected") Aud.play(Aud.primeSelectionSamples[index], "sfx")
		else if (type == "decomposition") Aud.play(Aud.primeDecompositionSamples[index], "sfx")
	}
	
}
Aud.playIncorrect = () => {
	Aud.play(Aud.incorrectSample, "sfx")
}
Aud.updateSoundtrackVolume = (value) => {
	value = Math.max(0, Math.min(1, value))
	Aud.soundtrackVolume = value
	Aud.soundtrackGainNode.gain.setTargetAtTime(value, Aud.audioCtx.currentTime, 0.1 + value * 1.5)
}
Aud.updateSfxVolume = (value) => {
	value = Math.max(0, Math.min(1, value))
	Aud.sfxVolume = value
	Aud.sfxGainNode.gain.setTargetAtTime(value, Aud.audioCtx.currentTime, 0.1 + value * 1.5)
}
Aud.initBuses = () => {
	Aud.masterGainNode = Aud.audioCtx.createGain()
	Aud.soundtrackGainNode = Aud.audioCtx.createGain()
	Aud.sfxGainNode = Aud.audioCtx.createGain()

	Aud.masterGainNode.connect(Aud.audioCtx.destination)

	Aud.soundtrackGainNode.connect(Aud.masterGainNode)
	Aud.sfxGainNode.connect(Aud.masterGainNode)
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
Aud.initVolumes = () => {
	// Later grab prefered setting from localStorage
	let soundtrackVolume = localStorage.getItem("soundtrackVolume") || 1
	let sfxVolume = localStorage.getItem("sfxVolume") || 1
	Aud.updateSoundtrackVolume(soundtrackVolume)
	Aud.updateSfxVolume(sfxVolume)
	UI.initSettingSubmenuVolumes()
}
Aud.loop = (sample) => {
	// Start a loop with sample
}
Aud.play = (sample, type, playbackRate = 1) => {
	// type is "sfx" or "soundtrack"

	const sourceNode = Aud.audioCtx.createBufferSource()
	sourceNode.buffer = sample.buffer
	sourceNode.loop = type == "soundtrack"
	sourceNode.playbackRate.value = playbackRate
	let destinationNode = type == "sfx" ? Aud.sfxGainNode : (type == "soundtrack" ? Aud.soundtrackGainNode : Aud.masterGainNode)
	sourceNode.connect(destinationNode)
	sourceNode.start()
	// In case of performance issues in the future, Add a Disconnect after sample has ended
}
Aud.start = async () => {
	return await new Promise((reso, reje) => {
		// Init audio context (has to be triggered by used interaction)
		Aud.audioCtx = new AudioContext()
		Aud.initBuses()
		Aud.initSamples()
		
		Aud.loadSamples()
			.then(() => {
				Aud.initVolumes()
				Aud.playSoundtrack()
				reso()
			}).catch(err => {
				console.error(err)
				reje()
			})
	})
}
