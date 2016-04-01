// if app exists get a reference, otherwise create app
var app = (app || {});
// create game module
app.game = (function() {
	
	console.log("app.game loaded");
	
	// set up the game, runs once at start
	var init = function() {
	
		// game values
		this.endingFrameWidth = app.graphics.canvasWidth;
	
		// this.players
		// p1
		this.player1 = new GameObject();
		this.player1.name = "boy";
		this.player1.x = app.graphics.canvasWidth/2;
		this.player1.y = app.graphics.canvasHeight/2;
		this.player1.anims["idle"] = new Animation("idle", 106, 155, 1, app.graphics.boyImg);
		//player1.anims["hurt"] = new Animation("hurt", 106, 155, 1, boySquintImg);
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
		//this.player1.child = this.p1face;
		// p2
		this.player2 = new GameObject();
		this.player2.name = "girl";
		this.player2.x = app.graphics.canvasWidth/2;
		this.player2.y = app.graphics.canvasHeight/2;
		this.player2.anims["idle"] = new Animation("idle", 113, 150, 1, app.graphics.girlImg);
		//player2.anims["hurt"] = new Animation("hurt", 113, 150, 1, girlSquintImg);
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
		//this.player2.child = this.p2face;

		// obstacles
		this.numberOfObstacles = 30;
		for (var i=0; i<this.numberOfObstacles; i++) {
			var obstacle = new GameObject();
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

		// pickups
		this.numberOfPickups = 9;
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
		}
		
		// clotheslines
		var numclotheslines = 3
		for(var i=0; i<numclotheslines; i++) {
			this.clotheslines[i] = {};
			this.clotheslines[i].x=0;
			this.clotheslines[i].y=i*app.graphics.canvasHeight/(numclotheslines-1);
			this.clotheslines[i].numSlots = Math.floor((app.graphics.canvasWidth)/this.clothesWidth);
		}
		
		// screens
		this.mainMenuScreen = q("#mainMenu");
		this.gameOverScreen = q("#gameOver");
		q("#start").onclick = function() { app.game.start(); hideElement(q('#mainMenu')); }
		q("#retryBtn").onclick = function() { app.game.resetAll(); hideElement(q('#gameOver'));}
		q("#menuBtn").onclick = function() { displayBlock(q('#mainMenu')); hideElement(q('#gameOver'));}
		
		window.onblur = function() { console.log("paused"); app.game.paused = true; backgroundMusic.paused = true; }
		window.onfocus = function() { app.game.paused = false; backgroundMusic.play(); backgroundMusic.paused = false;}
	}

	// the loop that runs every time the browser updates
	var gameLoop = function() {
		//console.log(this);
		
		window.requestAnimationFrame(app.game.gameLoop); // call gameLoop every frame
		app.game.update();
		app.graphics.draw();
	}

	// global update  
	var update = function() {
		// update refresh latency
		deltaTime = Date.now() - prevTime;
		prevTime = Date.now();
		this.gameTime += deltaTime;
	
		if (!this.paused) {
			// check gameover
			if (this.lives > 0) {
				// update score
				//this.score += deltaTime*this.multiplier/1000;
				if (this.score > 1000000000) {
					this.score = 0;
				}

				// handle keyboard input and apply acceleration
				this.handleKeypresses();
	
				// handle this.player behavior
				this.updatePlayers();
	
				// handle enemy behavior
				this.updateObstacles();
	
				// move the pickups
				this.updatePickups();
				
				// move the clotheslines
				this.updateClotheslines();
			}
			else {
				displayBlock(this.gameOverScreen);
				//hideElement(graphics.canvasElem);
				this.paused = true;
			}
		}
	
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
	 }
 
	var updatePlayers = function() {
		
		// (invincible timer moved to gameobject draw)
	
		// changes the sprite's animation for all GameObjects
		for (var i=0; i<this.gameObjects.length; i++) {
			this.gameObjects[i].update();
		}
		
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
					createjs.Sound.play("clothes_hit");
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
					createjs.Sound.play("clothes_hit");
				}
			}
			
			if (x_debug_x) { 
				app.graphics.drawDebugCircle(this.player1.x,this.player1.y,this.playerRadius); 
				app.graphics.drawDebugCircle(this.player2.x,this.player2.y,this.playerRadius); 
			}
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
							console.log("cat");
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

	var updateObstacles = function() {
		for (var i=0; i<this.obstacles.length; i++) {
			// when the baddie goes off screen, recycle
			if (this.obstacles[i].y > app.graphics.canvasHeight*(this.clotheslines.length+1)/this.clotheslines.length) {
				this.obstacles[i].enabled = false;
			}
		}
	}

	

	var updatePickups = function() {
		for (var i=0; i<this.cats.length; i++) {
			//console.log(Math.sin(deltaTime));
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
					createjs.Sound.play("meow");
					//this.cats[i].y = this.canvasHeight + 100;
					this.cats[i].enabled = false;
				}
			}
		}
	}

	// checks to see if the point hits a player, x and y are the point and r is the radius
	var checkCollisionWithPlayer = function(player,x,y,r) {
		
		// draw hitcircles
		if(x_debug_x) { app.graphics.drawDebugCircle(x,y,r); }
		
		// collision distance squared	
		var distanceSq = this.playerRadius*this.playerRadius + r*r;
	
		// check player arg
		//var headOffset1 = player.anims[player.anim].frameHeight/4; // distance from center to head
		var headToPoint1 = new Vector2D (player.x-x,player.y-y);
		if (headToPoint1.magSqr() < distanceSq) {
			return true;
		}
		// no collision
		return false;
	}
	
	var start = function() {
		// loop music
		backgroundMusic = createjs.Sound.play("In_Your_Arms");
		backgroundMusic.loop = -1;
		prevTime = Date.now();
		this.gameLoop();
	}
	
	var resetAll = function() {
		this.lives = 5;
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
		this.player1.x = app.graphics.canvasWidth/2;
		this.player1.y = app.graphics.canvasHeight/2;
		this.player2.x = app.graphics.canvasWidth/2;
		this.player2.y = app.graphics.canvasHeight/2;
		this.player1.vx = 0;
		this.player1.vy = 0;
		this.player2.vx = 0;
		this.player2.vy = 0;
		for (var i=0; i<this.numberOfEnemies; i++) {
			var obstacle = this.obstacles[i];
			obstacle.y = (1000/this.numberOfEnemies)*i;
			obstacle.x = -10000;
		}
		for (var i=0; i<this.numberOfPickups; i++) {
			var sweet = this.cats[i];
			sweet.y = (1000/this.numberOfPickups)*i;
			sweet.x = -10000;
		}
		this.paused = false;
	}

	// put all public methods and properties the "main" module here
	return {
		init: init,
		gameLoop: gameLoop,
		checkCollisionWithPlayer: checkCollisionWithPlayer,
		update: update,
		handleKeypresses: handleKeypresses,
		updatePlayers: updatePlayers,
		updateObstacles: updateObstacles,
		updatePickups: updatePickups,
		updateClotheslines: updateClotheslines,
		start: start,
		resetAll: resetAll,
		
		/************************** VARIABLES ******************************/
		// game variables
		lives: 5,
		invincibleTime: 3000,
		score: 0,
		multiplier: 1,
		paused: false,
		playerRadius: 50,
		catChance: 0.5,
		clothesWidth: 120,
		startingFrameWidth: 350,
		endingFrameWidth: 1000,
		// the time elapsed in the game
		gameTime: 0,
		// endgame: min  sec  millisec			
		maxGameTime: 5 * 60 * 1000,

		// all things in game
		gameObjects: [],
		obstacles: [],
		cats: [],
		clotheslines: [],
		
		// sound vars
		backgroundMusic: undefined,

		// browser support
		isFirefox: typeof InstallTrigger !== 'undefined'
	};
}).bind(app.game)();