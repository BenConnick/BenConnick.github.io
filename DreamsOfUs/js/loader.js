// loader.js
// author: Ben Connick
// last modified: 3/9/2017

/*
variable 'app' is in global scope - i.e. a property of window.
app is the single global object literal - all other functions and properties of 
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};


window.onload = function(){
	//console.log("window.onload called");
	
	
	// Preload Images and Sound
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	// on loaded, start game
	app.queue.on("complete", function(e){
		//console.log("sounds loaded!");
		app.game.Emitter = app.Emitter;
		// activate keyboard listeners
		app.keys.init();
		// activate sound controls
		/*app.sound.init();*/
		// activate drawing controls
		app.graphics.init();
		// play the game
		app.game.init(); 
		//initializeLoadingBar();
		//app.game.start(); wait for start button click
		
		// clear loading text
		q(".loadingText").style.display = "none";
		// show start button
		q("#m5").style.display = "block";
	});
	
	app.queue.loadManifest([
	
	{id: "In_Your_Arms", src:"sounds/In_Your_Arms.mp3"},
	
	{id: "Fresh_Air", src:"sounds/Fresh_Air.mp3"},
	
	{id: "meow", src:"sounds/Meow.mp3"},
	
	{id: "clothes_hit", src:"sounds/clothes_hit.mp3"},
	 
	{id: "leftControls", src:"images/LeftControls.png"},

	{id: "rightControls", src:"images/RightControls.png"},

	{id: "heart", src:"images/heart.png"},

	{id: "idle", src:"images/idle.png"},

	{id: "boy", src:"images/boySpriteSheet.png"},

	{id: "boyShadow", src:"images/boy_shadow.png"},

	{id: "boySleepy", src:"images/boy_sleepy_face.png"},

	{id: "boySquint", src:"images/boy_squint_face.png"},

	{id: "girl", src:"images/girlSpriteSheet.png"},

	{id: "girlShadow", src:"images/girl_shadow.png"},

	{id: "girlSleepy", src:"images/girl_sleepy_face.png"},

	{id: "girlSquint", src:"images/girl_squint_face.png"},

	{id: "catFace", src:"images/cats/catface.png"},

	{id: "cloud", src:"images/cloud.png"},

	{id: "star", src:"images/star.png"},

	{id: "satellite", src:"images/satellite.png"},

	{id: "check", src:"images/checkmark.png"},

	{id: "x", src:"images/xmark.png"},

	{id: "clothes1", src:"images/clothes/1.png"},
	{id: "clothes2", src:"images/clothes/2.png"},
	{id: "clothes3", src:"images/clothes/3.png"},
	{id: "clothes4", src:"images/clothes/4.png"},
	{id: "clothes5", src:"images/clothes/5.png"},
	{id: "clothes6", src:"images/clothes/6.png"},
	{id: "clothes7", src:"images/clothes/7.png"},

	{id: "cat1", src:"images/cats/1.png"},
	{id: "cat2", src:"images/cats/2.png"},

	{id: "bird1", src:"images/birds/1.png"},
	{id: "bird2", src:"images/bords/2.png"}
	]);
}

app.IMAGES = {
	
	leftControls: "images/LeftControls.png",

	rightControls: "images/RightControls.png",

	heart: "images/heart.png",

	idle: "images/idle.png",

	boy: "images/boy.png",
	
	boyShadow: "images/boy_shadow.png",
	
	boySleepy: "images/boy_sleepy_face.png",
	
	boySquint: "images/boy_squint_face.png",

	girl: "images/girl.png",
	
	girlShadow: "images/girl_shadow.png",
	
	girlSleepy: "images/girl_sleepy_face.png",
	
	girlSquint: "images/girl_squint_face.png",
	
	catFace: "images/cats/catface.png",
	
	cloud: "images/cloud.png",
	
	star: "images/star.png",
	
	satellite: "images/satellite.png",
	
	check: "images/checkmark.png",
	
	x: "images/xmark.png",
	
	clothes1: "images/clothes/1.png",
	clothes2: "images/clothes/2.png",
	clothes3: "images/clothes/3.png",
	clothes4: "images/clothes/4.png",
	clothes5: "images/clothes/5.png",
	clothes6: "images/clothes/6.png",
	clothes7: "images/clothes/7.png",
	
	cat1: "images/cats/1.png",
	cat2: "images/cats/2.png",

	bird1: "images/birds/1.png",
	bird2: "images/bords/2.png"

 };

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