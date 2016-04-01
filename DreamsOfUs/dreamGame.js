/* 
 * Ben Connick 2015
 */

// main js file for the interactive canvas ( "game" )

/**************************** CLASSES *********************************/
 
 // 2D vector constructor
 function Vector2D(x_,y_) {
     this.x = x_;
     this.y = y_;
     this.magSqr = function() {
         return this.x*this.x + this.y*this.y;
     };
     this.magnitude = function() {
         return Math.sqrt(this.magSqr());
     };
     this.add = function(vec2d) {
         return new Vector2D(this.x + vec2d.x,this.y + vec2d.y);
     };
     this.subtract = function(vec2d) {
         return new Vector2D(this.x - vec2d.x, this.y - vec2d.y);
     };
     this.dot = function(vec2d) {
         return this.x*vec2d.x + this.y*vec2d.y;
     };
     this.normalized = function() {
         var mag = this.magnitude();
         var vec = new Vector2D(this.x/mag,this.y/mag);
         return new Vector2D(this.x/mag,this.y/mag);
     };
 }
 
 // animation constructor
 function Animation(name_, fw_, fh_, numFrames_, spriteSheet_) {
     this.name = name_;
     this.frameWidth = fw_;
     this.frameHeight = fh_;
     this.numFrames = numFrames_;
     this.spriteSheet = spriteSheet_;
     this.onComplete = "loop";
 }
 
 // base gameobject constructor
 function GameObject() {
     this.x = 0;
     this.y = 0;
     this.xanchor = 0;
     this.yanchor = 0;
     this.scale = 1;
     this.angle = 0;
     this.xvelocity = 0;
     this.rotateWithXVel = true;
     this.bounded = false;
     this.yvelocity = 0;
     this.maxVelocity = 5;
     this.child = null;
     this.percentToNextFrame = 0;
     this.animFrame = 0;
     this.anim = "idle";
     this.anims = {};
     this.updatePosition = function () {
         // update position
        if (Math.abs(this.xvelocity) > 0.01) {
           this.x += this.xvelocity*deltaTime/20;
        }
        if (Math.abs(this.yvelocity) > 0.01) {
           this.y += this.yvelocity*deltaTime/20;
        }
        if (this.bounded) {
			var marginLeft = 40;
			var marginRight = 40;
			var marginTop = 80;
			var marginBottom = 80;
			if (this.x > canvasWidth-marginRight) {
				this.x = canvasWidth-marginRight;
			}
			if (this.x < 0+marginLeft) {
				this.x = 0+marginLeft;
			}
			if (this.y > canvasHeight-marginBottom) {
				this.y = canvasHeight-marginBottom;
			}
			if (this.y < 0+marginTop) {
				this.y = 0+marginTop;
			}
	   }
     };
     this.updateAnim = function() { updateAnimation(this); };
     this.update = function() {
         this.updatePosition();
         this.updateAnim();
     };
     this.draw = function() {
        clear();
        // current animation
        var anim = this.anims[this.anim];
        // translate to appropriate position
        ctx.translate(this.x,this.y);
        angle = 0;
        // change angle according with velocity
        if (this.rotateWithXVel) {
        	this.angle=Math.max(Math.min(this.xvelocity/30,0.2),-1);
        }
        // rotate to angle
        ctx.rotate( this.angle );
        // offset
        ctx.translate(this.xanchor,this.yanchor);
        // flip for opposite direction
        if (this.left) { ctx.scale(-1,1); }
        // the -frameWidth/2 makes it so that the avatar is drawn from its center
        ctx.drawImage(anim.spriteSheet, 
            anim.frameWidth*this.animFrame,
            0,
            anim.frameWidth,
            anim.frameHeight,
            -anim.frameWidth/2,
            -anim.frameHeight/2,
            anim.frameWidth,
            anim.frameHeight);
        if (this.child != null) {
        	// offset
        	ctx.translate(this.child.xanchor,this.child.yanchor);
        
        	// current animation
        	var childAnim = this.child.anims[this.child.anim];
        	ctx.drawImage(childAnim.spriteSheet, 
            childAnim.frameWidth*this.child.animFrame,
            0,
            childAnim.frameWidth,
            childAnim.frameHeight,
            -childAnim.frameWidth/2,
            -childAnim.frameHeight/2,
            childAnim.frameWidth,
            childAnim.frameHeight);
        }
        clear();
     };
 }

