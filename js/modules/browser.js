// Local storage
let Browser = {}

Browser.reset = () => {
	localStorage.clear()
}
Browser.getSoundtrackVolume = () => {
	return localStorage.getItem("soundtrackVolume")
}
Browser.setSoundtrackVolume = (volume) => {
	return localStorage.setItem("soundtrackVolume", volume)
}
Browser.getSfxVolume = () => {
	return localStorage.getItem("sfxVolume")
}
Browser.setSfxVolume = (volume) => {
	return localStorage.setItem("sfxVolume", volume)
}
Browser.getTheme = () => {
	return localStorage.getItem("theme")
}
Browser.setTheme = (themeID) => {
	return localStorage.setItem("theme", themeID)
}
