/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is the single global object literal - all other functions and properties of 
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};


window.onload = function(){
	console.log("window.onload called");
	
	
	// Preload Images and Sound
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	// on loaded, start game
	app.queue.on("complete", function(e){
		console.log("sounds loaded!");
		// activate keyboard listeners
		app.keys.init();
		// activate sound controls
		/*app.sound.init();*/
		// activate drawing controls
		app.graphics.init();
		// play the game
		app.game.init(); 
		initializeLoadingBar();
		//app.game.start(); wait for start button click
	});
	
	app.queue.loadManifest([
	 {id: "clothes_hit", src:"sounds/clothes_hit.mp3"},
	 {id: "meow", src:"sounds/Meow.mp3"},
	 {id: "In_Your_Arms", src:"sounds/In_Your_Arms.mp3"}
	]);
}

// needed for loadingbar
var imagesLoaded = 0;
var images = document.getElementsByTagName("img");
function initializeLoadingBar() {
	for (var i=0; i<images.length; i++) {
		images.onload = function() { 
			imagesLoaded++;
		};
	}
}
function updateLoadingBar() {
	// loading in progress
	if (imagesLoaded < images.length) {
		app.graphics.ctx.fillText("Loading: "+imagesLoaded+"/"+images.length,320,240);
	}
}


/*window.onblur = function() {
	console.log("blur at " + Date());
	app.main.pauseGame();
}

window.onfocus = function(){
	console.log("focus at " + Date());
	app.main.resumeGame();
};*/

/*localBtn.onclick = function() { 
	hideElement(mainMenu);
	start(); 
};

resetBtn.onclick = function() {
	hideElement(gameOverScreen);
	displayBlock(bigCanvas);
	paused = false;
	resetAll();
}*/