/************************** GLOBAL VARIABLES ******************************/
// menu variables
var localBtn = document.getElementById("localPlay");	
var onlineBtn = document.getElementById("online");
var mainMenu = document.getElementById("mainMenu");
var gameOverScreen = document.getElementById("gameOver");
var resetBtn = document.getElementById("retryBtn");

// game variables
var lives = 5;
var invincibleTime = 3000;
var score = 0;
var multiplier = 1;
var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;
var aPressed = false;
var dPressed = false;
var wPressed = false;
var sPressed = false;
var prevTime = 0;
var deltaTime = 0;
var paused = false;

// all things in game
var gameObjects = [];
var nightmares = [];
var sweets = [];

// browser support
var isFirefox = typeof InstallTrigger !== 'undefined';

// platform information
var platformScale = 800; // width 800px

//spritesheets and sprites
var emptyImage = document.createElement("img");
var backgroundImg = document.createElement("img");
backgroundImg.src = "images/citywide.png";
var heartImg = document.createElement("img");
heartImg.src = "images/heart.png";
var idleImg = document.createElement("img");
idleImg.src = "images/idle.png";
var boyImg = document.createElement("img");
boyImg.src = "images/boy.png";
var boySleepyImg = document.createElement("img");
boySleepyImg.src = "images/boy_sleepy_face.png";
var boySquintImg = document.createElement("img");
boySquintImg.src = "images/boy_squint_face.png";
var girlImg = document.createElement("img");
girlImg.src = "images/girl.png";
var girlSleepyImg = document.createElement("img");
girlSleepyImg.src = "images/girl_sleepy_face.png";
var girlSquintImg = document.createElement("img");
girlSquintImg.src = "images/girl_squint_face.png";
var nightmareImg = document.createElement("img");
nightmareImg.src = "images/m.jpg";
var sweetImg = document.createElement("img");
sweetImg.src = "images/s.jpg";

// canvas 2d context
var canvasElem = document.getElementById("bigCanvas")
var ctx  = canvasElem.getContext("2d");

// wall color mainly for visual debugging
var wallColor = "#AACCFF";
var filterColor = "rgba(0,0,0,0.6)";
 
/*var cnvs = document.createElement("canvas");
console.log(window.innerWidth);
cnvs.width = window.innerHeight/1.8;
cnvs.height = window.innerHeight-5;
cnvs.style = "margin: 0px; padding: 0px; display: inline;";
console.log(cnvs.canvasWidth);  
cnvs.id = "bigCanvas";
var ctx = cnvs.getContext("2d");
document.body.appendChild(cnvs);*/


// canvas dimensions
canvasWidth = document.getElementById("bigCanvas").width;
canvasHeight = document.getElementById("bigCanvas").height;

// players
// p1
var player1 = new GameObject();
player1.x = canvasWidth/2;
player1.y = canvasHeight/2;
player1.anims["idle"] = new Animation("idle", 106, 155, 1, boyImg);
//player1.anims["hurt"] = new Animation("hurt", 106, 155, 1, boySquintImg);
player1.anim = "idle";
player1.rotateWithXVel = true;
player1.bounded = true;
gameObjects.push(player1);
// face
var p1face = new GameObject();
p1face.anims["idle"] = new Animation("idle",77,34,1,boySleepyImg);
p1face.anims["hurt"] = new Animation("hurt",77,34,1,boySquintImg);
p1face.yanchor=9.5;
p1face.xanchor=4;
player1.child = p1face;
// p2
var player2 = new GameObject();
player2.x = canvasWidth/2;
player2.y = canvasHeight/2;
player2.anims["idle"] = new Animation("idle", 113, 150, 1, girlImg);
//player2.anims["hurt"] = new Animation("hurt", 113, 150, 1, girlSquintImg);
player2.anim = "idle";
player2.rotateWithXVel = true;
player2.bounded = true;
gameObjects.push(player2);
// face
var p2face = new GameObject();
p2face.anims["idle"] = new Animation("idle",77,34,1,girlSleepyImg);
p2face.anims["hurt"] = new Animation("hurt",77,34,1,girlSquintImg);
p2face.yanchor=-8;
p2face.xanchor=2;
player2.child = p2face;

