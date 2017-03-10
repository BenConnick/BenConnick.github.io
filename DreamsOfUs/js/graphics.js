// graphics.js
// author: Ben Connick
// last modified: 3/9/2017

"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

// add graphics module
app.graphics = (function() {

	//console.log("app.graphics loaded");

	var init = function() {
		// get canvas context
		this.canvasElem = document.getElementById("bigCanvas")
		this.ctx = this.canvasElem.getContext("2d");
		
		// set widths
		this.canvasWidth = this.canvasElem.width;
		this.canvasHeight = this.canvasElem.height;
		
		//spritesheets and sprites
		this.emptyImage = new Image();
		
		this.leftControlsImg = new Image();
		this.leftControlsImg.src = "images/LeftControls.png";
		
		this.rightControlsImg = new Image();
		this.rightControlsImg.src = "images/RightControls.png";
		
		this.heartImg = new Image();
		this.heartImg.src = "images/heart.png";
		
		this.idleImg = new Image();
		this.idleImg.src = "images/idle.png";
		
		this.boyImg = new Image();
		this.boyImg.src = "images/boySpriteSheet.png";
		
		this.boyShadowImg = new Image();
		this.boyShadowImg.src = "images/boy_shadow.png";
		
		this.boySleepyImg = new Image();
		this.boySleepyImg.src = "images/boy_sleepy_face.png";
		
		this.boySquintImg = new Image();
		this.boySquintImg.src = "images/boy_squint_face.png";
		
		this.girlImg = new Image();
		this.girlImg.src = "images/girlSpriteSheet.png";
		
		this.girlShadowImg = new Image();
		this.girlShadowImg.src = "images/girl_shadow.png";
		
		this.girlSleepyImg = new Image();
		this.girlSleepyImg.src = "images/girl_sleepy_face.png";
		
		this.girlSquintImg = new Image();
		this.girlSquintImg.src = "images/girl_squint_face.png";
		
		this.catFaceImg = new Image();
		this.catFaceImg.src = "images/cats/catface.png";
		
		this.cloudImg = new Image();
		this.cloudImg.src = "images/cloud.png";
		
		this.starImg = new Image();
		this.starImg.src = "images/star.png";
		
		this.satelliteImg = new Image();
		this.satelliteImg.src = "images/satellite.png";
		
		this.checkImg = new Image();
		this.checkImg.src = "images/checkmark.png";
		
		this.xImg = new Image();
		this.xImg.src = "images/xmark.png";
		
		// clothes
		for (var i=0; i<7; i++) {
			this.clothesImgs[i] = new Image();
			this.clothesImgs[i].src = "images/clothes/"+(i+1)+".png"
		}
		// cats
		for (var i=0; i<2; i++) {
			this.catImgs[i] = new Image();
			this.catImgs[i].src = "images/cats/"+(i+1)+".png"
		}
		
		// birds
		for (var i=0; i<2; i++) {
			this.birdImgs[i] = new Image();
			this.birdImgs[i].src = "images/birds/"+(i+1)+".png"
		}
		
		/*this.nightmareImg = new Image();
		this.nightmareImg.src = "images/m.jpg";
		
		this.sweetImg = new Image();
		this.sweetImg.src = "images/s.jpg";*/
	}

	 // called by gameObjects
	 var updateAnimation = function(object) {
		 // increase frame number if ready 
		 if (object.percentToNextFrame >= 1) {
			 object.animFrame+=1;
			 object.percentToNextFrame = object.percentToNextFrame - Math.floor(object.percentToNextFrame);
		 }
		 // animation complete, what next?
		 if(object.animFrame >= object.anims[object.anim].numFrames) {
			  if (object.anims[object.anim].onComplete == "loop") {
				object.animFrame =  0;
			  } else {
				  object.anim = object.anims[object.anim].onComplete;
				  object.animFrame =  0;
			  }
		 }
		 
		// use deltatime
		object.percentToNextFrame += deltaTime/240; // 240 is an arbitrary constant
	 }	
	 
	 
	// global draw
	var draw = function() {
		// draw the background
		this.drawEnvironment(); 
		// draw P1 shadow
		//drawShadow(app.game.player1);
		// draw P2 shadow
		//drawShadow(app.game.player2);
		// draw gameobjects in the order they are created
		for (var i=app.game.gameObjects.length-1; i>=0; i--) {
			app.game.gameObjects[i].draw();
		}
		// particles
		app.game.particleEmitter.updateAndDraw(this.ctx,app.game.particleEmitter.location);
				
		
		this.drawUI();
	}
 
	var drawEnvironment = function() {
		 // reset all transforms
		 clear();
	
		// ****** draw the background ******
	
		// background imgage
		//ctx.drawImage(backgroundImg,0,0); not anymore
		
		// update background color
		var percent = app.game.gameTime/app.game.maxGameTime;
		this.wallColor = "rgb(" + Math.floor(255 - 1.5*percent*255) +"," + Math.floor(255 - 1.5*percent*255) + "," + Math.floor(255 - percent*255) + ")";
	
		// background color
		this.ctx.fillStyle=this.wallColor;
		this.ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
	
		/* used to be very important code, now not so much
		// draw line between players
		clear();
		this.ctx.strokeStyle="#FF0000";
		this.ctx.beginPath();
		// center of player 1
		this.ctx.moveTo(app.game.player1.x,app.game.player1.y);
		// center of player 2
		this.ctx.lineTo(app.game.player2.x,app.game.player2.y);
		this.ctx.stroke();
		this.ctx.closePath(); */
		
		this.ctx.strokeStyle = "#333";
		this.ctx.lineWidth = 2;
		// draw the clotheslines
		for (var i=0; i<app.game.clotheslines.length; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0,app.game.clotheslines[i].y);
			this.ctx.lineTo(this.canvasWidth,app.game.clotheslines[i].y);
			this.ctx.closePath();
			this.ctx.stroke();
		}
		
		clear();
	
	
	
	 }
	 
	 // dims the screen when paused
	 var drawPauseOverlay = function() {
	 	this.ctx.fillStyle = "rgba(0,0,0,0.5)";
	 	this.ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
	 }
 
	 var drawUI = function() {
	 	
	 	// tutorial
	 	// controls
	 	if (app.game.phase == 0.1) {
	 		this.ctx.drawImage(this.leftControlsImg,80,100);
	 		this.ctx.drawImage(this.rightControlsImg,840,100);
	 	}
	 	// collect cats
	 	if (app.game.phase == 0.2) {
	 		this.ctx.drawImage(this.catImgs[0],140,120);
	 		this.ctx.drawImage(this.checkImg,140,120);
	 		this.ctx.drawImage(this.catImgs[1],890,120);
	 		this.ctx.drawImage(this.checkImg,890,120);

	 	}
	 	// avoid clothes
	 	if (app.game.phase == 0.3) {
	 		this.ctx.drawImage(this.clothesImgs[0],150,120);
	 		this.ctx.drawImage(this.xImg,150,120);
	 		this.ctx.drawImage(this.clothesImgs[1],900,120);
	 		this.ctx.drawImage(this.xImg,900,120);
	 	}
	 	
	 	// player bounds
	 	this.ctx.lineWidth = "5";
	 	this.ctx.strokeStyle = "#ccccfa";
	 	this.ctx.beginPath();
	 	this.ctx.rect(app.game.player1.bounds[0],app.game.player1.bounds[2],app.game.player1.bounds[1]-app.game.player1.bounds[0],app.game.player1.bounds[3]-app.game.player1.bounds[2]);
	 	this.ctx.closePath();
	 	this.ctx.stroke();
	 	this.ctx.strokeStyle = "#facccc";
	 	this.ctx.beginPath();
	 	this.ctx.rect(app.game.player2.bounds[0],app.game.player2.bounds[2],app.game.player2.bounds[1]-app.game.player2.bounds[0],app.game.player2.bounds[3]-app.game.player2.bounds[2]);
	 	this.ctx.closePath();
	 	this.ctx.stroke();
	 	
	 	// tint 1
	 	this.ctx.fillStyle = "rgba(200,200,255,0.1)";
	 	this.ctx.fillRect(
	 	// left
	 	Math.max(app.game.player1.bounds[0],app.game.player2.bounds[1]-app.game.player2.bounds[0]),
	 	// top
	 	app.game.player1.bounds[2],
	 	// width
	 	app.game.player1.bounds[1]-app.game.player1.bounds[0],
	 	// height
	 	app.game.player1.bounds[3]-app.game.player1.bounds[2]);
	 	
	 	
	 	// tint 2
	 	this.ctx.fillStyle = "rgba(255,200,200,0.1)";
	 	this.ctx.fillRect(
	 	// left
	 	app.game.player2.bounds[0],
	 	// top
	 	app.game.player2.bounds[2],
	 	// width
	 	Math.min(app.game.player2.bounds[1]-app.game.player2.bounds[0], app.game.player1.bounds[0]),
	 	// height
	 	app.game.player2.bounds[3]-app.game.player2.bounds[2]);
	 	
	 	// bounds: [left, right, up, down]
	 	if (app.game.player2.bounds[1] < app.game.player1.bounds[0]) {
	 		this.ctx.fillStyle = "#000";
	 		// draw a black rectangle between the players bounds
	 		this.ctx.fillRect(app.game.player2.bounds[1],0,app.game.player1.bounds[0] - app.game.player2.bounds[1],1000);
	 	}
	 
		 // health indicator
		for (var i=0; i<app.game.lives; i++) {
			this.ctx.drawImage(this.heartImg,this.canvasWidth/2 + i*40 - app.game.lives*20,10);
		}
	
		// multiplier DEPRECATED
		/*this.ctx.font = "30px Arial";
		this.ctx.fillStyle = "#0000ff";
		this.ctx.textAlign = "center";
		this.ctx.fillText("x"+app.game.multiplier,400,40);*/
	
		// score 
		this.ctx.font = "30px Indie Flower";
		this.ctx.fillStyle = "#ffff66";
		this.ctx.textAlign = "right";
		this.ctx.fillText(Math.floor(app.game.score),this.canvasWidth/2,80);
		this.ctx.drawImage(this.catFaceImg,this.canvasWidth/2 - 100,50);
		
		if (app.game.phase == app.game.finalPhase) {
			this.endgameFadeInTimer += deltaTime;
			
			// curtain
			this.ctx.fillStyle = "rgba(0,0,0,"+(this.endgameFadeInTimer/this.endgameFadeInMax)+")";
			this.ctx.fillRect(0,0,this.canvasWidth,this.canvasHeight);
			
			// endgame message
			this.ctx.font = "50px Indie Flower";
			this.ctx.fillStyle = "rgba(255,255,255,"+(this.endgameFadeInTimer/this.endgameFadeInMax)+")";
			this.ctx.textAlign = "center";
			this.ctx.fillText("Thanks For Playing!",this.canvasWidth/2,150);
			this.ctx.font = "30px Indie Flower";
			this.ctx.fillText("Art by Lefan Shi",this.canvasWidth/2,200);
			this.ctx.fillText("Gameplay by Ben Connick",this.canvasWidth/2,250);
			this.ctx.fillText("Music by Kevin Macleod",this.canvasWidth/2,300);
			this.ctx.fillText('Cat sound from "IgnasD" of opengameart.org',this.canvasWidth/2,350);
			this.ctx.fillText('Hit sound from "artisticdude" of opengameart.org',this.canvasWidth/2,400);
			this.ctx.fillText('Airplane sound from freesoundeffects.com',this.canvasWidth/2,450);
		}
		
		if (x_debug_x) { this.drawDebugTools(); }
	 }
	 
	 var drawDebugTools = function() {
	 	// debug in yellow
	 	this.ctx.strokeStyle="yellow";
	 	for (var i=0; i<this.circles.length; i++) {
	 		this.ctx.beginPath();
			this.ctx.arc(this.circles[i].x,this.circles[i].y,this.circles[i].r,0,2*Math.PI);
			this.ctx.closePath();
			this.ctx.stroke();
	 	}
	 	this.circles.length = 0;
	 }
	 
	 var drawShadow = function(player) {
	 	//console.log(player.name);
        clear();
        app.graphics.ctx.globalAlpha = 0.2;
        // translate to appropriate position
        app.graphics.ctx.translate(player.x+5,player.y+5);
        // move to equivalent location
        /*if (player.name == "boy") {
        	app.graphics.ctx.translate(-1*app.game.player1.bounds[0],0);
        }
        if (player.name == "girl") {
        	app.graphics.ctx.translate(app.game.player1.bounds[0],0);
        }
        */
        angle = 0;
        // change angle according with velocity
        if (player.rotateWithXVel) {
        	// rotate to angle
        	app.graphics.ctx.rotate( Math.max(Math.min(player.xvelocity/30,0.2),-1) );
        }
        // offset
        app.graphics.ctx.translate(player.xanchor-53,player.yanchor-77.5);
        // flip for opposite direction
        if (player.left) { app.graphics.ctx.scale(-1,1); }
        // the -frameWidth/2 makes it so that the avatar is drawn from its center
        if (player.name == "boy") {
        	app.graphics.ctx.drawImage(app.graphics.boyShadowImg,0,0);
        }
        if (player.name == "girl") {
        	app.graphics.ctx.drawImage(app.graphics.girlShadowImg,0,0);
        }
        app.graphics.ctx.globalAlpha = 1;
        clear();
     };
     
     var drawDebugCircle = function(x,y,r) {
     	this.circles.push({x,y,r});
     }
 
	return {
		// run on start
		init: init,
		updateAnimation: updateAnimation,
		drawEnvironment: drawEnvironment,
		drawUI: drawUI,
		drawShadow: drawShadow,
		draw: draw,
		drawDebugCircle : drawDebugCircle,
		drawDebugTools: drawDebugTools,
		drawPauseOverlay: drawPauseOverlay,
		
	
		// ********************** VARS ************************
		
		// canvas information
		platformScale: 800, // width 800px

		// canvas 2d context
		canvasElem: undefined,
		ctx: undefined,
		
		// canvas dimensions
		canvasWidth: undefined,
		canvasHeight: undefined,
		
		// images
		emptyImage: undefined,
		backgroundImg: undefined,
		heartImg: undefined,
		idleImg: undefined,
		boyImg: undefined,
		boySleepyImg: undefined,
		boySquintImg: undefined,
		girlImg: undefined,
		girlSleepyImg: undefined,
		girlSquintImg: undefined,
		checkImg: undefined,
		xImg: undefined,
		clothesImgs: [],
		catImgs: [],
		birdImgs: [],
		birdImg: undefined,
		planeImg: undefined,
		satelliteImg: undefined,
		starImg: undefined,
		circles: [],
		
		// wall color mainly for visual debugging
		wallColor: "#eee",
		
		// misc
		endgameFadeInTimer: 0,
		endgameFadeInMax: 2000
	}
})();