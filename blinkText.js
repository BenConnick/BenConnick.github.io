var blinkText = undefined;
var blinkTextVisible = true;

function toggleTextVisibility() {
	console.log(blinkText.style.visible);
	blinkTextVisible = !blinkTextVisible;
	blinkText.style.visibility = blinkTextVisible ? "visible" : "hidden";
}

function startBlinkLoop() {
	blinkText = document.querySelector(".blinktext");
	window.setInterval(toggleTextVisibility, 300);
}

window.addEventListener("load",startBlinkLoop);