// enemies
var numberOfEnemies = 7;
for (var i=0; i<numberOfEnemies; i++) {
    var nightmare = new GameObject();
    nightmare.anims["idle"] = new Animation("idle", 35, 35, 1,nightmareImg);
    nightmare.anim = "idle";
    nightmare.x = -100; // offscreen
    nightmare.y = (1000/numberOfEnemies)*i;
    nightmare.startTime=0;
    gameObjects.push(nightmare);
    nightmares.push(nightmare);
}

// pickups
var numberOfPickups = 9;
for (var i=0; i<numberOfPickups; i++) {
	var sweet = new GameObject();
	sweet.anims["idle"] = new Animation("idle", 35, 35, 1,sweetImg);
    sweet.anim = "idle";
    sweet.x = -100; // offscreen
    sweet.y = (1000/numberOfEnemies)*i;
    gameObjects.push(sweet);
    sweets.push(sweet);
}

/******************************* GAME LOOP ************************************/
// the loop that runs every time the browser updates
function gameLoop() {
    window.requestAnimationFrame(gameLoop); // call gameLoop every frame
    update();
    draw();
}

// global update  
function update() {
    // update refresh latency
    deltaTime = Date.now() - prevTime;
    prevTime = Date.now();
    
    // check gameover
    if (lives > 0) {
		// update score
		score += deltaTime*multiplier/1000;
	
		// handle keyboard input and apply acceleration
		handleKeypresses();
	
		// handle player behavior
		updatePlayers();
	
		// handle enemy behavior
		updateBaddies();
	
		// move the pickups
		updatePickups();
    }
    else {
    	if (!paused) {
			displayBlock(gameOverScreen);
			hideElement(canvasElem);
			paused = true;
    	}
    }
    
}

// player input
function handleKeypresses() {
    var accel = 20;
    
    // player 1
    if (rightPressed) {
        //console.log(player2.x);
       player1.xvelocity+=accel*(deltaTime/1000);
       if (player1.xvelocity > player1.maxVelocity) { player1.xvelocity = player1.maxVelocity; }
    }
    if (leftPressed) {
        player1.xvelocity-=accel*(deltaTime/1000);
        if (player1.xvelocity < -player1.maxVelocity) { player1.xvelocity = -player1.maxVelocity; }
    }
    if (!rightPressed && !leftPressed || rightPressed && leftPressed) {
        if (player1.xvelocity < 0) {
            player1.xvelocity+=accel*(deltaTime/1000);
        }
        if (player1.xvelocity > 0) {
            player1.xvelocity-=accel*(deltaTime/1000);
        }
        if (Math.abs(player1.xvelocity) < 1 ) {
            player1.xvelocity = 0;
        }
    }
    if (downPressed) {
        //console.log(player2.x);
       player1.yvelocity+=accel*(deltaTime/1000);
       if (player1.yvelocity > player1.maxVelocity) { player1.yvelocity = player1.maxVelocity; }
    }
    if (upPressed) {
        player1.yvelocity-=accel*(deltaTime/1000);
        if (player1.yvelocity < -player1.maxVelocity) { player1.yvelocity = -player1.maxVelocity; }
    }
    if (!upPressed && !downPressed || upPressed && downPressed) {
        if (player1.yvelocity < 0) {
            player1.yvelocity+=accel*(deltaTime/1000);
        }
        if (player1.yvelocity > 0) {
            player1.yvelocity-=accel*(deltaTime/1000);
        }
        if (Math.abs(player1.yvelocity) < 1 ) {
            player1.yvelocity = 0;
        }
    }
    
    // player 2
    if (dPressed) {
       player2.xvelocity+=accel*(deltaTime/1000);
       if (player2.xvelocity > player2.maxVelocity) { player2.xvelocity = player2.maxVelocity; }
    }
    if (aPressed) {
        player2.xvelocity-=accel*(deltaTime/1000);
        if (player2.xvelocity < -player2.maxVelocity) { player2.xvelocity = -player2.maxVelocity; }
    }
    if (!dPressed && !aPressed) {
        if (player2.xvelocity < 0) {
            player2.xvelocity+=accel*(deltaTime/1000);
        }
        if (player2.xvelocity > 0) {
            player2.xvelocity-=accel*(deltaTime/1000);
        }
        if (Math.abs(player2.xvelocity) < 1 ) {
            player2.xvelocity = 0;
        }
    }
    if (sPressed) {
       player2.yvelocity+=accel*(deltaTime/1000);
       if (player2.yvelocity > player2.maxVelocity) { player2.yvelocity = player2.maxVelocity; }
    }
    if (wPressed) {
        player2.yvelocity-=accel*(deltaTime/1000);
        if (player2.yvelocity < -player2.maxVelocity) { player2.yvelocity = -player2.maxVelocity; }
    }
    if (!wPressed && !sPressed) {
        if (player2.yvelocity < 0) {
            player2.yvelocity+=accel*(deltaTime/1000);
        }
        if (player2.yvelocity > 0) {
            player2.yvelocity-=accel*(deltaTime/1000);
        }
        if (Math.abs(player2.yvelocity) < 1 ) {
            player2.yvelocity = 0;
        }
    }
 }
 
