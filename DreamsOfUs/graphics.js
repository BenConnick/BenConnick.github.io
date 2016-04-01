// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

// add graphics module
app.graphics = (function() {

	console.log("app.graphics loaded");

	var init = function() {
		// get canvas context
		this.canvasElem = document.getElementById("bigCanvas")
		this.ctx = this.canvasElem.getContext("2d");
		
		// set widths
		this.canvasWidth = this.canvasElem.width;
		this.canvasHeight = this.canvasElem.height;
		
		//spritesheets and sprites
		this.emptyImage = document.createElement("img");
		
		this.backgroundImg = document.createElement("img");
		this.backgroundImg.src = "images/citywide.png";
		
		this.heartImg = document.createElement("img");
		this.heartImg.src = "images/heart.png";
		
		this.idleImg = document.createElement("img");
		this.idleImg.src = "images/idle.png";
		
		this.boyImg = document.createElement("img");
		this.boyImg.src = "images/boy.png";
		
		this.boyShadowImg = document.createElement("img");
		this.boyShadowImg.src = "images/boy_shadow.png";
		
		this.boySleepyImg = document.createElement("img");
		this.boySleepyImg.src = "images/boy_sleepy_face.png";
		
		this.boySquintImg = document.createElement("img");
		this.boySquintImg.src = "images/boy_squint_face.png";
		
		this.girlImg = document.createElement("img");
		this.girlImg.src = "images/girl.png";
		
		this.girlShadowImg = document.createElement("img");
		this.girlShadowImg.src = "images/girl_shadow.png";
		
		this.girlSleepyImg = document.createElement("img");
		this.girlSleepyImg.src = "images/girl_sleepy_face.png";
		
		this.girlSquintImg = document.createElement("img");
		this.girlSquintImg.src = "images/girl_squint_face.png";
		
		this.catFaceImg = document.createElement("img");
		this.catFaceImg.src = "images/cats/catface.png";
		
		// clothes
		for (var i=0; i<7; i++) {
			this.clothesImgs[i] = document.createElement("img");
			this.clothesImgs[i].src = "images/clothes/"+(i+1)+".png"
		}
		// cats
		for (var i=0; i<2; i++) {
			this.catImgs[i] = document.createElement("img");
			this.catImgs[i].src = "images/cats/"+(i+1)+".png"
		}
		
		/*this.nightmareImg = document.createElement("img");
		this.nightmareImg.src = "images/m.jpg";
		
		this.sweetImg = document.createElement("img");
		this.sweetImg.src = "images/s.jpg";*/
	}

	 // called by gameObjects
	 var updateAnimation = function(object) {
		 // increase frame number if ready 
		 if (object.percentToNextFrame >= 1) {
			 object.animFrame+=1;
			 object.percentToNextFrame-=1;
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
			// use deltatime and xvelocity to make sure that the legs move with the ground
			object.percentToNextFrame += Math.abs(object.xvelocity)*app.game.deltaTime/300; // 300 is arbitrary constant
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
		for (var i=0; i<app.game.gameObjects.length; i++) {
			app.game.gameObjects[i].draw();
		}
		this.drawUI();
	}
 
	var drawEnvironment = function() {
		 // reset all transforms
		 clear();
	
		// ****** draw the background ******
	
		// background imgage
		//ctx.drawImage(backgroundImg,0,0); not anymore
	
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
 
	 var drawUI = function() {
	 	
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
	 	this.ctx.fillStyle = "rgba(200,200,255,0.2)";
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
	 	this.ctx.fillStyle = "rgba(255,200,200,0.2)";
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
		this.ctx.font = "30px Arial";
		this.ctx.fillStyle = "#ffff66";
		this.ctx.textAlign = "right";
		this.ctx.fillText(Math.floor(app.game.score),this.canvasWidth/2,80);
		this.ctx.drawImage(this.catFaceImg,this.canvasWidth/2 - 100,50);
		
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
		clothesImgs: [],
		catImgs: [],
		birdImgs: [],
		planeImg: undefined,
		satelliteImg: undefined,
		starImg: undefined,
		circles: [],
		
		// wall color mainly for visual debugging
		wallColor: "#eee"
	}
})();