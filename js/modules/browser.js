// Local storage
let Browser = {}

Browser.reset = () => {
	localStorage.clear()
}
Browser.setSoundtrackVolume = (volume) => {
	return localStorage.setItem("soundtrackVolume", volume)
}
Browser.getSoundtrackVolume = () => {
	return localStorage.getItem("soundtrackVolume")
}
Browser.setSfxVolume = (volume) => {
	return localStorage.setItem("sfxVolume", volume)
}
Browser.getSfxVolume = () => {
	return localStorage.getItem("sfxVolume")
}
Browser.setTheme = (themeID) => {
	return localStorage.setItem("theme", themeID)
}
Browser.getTheme = () => {
	return localStorage.getItem("theme")
}
Browser.setLevel = (level) => {
	return localStorage.setItem("level", level)
}
Browser.getLevel = () => {
	return localStorage.getItem("level")
}