function updatePlayers() {
    // invincible timer 
    invincibleTime -= deltaTime;
    
    // changes the sprite's animation for all GameObjects
    for (var i=0; i<gameObjects.length; i++) {
        gameObjects[i].update();
    }
}

function updateBaddies() {
    for (var i=0; i<nightmares.length; i++) {
        // when the baddie goes off screen, reset
        if (nightmares[i].y > canvasHeight) {
            // put at the top
            nightmares[i].y = -nightmares[i].anims[nightmares[i].anim].frameHeight;
            // random x pos
            nightmares[i].x = Math.floor(Math.random()*canvasWidth);
            nightmares[i].xDrift=1.5*(Math.random()*2-1); // keep drifting to a random side
            //nightmares[i].xvelocity=Math.random()*2-1;
        }
        nightmares[i].xvelocity=nightmares[i].xDrift+
        	2*Math.sin(nightmares[i].xDrift*100+nightmares[i].y/50);
        nightmares[i].yvelocity=2.1
        
        // only check if the players are vulnerable
        if (invincibleTime < 0) {
            filterColor = "rgba(0,0,0,0.0)";
            if (p1face.anim == "hurt") {
            	p1face.anim = "idle";
            	p2face.anim = "idle";
            }
            if (checkCollisionWithLine(nightmares[i].x,nightmares[i].y) 
            || checkCollisionWithPlayers(nightmares[i].x,nightmares[i].y)) {
                invincibleTime = 3000;
                p1face.anim = "hurt";
                p2face.anim = "hurt";
                lives-=1;
                multiplier = 1;
            }
        }
        else {
        	// decrease filter opacity exponentially
        	var maxInvinc = 3000;
        	var invinc10 = xToPowerOfY(invincibleTime,10);
        	var maxInvinc10 = xToPowerOfY(maxInvinc,10);
        	filterColor = "rgba(255,0,0,"+ (invinc10/maxInvinc10) +")";
        }
    }
}

function xToPowerOfY(x,y) {
	var result = 1;
	for (var i=0; i<y; i++) {
		result*=x;
	}
	return result
}

function updatePickups() {
	for (var i=0; i<sweets.length; i++) {
        // when the pickup goes off screen, reset
        if (sweets[i].y > canvasHeight) {
            // put at the top
            sweets[i].y = -sweets[i].anims[sweets[i].anim].frameHeight;
            // random x pos
            sweets[i].x = Math.floor(Math.random()*canvasWidth);
            //sweets[i].xvelocity=Math.random()*2-1;
        }
        sweets[i].yvelocity=3;
        
        // always check
        if (true) {
            //filterColor = "rgba(0,0,0,0.6)";
            if (checkCollisionWithLine(sweets[i].x,sweets[i].y) || checkCollisionWithPlayers(sweets[i].x,sweets[i].y)) {
                //filterColor = "rgba(0,0,255,0.3)";
                multiplier += 0.1;
                multiplier = Math.floor(multiplier*10)/10; // handle rounding error
                sweets[i].y = canvasHeight + sweets[i].anims[sweets[i].anim].frameHeight;
            }
        }
    }
}


