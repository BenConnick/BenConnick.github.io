// game.js
// author: Ben Connick
// last modified: 3/9/2017

"use strict";

// if app exists get a reference, otherwise create app
var app = (app || {});
// create game module
app.game = (function() {
	
	//console.log("app.game loaded");
	
	// set up the game, runs once at start
	var init = function() {
	
		// game values
		this.endingFrameWidth = app.graphics.canvasWidth;
		
		// a vector that can be overwritten instead of creating new vectors every update
		this.reusableVector = new Vector2D(0,0);
	
		// this.players
		// p1
		this.player1 = new GameObject();
		this.player1.name = "boy";
		this.player1.x = app.graphics.canvasWidth/2;
		this.player1.y = app.graphics.canvasHeight/2;
		this.player1.anims["idle"] = new Animation("idle", 106, 200, 3, app.graphics.boyImg);
		this.player1.anim = "idle";
		this.player1.rotateWithXVel = true;
		this.player1.bounds = [0, app.graphics.canvasWidth, 0, app.graphics.canvasHeight];
		this.gameObjects.push(this.player1);
		// face
		this.p1face = new GameObject();
		this.p1face.anims["idle"] = new Animation("idle",77,34,1,app.graphics.boySleepyImg);
		this.p1face.anims["hurt"] = new Animation("hurt",77,34,1,app.graphics.boySquintImg);
		this.p1face.yanchor=9.5;
		this.p1face.xanchor=4;

		// p2
		this.player2 = new GameObject();
		this.player2.name = "girl";
		this.player2.x = app.graphics.canvasWidth/2;
		this.player2.y = app.graphics.canvasHeight/2;
		this.player2.anims["idle"] = new Animation("idle", 113, 200, 3, app.graphics.girlImg);
		this.player2.anim = "idle";
		this.player2.rotateWithXVel = true;
		this.player2.bounds = [0, 0, 0, app.graphics.canvasHeight];
		this.gameObjects.push(this.player2);
		// face
		this.p2face = new GameObject();
		this.p2face.anims["idle"] = new Animation("idle",77,34,1, app.graphics.girlSleepyImg);
		this.p2face.anims["hurt"] = new Animation("hurt",77,34,1, app.graphics.girlSquintImg);
		this.p2face.yanchor=-8;
		this.p2face.xanchor=2;
		
		// screens
		this.mainMenuScreen = q("#mainMenu");
		this.gameOverScreen = q("#gameOver");
		//q("#start").onclick = function() { app.game.start(); hideElement(q('#mainMenu')); }
		q("#mainMenu").onclick = function() { app.game.start(); hideElement(q('#mainMenu')); }
		q("#retryBtn").onclick = function() { app.game.resetAll(); hideElement(q('#gameOver'));}	
		
		// music
		// create first soundtrack
		this.backgroundMusic1 = createjs.Sound.play("In_Your_Arms");
		// create second soundtrack
		this.backgroundMusic2 = createjs.Sound.play("Fresh_Air");
		// pause tracks until needed
		this.backgroundMusic1.paused = true;
		this.backgroundMusic2.paused = true;
		// do not loop for crying out loud...
		this.backgroundMusic1.loop = 0;
		// 	set track 1  to the active var
		this.backgroundMusic = this.backgroundMusic1;
		
		// when track 1 is done, start track 2
		this.backgroundMusic1.on("complete",function() { 
			//console.log("bgmusic: "+app.game.backgroundMusic);
			app.game.backgroundMusic1.paused = true;
			// make track 2 the active track
			app.game.backgroundMusic = app.game.backgroundMusic2; 
			app.game.backgroundMusic.paused = false;
		} );
		
		// particles for when you hit a cat
		this.particleEmitter = new this.Emitter();

		// set color white
		/*this.particleEmitter.red = this.particleEmitter.green = 240;
		this.particleEmitter.blue = 255;*/
		this.particleEmitter.image = app.graphics.heartImg;
		
		window.onblur = function() { 
			app.game.pause();
		}
		window.onfocus = function() { 
			app.game.unpause();
		}
	}
	
	var pause = function() {
		if (app.game.started) {
				app.graphics.drawPauseOverlay();
				app.game.paused = true; 
				app.game.backgroundMusic.paused = true; 
				window.cancelAnimationFrame(app.game.animationFrameID);
		}
	}
	
	var unpause = function() {
		if (app.game.started) {
				app.game.paused = false; 
				//app.game.backgroundMusic.play(); 
				app.game.backgroundMusic.paused = false; 
				prevTime = Date.now();
				app.game.animationFrameID = window.requestAnimationFrame(app.game.gameLoop);
		}
	}

	// the loop that runs every time the browser updates
	var gameLoop = function() {
		//console.log(this);
		
		app.game.animationFrameID = window.requestAnimationFrame(app.game.gameLoop); // call gameLoop every frame
		app.game.update();
		app.graphics.draw();
	}

	// global update  
	var update = function() {
		// update refresh latency
		deltaTime = Date.now() - prevTime;
		prevTime = Date.now();
		
		this.backgroundMusic.volume = this.masterVolume;
		
		if (!this.paused) {
			// increase game time
			this.gameTime += deltaTime;
			// check gameover
			if (this.lives > 0) {
				// update score
				//this.score += deltaTime*this.multiplier/1000;
				if (this.score > 1000000000) {
					this.score = 0;
				}

				// if the game is running, allow player control
				if (this.phase != this.finalPhase) {
					// handle keyboard input and apply acceleration 
					this.handleKeypresses(); 
					// handle this.player behavior
					this.updatePlayers(); 
				}
				else { 
					this.playersExitStageTop(); 
				}
	
				// update positions etc
				this.updateGameObjects();
		
				
				switch(this.phase) {
					case 0:
						break;
					case 0.01:
						// center the players
						this.player1.x = 920;
						this.player2.x = 180;
						this.player1.y = 400;
						this.player2.y = 400;
						
						// immediately go to phase 0.1
						this.phase = 0.1;
						
						// do not break, keep going
					case 0.1:
						// go to next phase when time up
						if (this.gameTime > this.maxGameTime * 0.02) {
							this.phase = 0.2;
						}
					case 0.2:
						// go to next phase when time up
						if (this.gameTime > this.maxGameTime * 0.04) {
							this.phase = 0.3;
						}
					case 0.3:
						// move the pickups
						this.updateCats();
						
						// move the clotheslines
						this.updateClotheslines();
						
						if (this.gameTime > this.maxGameTime * 0.05) {
							this.phase1Start();
						}
						break;
					case 1:
						// handle obstacle behavior
						this.updateClothes();
	
						// move the pickups
						this.updateCats();
				
						// move the clotheslines
						this.updateClotheslines();
						
						// check for end of phase
						
						// x = time coefficient for frame midpoint
						// total time / 2 if from 0 to maxW
						// total time / x if from minW to maxW
						// p = totaltime * (maxW-0) / 2
						// p = totaltime * (maxW-minW)  / x
						// maxW / 2 = (maxW-minW) / x
						// x = 2*(maxW-minW) / maxW
						// x = 2*(1-minW/maxW)
						//						therefore
						//if (this.gameTime > this.maxGameTime*2*(1-this.startingFrameWidth/this.endingFrameWidth)) {
						
						// fuck it, nothing works, hard coding it
						if (this.gameTime > this.maxGameTime * 0.25) {
							this.phase1Cooldown();
						}
						break;
					case 1.5:
						this.phase1Cooldown();
					case 2:
						// handle obstacle behavior
						this.updateBirds();
						// handle scenery
						this.updateClouds();
						// move the pickups
						//this.updateCats();
						
						// check for end of phase
						if (this.gameTime > this.maxGameTime * 0.55) {
							this.phase3Start();
						}
						break;
					case 3:
					
						this.updateStars();
						this.updateSatellites();
						if (this.gameTime > this.maxGameTime * 0.9) {
							this.phase3Cooldown();
							//this.phase = this.finalPhase;
						}
						break;
					case 3.5: 
						this.phase3Cooldown();
						this.updateStars();
						if (this.gameTime > this.maxGameTime) {
							this.finalPhaseStart();
							//this.phase = this.finalPhase;
						}
					case this.finalPhase:
						break; // endgame
				}
				
			}
			else {
				displayBlock(this.gameOverScreen);
				//hideElement(graphics.canvasElem);
				this.paused = true;
			}
		}
		this.particleEmitter.timeout -= deltaTime;
	
	}

	// this.player input
	var handleKeypresses = function() {
		var accel = 20;
	
		// this.player 1
		if (app.keys.rightPressed) {
			//console.log(this.player2.x);
		   this.player1.xvelocity+=accel*(deltaTime/1000);
		   if (this.player1.xvelocity > this.player1.maxVelocity) { this.player1.xvelocity = this.player1.maxVelocity; }
		}
		if (app.keys.leftPressed) {
			this.player1.xvelocity-=accel*(deltaTime/1000);
			if (this.player1.xvelocity < -this.player1.maxVelocity) { this.player1.xvelocity = -this.player1.maxVelocity; }
		}
		if (!app.keys.rightPressed && !app.keys.leftPressed || app.keys.rightPressed && app.keys.leftPressed) {
			if (this.player1.xvelocity < 0) {
				this.player1.xvelocity+=accel*(deltaTime/1000);
			}
			if (this.player1.xvelocity > 0) {
				this.player1.xvelocity-=accel*(deltaTime/1000);
			}
			if (Math.abs(this.player1.xvelocity) < 1 ) {
				this.player1.xvelocity = 0;
			}
		}
		if (app.keys.downPressed) {
			//console.log(this.player2.x);
		   this.player1.yvelocity+=accel*(deltaTime/1000);
		   if (this.player1.yvelocity > this.player1.maxVelocity) { this.player1.yvelocity = this.player1.maxVelocity; }
		}
		if (app.keys.upPressed) {
			this.player1.yvelocity-=accel*(deltaTime/1000);
			if (this.player1.yvelocity < -this.player1.maxVelocity) { this.player1.yvelocity = -this.player1.maxVelocity; }
		}
		if (!app.keys.upPressed && !app.keys.downPressed || app.keys.upPressed && app.keys.sdownPressed) {
			if (this.player1.yvelocity < 0) {
				this.player1.yvelocity+=accel*(deltaTime/1000);
			}
			if (this.player1.yvelocity > 0) {
				this.player1.yvelocity-=accel*(deltaTime/1000);
			}
			if (Math.abs(this.player1.yvelocity) < 1 ) {
				this.player1.yvelocity = 0;
			}
		}
	
		// this.player 2
		if (app.keys.dPressed) {
		   this.player2.xvelocity+=accel*(deltaTime/1000);
		   if (this.player2.xvelocity > this.player2.maxVelocity) { this.player2.xvelocity = this.player2.maxVelocity; }
		}
		if (app.keys.aPressed) {
			this.player2.xvelocity-=accel*(deltaTime/1000);
			if (this.player2.xvelocity < -this.player2.maxVelocity) { this.player2.xvelocity = -this.player2.maxVelocity; }
		}
		if (!app.keys.dPressed && !app.keys.aPressed) {
			if (this.player2.xvelocity < 0) {
				this.player2.xvelocity+=accel*(deltaTime/1000);
			}
			if (this.player2.xvelocity > 0) {
				this.player2.xvelocity-=accel*(deltaTime/1000);
			}
			if (Math.abs(this.player2.xvelocity) < 1 ) {
				this.player2.xvelocity = 0;
			}
		}
		if (app.keys.sPressed) {
		   this.player2.yvelocity+=accel*(deltaTime/1000);
		   if (this.player2.yvelocity > this.player2.maxVelocity) { this.player2.yvelocity = this.player2.maxVelocity; }
		}
		if (app.keys.wPressed) {
			this.player2.yvelocity-=accel*(deltaTime/1000);
			if (this.player2.yvelocity < -this.player2.maxVelocity) { this.player2.yvelocity = -this.player2.maxVelocity; }
		}
		if (!app.keys.wPressed && !app.keys.sPressed) {
			if (this.player2.yvelocity < 0) {
				this.player2.yvelocity+=accel*(deltaTime/1000);
			}
			if (this.player2.yvelocity > 0) {
				this.player2.yvelocity-=accel*(deltaTime/1000);
			}
			if (Math.abs(this.player2.yvelocity) < 1 ) {
				this.player2.yvelocity = 0;
			}
		}
		
		if (app.keys.lbracPressed) {
			app.keys.lbracPressed = false;
			toggleDebug();
		}
		
		if (app.keys.pPressed) {
			app.keys.pPressed = false;
			togglePauseMenu();
			pause();
		}
	 }
 
 	var updateGameObjects = function() {
 		// changes the sprite's animation for all GameObjects
		for (var i=0; i<this.gameObjects.length; i++) {
			this.gameObjects[i].update();
		}
 	}
 
	var updatePlayers = function() {
		
		// (invincible timer moved to gameobject draw)
		
		// update frame width
		var frameWidth = Math.min(app.graphics.canvasWidth, MapValue(this.gameTime,0,this.maxGameTime,this.startingFrameWidth,this.endingFrameWidth));
		this.player1.bounds[0] = app.graphics.canvasWidth - frameWidth;
		this.player2.bounds[1] = frameWidth;
		
		for (var i=0; i<this.obstacles.length; i++) {
			// only check if the this.players are vulnerable
			if (this.player1.flashingTime <= 0) {
				if (this.p1face.anim == "hurt") {
					this.p1face.anim = "idle";
				}
				if (this.checkCollisionWithPlayer(this.player1,this.obstacles[i].x,this.obstacles[i].y,30)) {
					this.player1.flashingTime = 3000;
					this.p1face.anim = "hurt";
					this.lives-=1;
					var hit = createjs.Sound.play("clothes_hit");
					hit.volume = this.masterVolume;
				}
			}
			// only check if the this.players are vulnerable
			if (this.player2.flashingTime <= 0) {
				if (this.p2face.anim == "hurt") {
					this.p2face.anim = "idle";
				}
				if (this.checkCollisionWithPlayer(this.player2,this.obstacles[i].x,this.obstacles[i].y,30)) {
					this.player2.flashingTime = 3000;
					this.p2face.anim = "hurt";
					this.lives-=1;
					var hit = createjs.Sound.play("clothes_hit");
					hit.volume = this.masterVolume;
				}
			}
			
			if (x_debug_x) { 
				app.graphics.drawDebugCircle(this.player1.x,this.player1.y,this.playerRadius); 
				app.graphics.drawDebugCircle(this.player2.x,this.player2.y,this.playerRadius); 
			}
		}
	}
	
	var playersExitStageTop = function() {
		// allow the players to move through the top
		this.player1.bounds[2] = -1000;
		this.player2.bounds[2] = -1000;
	
		// move player 1 off the screen
		//this.reusableVector.x = app.graphics.canvasWidth/2 - this.player1.x;
		this.reusableVector.x = app.graphics.canvasWidth/2 - this.player1.x;
		this.reusableVector.y = -100 - this.player1.y;
		this.player1.xvelocity = sign(this.reusableVector.x) * (this.player1.maxVelocity-1) * Math.sqrt(this.reusableVector.x*this.reusableVector.x/this.reusableVector.magSqr());
		this.player1.yvelocity = sign(this.reusableVector.y) * (this.player1.maxVelocity-1) * Math.sqrt(this.reusableVector.y*this.reusableVector.y/this.reusableVector.magSqr());
		
		// move player 2 off the screenplayer2
		this.reusableVector.x = app.graphics.canvasWidth/2 - this.player2.x;
		this.reusableVector.y = -100 - this.player2.y;
		this.player2.xvelocity = sign(this.reusableVector.x) * (this.player2.maxVelocity-1) * Math.sqrt(this.reusableVector.x*this.reusableVector.x/this.reusableVector.magSqr());
		this.player2.yvelocity = sign(this.reusableVector.y) * (this.player2.maxVelocity-1) * Math.sqrt(this.reusableVector.y*this.reusableVector.y/this.reusableVector.magSqr());
	}
	
	var cooldownClotheslines = function() {
		for (var i=0; i<this.clotheslines.length; i++) {
			this.clotheslines[i].y += 5*deltaTime/20;
		}
	}

	var updateClotheslines = function() {
		// loop through "clothesline" objects and move them down the page
		for (var i=0; i<this.clotheslines.length; i++) {
			this.clotheslines[i].y += 5*deltaTime/20;
			
			// if the clothesline is far enough off the screen, move to the top
			if (this.clotheslines[i].y > ( app.graphics.canvasHeight * (1+1/this.clotheslines.length) ) ) {
				
				// put clothesline back on top
				this.clotheslines[i].y = ( (this.clotheslines[i].y) % ( app.graphics.canvasHeight * (1 + 1/this.clotheslines.length) ) ) - 200;
				
				// represents slots
				var slots = [];
				for (var j=0; j<this.clotheslines[i].numSlots; j++) {
					slots[j] = 0;
				}
				
				// use gaps
				var gaps = [];
				// fill a random slot with a gap
				// left screen
				gaps[0] = Math.floor(Math.random()*3);
				// right screen
				gaps[1] = 3 + Math.floor(Math.random()*3);
				// middle screen
				gaps[2] = 6 + Math.floor(Math.random()*3);
				
				// gaps
				slots[gaps[0]] = 1;
				slots[gaps[1]] = 1;
				slots[gaps[2]] = 1;
				
				// assign the slots on the clothesline
				var slotsTaken = 3; // three gaps
				var gapsNeeded = 2;
				
				// cloudy with a chance of cats
				if (Math.random() < this.catChance) { 
					
					var catSpot = gaps[Math.floor(Math.random()*3)];
					for (var j=0; j<this.cats.length; j++) {
						if (!this.cats[j].enabled) {
							// set top of clothing to the line
							this.cats[j].y = this.clotheslines[i].y+50;
							// set the xpos to its slot
							this.cats[j].x = this.clothesWidth/1.7 + catSpot*this.clothesWidth;
							// enable
							this.cats[j].enabled = true;
							//console.log("cat");
							break;
						}
					}
				}
				
				
				// find recycled obstacles and put them on the clothesline
				for (var j=0; j<this.obstacles.length; j++) {
					// if we're out of slots, break
					if (slotsTaken >= this.clotheslines[i].numSlots) break;
					
					// skip gaps
					//if (slotsTaken==gaps[0] || slotsTaken==gaps[1] || slotsTaken==gaps[2]) slotsTaken++;
					
					// if disabled recycle
					if (!this.obstacles[j].enabled) {
						// exit while loop
						var found = false;
						// create index holder
						var idx = Math.floor(Math.random()*slots.length);
						// randomly find spots until one sticks
						while (!found) {
							if (slots[idx] == 0) {
								slots[idx] = 1;
								slotsTaken++;
								found = true;
								break;
							}
							idx = Math.floor(Math.random()*slots.length);
						}
						// set top of clothing to the line
						this.obstacles[j].y = this.clotheslines[i].y+50;
						//this.obstacles[j].yvelocity = 3;
						// set the xpos to its slot
						this.obstacles[j].x = this.clothesWidth/1.7 + idx*this.clothesWidth;
						// enable
						this.obstacles[j].enabled = true;
					}
				}
			}
		}
		
	}

	var updateClothes = function() {
		for (var i=0; i<this.obstacles.length; i++) {
			// when the baddie goes off screen, recycle
			if (this.obstacles[i].y > app.graphics.canvasHeight*(this.clotheslines.length+1)/this.clotheslines.length) {
				this.obstacles[i].enabled = false;
			}
		}
	}

	var updateCats = function() {
		for (var i=0; i<this.cats.length; i++) {
		
			// rotate the cats
			this.cats[i].angle = Math.sin(prevTime/200)/10;
			
			// when the pickup goes off screen, reset
			if (this.cats[i].y > app.graphics.canvasHeight*(1 + 1/this.clotheslines.length) ) {
				this.cats[i].enabled = false;
			}
			
			// always check
			if (this.cats[i].enabled) {
				//filterColor = "rgba(0,0,0,0.6)";
				if (this.checkCollisionWithPlayer(this.player1,this.cats[i].x,this.cats[i].y,50) ||
					this.checkCollisionWithPlayer(this.player2,this.cats[i].x,this.cats[i].y,50) ) {
					this.score += 1;
					var meow = createjs.Sound.play("meow");
					meow.volume = this.masterVolume;
					//this.cats[i].y = this.canvasHeight + 100;
					this.cats[i].enabled = false;
					this.lives++;
					this.particleEmitter.createParticles({x: this.cats[i].x,y: this.cats[i].y})
					this.particleEmitter.timeout = 500;
				}
			}
		}
	}
	
	var updateBirds = function() {
		this.birdTimer += deltaTime;
		for (var i=0; i<this.obstacles.length; i++) {
			if (this.obstacles[i].enabled) {
				//console.log("bird " + i + "x: " + this.obstacles[i].x + ", y: "+this.obstacles[i].y);
				// when the baddie goes off screen, recycle
				if (this.obstacles[i].y > app.graphics.canvasHeight + 200) {
					this.obstacles[i].enabled = false;
					//console.log("bottom " + i + "x: " + this.obstacles[i].x + ", y: "+this.obstacles[i].y);
				}
				if (this.obstacles[i].x > app.graphics.canvasWidth + 200 || 
				this.obstacles[i].x < -200) {
					this.obstacles[i].enabled = false;
					//console.log("leftright " + i + "x: " + this.obstacles[i].x + ", y: "+this.obstacles[i].y);
				}
			}
			// queue to fly in from off screen
			else {
				if (this.birdQueue.indexOf(this.obstacles[i])<0) {this.birdQueue.push(this.obstacles[i]); }
			}
		}
		var numBirds = 9;
		if (this.birdQueue.length >= numBirds && this.birdTimer > 2000) {
			// shuffle
			for (var i=this.birdQueue.length-1; i>=0; i--) {
				// pick random
				var randIdx = Math.floor(Math.random()*this.birdQueue.length);
				// swap
				var temp = this.birdQueue[i];
				this.birdQueue[i] = this.birdQueue[randIdx];
				this.birdQueue[randIdx] = temp;
			}
			
			var gap = Math.floor(Math.random()*this.birdQueue.length);
			var offset = 0;
			//console.log("bird " + i + " disabled, at position: " + this.obstacles[i].x + ","+this.obstacles[i].y);
			for (var i=0; i<numBirds; i++) {
				if (i==gap) offset++;
				// random height
				this.birdQueue[i].y = (offset+i-1)*225;
				// flip a coin, left or right
				if (Math.random() > 0.5) {
					this.birdQueue[i].left = false;
					this.birdQueue[i].x = -100;
					this.birdQueue[i].xvelocity = 5;
				} else {
					this.birdQueue[i].left = true;
					this.birdQueue[i].x = app.graphics.canvasWidth + 100;
					this.birdQueue[i].xvelocity = -5;
				}
				this.birdQueue[i].enabled = true;
			}
			this.birdQueue.splice(0,numBirds);
			//console.log(this.birdQueue.length);
			this.birdTimer = 0;
		}
	}
	
	var updateClouds = function() {
		for (var i=0; i<this.clouds.length; i++) {
			//console.log(this.clouds[i].y);
			if (this.clouds[i].y > app.graphics.canvasHeight + 100) {
				this.clouds[i].y = -100;
				this.clouds[i].x = Math.random()*app.graphics.canvasWidth;
			}
		}
	}
	
	var updateStars = function() {
		for (var i=0; i<this.stars.length; i++) {
			//console.log(this.stars[i].y);
			if (this.stars[i].y > app.graphics.canvasHeight + 100) {
				this.stars[i].y = -100;
				this.stars[i].x = Math.random()*app.graphics.canvasWidth;
			}
		}
	}
	
	var updateSatellites = function() {
		for (var i=0; i<this.obstacles.length; i++) {
			if (this.obstacles[i].y > app.graphics.canvasHeight + 100) {
				this.obstacles[i].y = -100;
				this.obstacles[i].x = Math.random()*app.graphics.canvasWidth;
				this.obstacles[i].angle = Math.random() * 2 * Math.PI;
			}
			if (!this.obstacles[i].enabled) {
				this.obstacles[i].enabled = true;
				this.obstacles[i].y = -100 - Math.random()*app.graphics.canvasHeight*2;
				//console.log(this.obstacles[i].y);
				this.obstacles[i].x = Math.random()*app.graphics.canvasWidth;
				this.obstacles[i].angle = Math.random() * 2 * Math.PI;
			}
		}
	}
	
	var introStart = function() {
		// phase change
		this.phase = 0.01;
		
		// start music
		this.backgroundMusic1.paused = false;
		
		// cat pickups
		this.numberOfPickups = 9;
		for (var i=0; i<this.numberOfPickups; i++) {
			var cat = new GameObject();
			cat.name = "cat"+i;
			cat.anims["idle"] = new Animation("idle", 105, 105, 1,app.graphics.catImgs[i%2]);
			cat.anim = "idle";
			cat.x = -100; // offscreen
			cat.y = (1000/this.numberOfPickups)*i;
			cat.yvelocity = 5;
			cat.enabled = false;
			cat.rotateWithXVel = false;
			this.gameObjects.push(cat);
			this.cats.push(cat);
		}
		
		// clotheslines
		var numclotheslines = 3
		for(var i=0; i<numclotheslines; i++) {
			this.clotheslines[i] = {};
			this.clotheslines[i].x=0;
			this.clotheslines[i].y=i*app.graphics.canvasHeight/(numclotheslines-1);
			this.clotheslines[i].numSlots = Math.floor((app.graphics.canvasWidth)/this.clothesWidth);
		}
	}
	
	var phase1Start = function()  {
		// change phase 
		this.phase = 1;
	
		// clothes obstacles
		this.numberOfObstacles = 30;
		for (var i=0; i<this.numberOfObstacles; i++) {
			var obstacle = new GameObject();
			obstacle.name = "clothes"+i;
			obstacle.anims["idle"] = new Animation("idle", 105, 105, 1,app.graphics.clothesImgs[i%7]);
			obstacle.anim = "idle";
			obstacle.x = -100; // offscreen
			obstacle.y = (1000/this.numberOfObstacles)*i;
			obstacle.yvelocity = 5;
			obstacle.startTime=0;
			obstacle.enabled = false;
			this.gameObjects.push(obstacle);
			this.obstacles.push(obstacle);
		}
	}
	
	var phase1Cooldown = function() {
		this.phase = 1.5;
		this.cooldownClotheslines();
		var done = true;
		this.clotheslines.forEach(function(cl) {
			if (cl.y < app.graphics.canvasHeight + 10) {
				done = false;
			}
		});
		if (done) this.phase2Start();
	}
	
	var phase2Start = function()  {
		//console.log("phase 2 start");
	
		// change phase 
		this.phase = 2;
		
		//this.gameTime = this.maxGameTime * 0.275 + 1;
		
		// clear out the clothes and clotheslines
		this.clearOldObstacles();	
		this.clearAllClotheslines();
		this.birdQueue = [];
		
		// bird obstacles
		this.numberOfObstacles = 20;
		for (var i=0; i<this.numberOfObstacles; i++) {
			var obstacle = new GameObject();
			obstacle.name = "bird"+i;
			obstacle.anims["idle"] = new Animation("idle", 80, 80, 1,app.graphics.birdImgs[i%2]);
			obstacle.anim = "idle";
			obstacle.x = -100; // offscreen
			obstacle.y = (1000/this.numberOfObstacles)*i;
			obstacle.rotateWithXVel = false;
			obstacle.yvelocity = 1;
			obstacle.startTime=0;
			obstacle.enabled = false;
			this.gameObjects.push(obstacle);
			this.obstacles.push(obstacle);
		}
		
		// clouds 
		for (var i=0; i<10; i++) {
			var cloud = new GameObject();
			cloud.name = "cloud"+i;
			cloud.anims["idle"] = new Animation("idle", 290, 150, 1,app.graphics.cloudImg);
			cloud.anim = "idle";
			cloud.x = app.graphics.canvasWidth*Math.random(); // offscreen
			cloud.y = -1*app.graphics.canvasHeight*Math.random() - 100;
			cloud.rotateWithXVel = false;
			cloud.yvelocity = 1;
			cloud.startTime=0;
			cloud.enabled = true;
			this.gameObjects.push(cloud);
			this.clouds.push(cloud);
		}

		// love letter pickups
		/*this.numberOfPickups = 9;
		for (var i=0; i<this.numberOfPickups; i++) {
			var cat = new GameObject();
			cat.anims["idle"] = new Animation("idle", 105, 105, 1,app.graphics.catImgs[i%2]);
			cat.anim = "idle";
			cat.x = -100; // offscreen
			cat.y = (1000/this.numberOfPickups)*i;
			cat.yvelocity = 5;
			cat.enabled = false;
			cat.rotateWithXVel = false;
			this.gameObjects.push(cat);
			this.cats.push(cat);
		}*/
		
		this.gameObjects.forEach(function(go) {
			//console.log(go);
		});
	}
	
	var phase3Start = function()  {
		this.gameTime = this.maxGameTime * 0.55 + 1;
		
		// change phase 
		this.phase = 3;
		
		// clear birds
		this.clearOldObstacles();
		
		// stars 
		for (var i=0; i<20; i++) {
			var star = new GameObject();
			star.name = "star"+i;
			star.anims["idle"] = new Animation("idle", 14, 13, 1,app.graphics.starImg);
			star.anim = "idle";
			star.x = app.graphics.canvasWidth*Math.random(); // offscreen
			star.y = -1*app.graphics.canvasHeight*Math.random() - 50;
			star.rotateWithXVel = false;
			star.yvelocity = 1;
			star.startTime=0;
			star.enabled = true;
			this.gameObjects.push(star);
			this.stars.push(star);
		}
		
		// satellitevobstacles
		this.numberOfObstacles = 10;
		for (var i=0; i<this.numberOfObstacles; i++) {
			var obstacle = new GameObject();
			obstacle.name = "satellite"+i;
			obstacle.anims["idle"] = new Animation("idle", 240, 240, 1,app.graphics.satelliteImg);
			obstacle.anim = "idle";
			obstacle.x = -100; // offscreen
			obstacle.y = (1000/this.numberOfObstacles)*i;
			obstacle.rotateWithXVel = false;
			obstacle.yvelocity = 5;
			obstacle.startTime=0;
			obstacle.enabled = false;
			this.gameObjects.push(obstacle);
			this.obstacles.push(obstacle);
		}
	}
	
	var phase3Cooldown = function() {
		
		this.phase = 3.5;
	
		// clear satellitevobstacles
		this.numberOfObstacles = 10;
		var done = true;
		this.obstacles.forEach(function(o) {
			if (o.y < app.graphics.canvasHeight + 200) {
				done = false;
			}
		});
		if (done) this.finalPhaseStart();
	}
	
	var finalPhaseStart = function() {
		// final phase
		this.phase = this.finalPhase;
	}
	
	var clearAllClotheslines = function() {
		this.clotheslines.length = 0;
	}
	
	var clearOldObstacles = function () {
		this.obstacles.forEach(function(obs) {
			obs.enabled = false;
		});
		this.obstacles = [];
	}
	
	var clearOldPickups = function () {
		this.pickups.forEach(function(pu) {
			pu.enabled = false;
		});
		this.pickups.length = 0;
	}

	// checks to see if the point hits a player, x and y are the point and r is the radius
	var checkCollisionWithPlayer = function(player,x,y,r) {
		
		// draw hitcircles
		if(x_debug_x) { app.graphics.drawDebugCircle(x,y,r); }
		
		// collision distance squared	
		var distanceSq = this.playerRadius*this.playerRadius + r*r;
	
		// check player arg
		//var headOffset1 = player.anims[player.anim].frameHeight/4; // distance from center to head
		this.reusableVector.x = player.x - x;
		this.reusableVector.y = player.y - y;
		var headToPoint1 = this.reusableVector; //new Vector2D (player.x-x,player.y-y);
		if (headToPoint1.magSqr() < distanceSq) {
			return true;
		}
		// no collision
		return false;
	}
	
	var start = function() {
		// indicate
		this.started = true;
	
		// phase switch points
		// phase 1: start button pressed
		// phase 2: second stage reached
		// phase 3: final stage
		
		// time 
		prevTime = Date.now();
		this.gameTime = 0;
		
		// set up the game (play intro)
		this.introStart();
		
		// update
		this.gameLoop();
	}
	
	var resetAll = function() {
		this.clearOldObstacles();
		this.clearAllClotheslines();
		this.phase = 0.01;
		this.lives = 10;
		this.invincibleTime = 3000;
		this.score = 0;
		this.multiplier = 1;
		this.gameTime = 0;
		app.keys.leftPressed = false;
		app.keys.rightPressed = false;
		app.keys.upPressed = false;
		app.keys.downPressed = false;
		app.keys.aPressed = false;
		app.keys.dPressed = false;
		app.keys.wPressed = false;
		app.keys.sPressed = false;
		prevTime = Date.now();
		deltaTime = 27;
		
		// music
		this.backgroundMusic1.paused = true;
		this.backgroundMusic2.paused = true;
		this.backgroundMusic1.position = 0;
		this.backgroundMusic2.position = 0;
		this.backgroundMusic = this.backgroundMusic1;
		
		// reset players
		this.player1.x = app.graphics.canvasWidth/2;
		this.player1.y = app.graphics.canvasHeight/2;
		this.player2.x = app.graphics.canvasWidth/2;
		this.player2.y = app.graphics.canvasHeight/2;
		this.player1.vx = 0;
		this.player1.vy = 0;
		this.player2.vx = 0;
		this.player2.vy = 0;
		this.player1.flashingTime = 0;
		this.player2.flashingTime = 0;
		
		// hide game objects
		for (var i=0; i<this.numberOfEnemies; i++) {
			var obstacle = this.obstacles[i];
			//obstacle.y = (1000/this.numberOfEnemies)*i;
			if (obstacle) obstacle.x = -10000;
		}
		for (var i=0; i<this.numberOfPickups; i++) {
			var sweet = this.cats[i];
			//sweet.y = (1000/this.numberOfPickups)*i;
			if (sweet) sweet.x = -10000;
		}
		this.paused = false;
		
		// start from the beginning
		this.introStart();
	}

	// put all public methods and properties the "main" module here
	return {
		init: init,
		gameLoop: gameLoop,
		checkCollisionWithPlayer: checkCollisionWithPlayer,
		update: update,
		handleKeypresses: handleKeypresses,
		updateGameObjects: updateGameObjects,
		updatePlayers: updatePlayers,
		updateClothes: updateClothes,
		updateCats: updateCats,
		updateClotheslines: updateClotheslines,
		cooldownClotheslines: cooldownClotheslines,
		updateBirds: updateBirds,
		updateClouds: updateClouds,
		updateStars: updateStars,
		updateSatellites: updateSatellites,
		start: start,
		resetAll: resetAll,
		introStart: introStart,
		phase1Start: phase1Start,
		phase1Cooldown: phase1Cooldown,
		phase2Start: phase2Start,
		phase3Start: phase3Start,
		phase3Cooldown: phase3Cooldown,
		finalPhaseStart: finalPhaseStart,
		clearAllClotheslines: clearAllClotheslines,
		clearOldObstacles: clearOldObstacles,
		clearOldPickups: clearOldPickups,
		playersExitStageTop: playersExitStageTop,
		pause: pause,
		unpause: unpause,
		
		/************************** VARIABLES ******************************/
		// game variables
		started: false,
		phase: 0,
		finalPhase: 5,
		lives: 3,
		invincibleTime: 3000,
		score: 0,
		multiplier: 1,
		paused: false,
		playerRadius: 50,
		catChance: 0.5,
		clothesWidth: 120,
		particleEmitter: undefined,
		Emitter: undefined,
		startingFrameWidth: 350,
		endingFrameWidth: 1000,
		// the time elapsed in the game
		gameTime: 0,
		// endgame: min  sec  millisec			
		maxGameTime: 5 * 60 * 1000,
		// saves space on the heap
		reusableVector: undefined,
		// the animation frame id
		animationFrameID: undefined,

		// all things in game
		gameObjects: [],
		obstacles: [],
		cats: [],
		clotheslines: [],
		clouds: [],
		//satellites: [],
		stars: [],
		birdQueue: [],
		birdTimer: 0,
		
		// sound vars
		backgroundMusic1: undefined,
		backgroundMusic2: undefined,
		backgroundMusic: undefined,
		
		masterVolume: 1.0,

		// browser support
		isFirefox: typeof InstallTrigger !== 'undefined'
	};
}).bind(app.game)();