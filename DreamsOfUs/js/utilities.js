// utilities.js
// author: Ben Connick
// last modified: 3/9/2017

"use strict";

// helpful functions that aren't dependent on anything

// exponents
function xToPowerOfY(x,y) {
	var result = 1;
	for (var i=0; i<y; i++) {
		result*=x;
	}
	return result
}

// sign
function sign(num) {
	if (num > 0) {
		return 1;
	} else {
		if (num < 0) {
			return -1;
		} else {
			return 0;
		}
	}
}

// hide
function hideElement(elem) {
	//console.log(elem.id);
	elem.style.display = "none";
}

// display
function displayBlock(elem) {
	elem.style.display = "block";
}

// clear context transforms
function clear(context) {
	if (!context) {
		// special exception for this program
		context = app.graphics.ctx;
	}
	context.setTransform(1,0,0,1,0,0);
}

function q(str) {
	return document.querySelector(str);
}

// time
var deltaTime = 0;
var prevTime = 0;


// developer debugging
var x_debug_x = false;

window.addEventListener("load",function() {
	//if (x_debug_x) q("#cheatInput").style.display = "block"; q("#showCaseModeBtn").style.display = "block";
	var x_CheatInput_x = q("#cheatInput");
	x_CheatInput_x.onkeydown=function(event) { 
		if (event.keyCode == 13) x_HandleCheats_x(event.target || event.srcElement);
	};
	var x_DemoBtn_x = q("#showcaseModeBtn");
	x_DemoBtn_x.onclick = function() {
		x_HandleCheatString_x("showcase");	
		toggleDebug();
	}
	
	// set up pause menu this doesn't really belong in utilities but I have nowhere else to put it right now
	x_pauseMenuElem_x = q("#pauseMenu");
	q("#resumeBtn").onclick = function() { app.game.unpause(); togglePauseMenu(); };
	q("#volumeSlider").onchange = function(e) { app.game.masterVolume = e.target.value; console.log(app.game.masterVolume); }
	// set initial value
	app.game.masterVolume = q("#volumeSlider").value;
	
});
function x_HandleCheats_x(elem) {
	//console.log("handle cheats activated: " + elem.value);
	x_HandleCheatString_x(elem.value);
}

function x_HandleCheatString_x(str) {
	switch(str) {
		case "onelife":
			app.game.lives = 1;
			break;
		case "longlife":
			app.game.lives = 10000;
			break;
		case "debugoff":
			toggleDebug();
			break;
		case "speedup":
			app.game.maxGameTime = 30000;
			break;
		case "endgame":
			app.game.maxGameTime = 1000;
			break;
		case "level2":
			app.game.gameTime = app.game.maxGameTime * 0.25 - 1;
			break;
		case "level3":
			app.game.gameTime = app.game.maxGameTime * 0.55 - 1;
			break;
		case "showcase":
			app.game.gameTime *= 30000/app.game.maxGameTime;
			app.game.maxGameTime = 30000;
			break;
		case "catcrazy":
			app.game.catChance = 1;
			break;
	}
}

// map a value between an original min and max to a proportionate new value in a new min and max
function MapValue(val,minOrig,maxOrig,minNew,maxNew) {
	return minNew + (maxNew-minNew) * (val - minOrig) / (maxOrig-minOrig);
}

function toggleDebug() {
	if (x_debug_x) {
		q("#cheatInput").style.display = "none";
		q("#showcaseModeBtn").style.display = "none"
		
	} else {
		q("#cheatInput").style.display = "block";
		q("#showcaseModeBtn").style.display = "block"
		app.game.lives = 10000;
	}
	x_debug_x = !x_debug_x;
}


var x_pauseMenuElem_x = undefined;
var x_pauseMenu_x = false;
function togglePauseMenu(boo) {
	if (boo === undefined || boo === null) {
		x_pauseMenu_x = !x_pauseMenu_x;	
	} else {
		x_pauseMenu_x = boo;
	}
	if (x_pauseMenu_x) {
		displayBlock(x_pauseMenuElem_x);
	} else {
		hideElement(x_pauseMenuElem_x);
	}
	
}

// Tony's stuff
function getRandom(min, max) {
  	return Math.random() * (max - min) + min;
}