// checks whether the point is close to the line
function checkCollisionWithLine(x,y) {  
    //return false; // disable
    
    // the vector from player 1 to the point
    var colliderPos = new Vector2D(x-player1.x,y-player1.y);
    // the vector from player 1 to player 2
    var p2vec = new Vector2D(player2.x - player1.x,player2.y - player1.y);
    // the perpendicular vector to the vector above
    var vecPerp = new Vector2D(-p2vec.y,p2vec.x);
    
    /*//DEBUG
    clear();
    ctx.strokeStyle="#FFFF00";
    ctx.beginPath();
    // center of player 1
    ctx.moveTo(player1.x,player1.y);
    // center of player 2
    ctx.lineTo(player1.x + p2vec.x, player1.y + p2vec.y);
    ctx.stroke();
    ctx.closePath();
    
    ctx.strokeStyle="#0000FF";
    ctx.beginPath();
    // center of player 1
    ctx.moveTo(player1.x,player1.y);
    // center of player 2
    ctx.lineTo( player1.x + p2vec.normalized().x*colliderPos.dot(p2vec.normalized()), 
    player1.y + p2vec.normalized().y*colliderPos.dot(p2vec.normalized()));
    ctx.stroke();
    ctx.closePath(); 
    clear();*/

    // if vector is within 10 pixels of the infinite line from p1 to p2
    if (Math.abs(vecPerp.normalized().dot(colliderPos)) < 20) {
        // if the vector is between the two players
        if ( (-10 < colliderPos.dot(p2vec.normalized()) ) && ( colliderPos.dot(p2vec.normalized()) < p2vec.magnitude() + 10 ) ) {
            //console.log ("point "+x+","+y+" collision");
            return true;
        }
    }
    return false;
}

// checks to see if the point hits a player
function checkCollisionWithPlayers(x,y) {
    // head radius squared
    var headRadiusSq = 1600;
    
    // check player 1
    var headOffset1 = player1.anims[player1.anim].frameHeight/3; // distance from center to head
    var headToPoint1 = new Vector2D (player1.x-x,(player1.y-headOffset1)-y);
    if (headToPoint1.magSqr() < headRadiusSq) {
        return true;
    }
    
    // check player 2
    var headOffset2 = player1.anims[player1.anim].frameHeight/3; // distance from center to head
    var headToPoint2 = new Vector2D (player2.x-x,(player2.y-headOffset2)-y);
    if (headToPoint2.magSqr() < headRadiusSq) {
        return true;
    }
    
    // no collision
    return false;
}

// global draw
function draw() {
    drawEnvironment(); 
    for (var i=0; i<gameObjects.length; i++) {
        gameObjects[i].draw();
    }
    drawUI();
}
 
 function drawEnvironment() {
     // reset all transforms
     clear();
    
    // ****** draw the background ******
    
    // background imgage
    //ctx.drawImage(backgroundImg,0,0); not anymore
    
    // background color
    ctx.fillStyle=wallColor;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    // overlay color
    ctx.fillStyle=filterColor;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    
    // draw line between players
    clear();
    ctx.strokeStyle="#FF0000";
    ctx.beginPath();
    // center of player 1
    ctx.moveTo(player1.x,player1.y);
    // center of player 2
    ctx.lineTo(player2.x,player2.y);
    ctx.stroke();
    ctx.closePath(); 
    
    clear();
    
    
    
 }
 
 function drawUI() {
     // health indicator
    for (var i=0; i<lives; i++) {
        ctx.drawImage(heartImg,i*40,10);
    }
    
    // multiplier
    ctx.font = "30px Arial";
    ctx.fillStyle = "#0000ff";
    ctx.textAlign = "center";
    ctx.fillText("x"+multiplier,400,40);
    
    // score 
    ctx.font = "30px Arial";
    ctx.fillStyle = "#ffff66";
    ctx.textAlign = "right";
    ctx.fillText(Math.floor(score),780,40);
 }
