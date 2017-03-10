// keys.js
// author: Ben Connick
// last modified: 3/9/2017

"use strict";

console.log("app.keys exists");

// if app exists get a reference, otherwise create app
var app = app || {};
console.log("app exists");
// create module property of app
app.keys = (function() {
	
	console.log("app.keys loaded");
	
	// run on start
 	var init = function() {
 	
 		/*************************** EVENT LISTENERS *******************************/
		document.addEventListener('keydown', function(event) {
			if(event.keyCode == 37) {
				app.keys.leftPressed=true;
			}
			if(event.keyCode == 38) {
				app.keys.upPressed=true;
			}
			if(event.keyCode == 39) {
				app.keys.rightPressed=true;
			}
			if(event.keyCode == 40) {
				app.keys.downPressed=true;
			}
	
			if(event.keyCode == 65) {
				app.keys.aPressed=true;
			}
			if(event.keyCode == 87) {
				app.keys.wPressed=true;
			}
			if(event.keyCode == 68) {
				app.keys.dPressed=true;
			}
			if(event.keyCode == 83) {
				app.keys.sPressed=true;
			}
			if (event.keyCode == 80) {
				app.keys.pPressed=true;
			}
			// key events are repeated because it means that if opposite keys are pressed, 
			// they cancel out
			if(event.keyCode == 37) {
				app.keys.rightPressed=false;
			}
			if(event.keyCode == 38) {
				app.keys.downPressed=false;
			}
			if(event.keyCode == 39) {
				app.keys.leftPressed=false;
			}
			if(event.keyCode == 40) {
				app.keys.upPressed=false;
			}
	
			if(event.keyCode == 65) {
				app.keys.dPressed=false;
			}
			if(event.keyCode == 87) {
				app.keys.sPressed=false;
			}
			if(event.keyCode == 68) {
				app.keys.aPressed=false;
			}
			if(event.keyCode == 83) {
				app.keys.wPressed=false;
			}

			
			// debugger
			if(event.keyCode == 219 || event.keyCode == 27) {
				app.keys.lbracPressed=true;
			}
		});
		document.addEventListener('keyup', function(event) {
			if(event.keyCode == 37) {
				app.keys.leftPressed = false;
			}
			if(event.keyCode == 39) {
				app.keys.rightPressed = false;
			}
			if(event.keyCode == 38) {
				app.keys.upPressed = false;
			}
			if(event.keyCode == 40) {
				app.keys.downPressed = false;
			}
	
			if(event.keyCode == 65) {
				app.keys.aPressed=false;
			}
			if(event.keyCode == 87) {
				app.keys.wPressed=false;
			}
			if(event.keyCode == 68) {
				app.keys.dPressed=false;
			}
			if(event.keyCode == 83) {
				app.keys.sPressed=false;
			}
			// debugger
			if(event.keyCode == 219 || event.keyCode == 27) {
				app.keys.lbracPressed=false;
			}
			if (event.keyCode == 80) {
				app.keys.pPressed=false;
			}
		});

		document.addEventListener('blur', function() {
			app.keys.upPressed = false;
			app.keys.downPressed = false;
			app.keys.leftPressed = false;
			app.keys.rightPressed = false;
	
			app.keys.wPressed = false;
			app.keys.sPressed = false;
			app.keys.aPressed = false;
			app.keys.pPressed = false;
		});
	}
	
	return {
		// initializer
		init: init,
		
		// key variables
		leftPressed: false,
		rightPressed: false,
		upPressed: false,
		downPressed: false,
		aPressed: false,
		dPressed: false,
		wPressed: false,
		sPressed: false,
		lbracPressed: false,
		pPressed: false
	}
})()	;

//console.log("app.keys function finished");