/*************************** UTILITY FUNCTIONS *******************************/

// clear context transforms
function clear(context) {
    if (context) {
        context.setTransform(1,0,0,1,0,0);
    }
    else {
        ctx.setTransform(1,0,0,1,0,0);
    }
}

 // called by gameObjects
 function updateAnimation(object) {
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
        object.percentToNextFrame += Math.abs(object.xvelocity)*deltaTime/300; // 300 is arbitrary constant
 }
 
 /***********************************/
 
 
 /*************************** EVENT LISTENERS *******************************/
 
document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        leftPressed=true;
    }
    if(event.keyCode == 38) {
        upPressed=true;
    }
    if(event.keyCode == 39) {
        rightPressed=true;
    }
    if(event.keyCode == 40) {
        downPressed=true;
    }
    
    if(event.keyCode == 65) {
        aPressed=true;
    }
    if(event.keyCode == 87) {
        wPressed=true;
    }
    if(event.keyCode == 68) {
        dPressed=true;
    }
    if(event.keyCode == 83) {
        sPressed=true;
    }
    // key events are repeated because it means that if opposite keys are pressed, 
    // they cancel
    if(event.keyCode == 37) {
        rightPressed=false;
    }
    if(event.keyCode == 38) {
        downPressed=false;
    }
    if(event.keyCode == 39) {
        leftPressed=false;
    }
    if(event.keyCode == 40) {
        upPressed=false;
    }
    
    if(event.keyCode == 65) {
        dPressed=false;
    }
    if(event.keyCode == 87) {
        sPressed=false;
    }
    if(event.keyCode == 68) {
        aPressed=false;
    }
    if(event.keyCode == 83) {
        wPressed=false;
    }
});
document.addEventListener('keyup', function(event) {
    if(event.keyCode == 37) {
        leftPressed = false;
    }
    if(event.keyCode == 39) {
        rightPressed = false;
    }
    if(event.keyCode == 38) {
        upPressed = false;
    }
    if(event.keyCode == 40) {
        downPressed = false;
    }
    
    if(event.keyCode == 65) {
        aPressed=false;
    }
    if(event.keyCode == 87) {
        wPressed=false;
    }
    if(event.keyCode == 68) {
        dPressed=false;
    }
    if(event.keyCode == 83) {
        sPressed=false;
    }
});

document.addEventListener('blur', function() {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
    
    wPressed = false;
    sPressed = false;
    aPressed = false;
    Pressed = false;
});

function start() {
    prevTime = Date.now();
    gameLoop();
}

// loading
var imagesLoaded = 0;
var images = document.getElementsByTagName("img");
for (i=0; i<images.length; i++) {
    images.onload = function() { 
        imagesLoaded++;
    };
}
while (imagesLoaded < images.length) {
    ctx.fillText("Loading",320,240);
    // wait for all images to load
}

function hideElement(elem) {
	console.log(elem.id);
	elem.style.display = "none";
}

function displayBlock(elem) {
	elem.style.display = "block";
}

function resetAll() {
	lives = 5;
	invincibleTime = 3000;
	score = 0;
	multiplier = 1;
	leftPressed = false;
	rightPressed = false;
	upPressed = false;
	downPressed = false;
	aPressed = false;
	dPressed = false;
	wPressed = false;
	sPressed = false;
	prevTime = 0;
	deltaTime = 0;
	player1.x = canvasWidth/2;
	player1.y = canvasHeight/2;
	player2.x = canvasWidth/2;
	player2.y = canvasHeight/2;
	for (var i=0; i<numberOfEnemies; i++) {
		var nightmare = nightmares[i];
		nightmare.y = (1000/numberOfEnemies)*i;
		nightmare.x = -10000;
	}
	for (var i=0; i<numberOfPickups; i++) {
		var sweet = sweets[i];
		sweet.y = (1000/numberOfPickups)*i;
		sweet.x = -10000;
	}
}

//start();
localBtn.onclick = function() { 
	hideElement(mainMenu);
	start(); 
};

resetBtn.onclick = function() {
	hideElement(gameOverScreen);
	displayBlock(bigCanvas);
	paused = false;
	resetAll();
}