// main js file for the interactive canvas "game"

// global variables
var playMode = true;
var centeredInDoorway = false;
var insideDoor = false;
var door = -1;
var doors = [];
//var labels = [];
var leftPressed = false;
var rightPressed = false;
var prevTime = 0;
var deltaTime = 0;
var timeOut = 0;
var allVisited = false;
var isEdge;
var isIE;
var isFirefox = typeof InstallTrigger !== 'undefined';
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
var isWebkit = false;
if (isChrome) { isWebkit = true; }
if (isSafari) { isWebkit = true; }
var targetH = -1;
var contactInfoHeight = 0;

//spritesheets and sprites
var emptyImage = document.createElement("img");
var controlsImg = document.createElement("img");
var tileImg = document.createElement("img");
var walkImg = document.createElement("img");
var turnImg = document.createElement("img");
var walkinImg = document.createElement("img");
var dissapearImg = document.createElement("img");
var idleImg = document.createElement("img");
var yingemImg = document.createElement("img");
var yanggemImg = document.createElement("img");
var squaregemImg = document.createElement("img");
var diamondgemImg = document.createElement("img");
var hexgemImg = document.createElement("img");
var particleImg = document.createElement("img");
//var digitsImg = document.createElement("img");

walkImg.src = "images/walk.png";
turnImg.src = "images/turn.png";
walkinImg.src="images/walkin.png";
dissapearImg.src="images/dissapear.png";
idleImg.src = "images/idle.png";
controlsImg.src = "images/controlsw.png";
yingemImg.src="images/yingem.png";
yanggemImg.src="images/yanggem.png";
squaregemImg.src="images/squaregem.png";
diamondgemImg.src="images/diamondgem.png";
particleImg.src="images/particle.png";
hexgemImg.src="images/hexgem.png";
doors[0] = new Door("h12");
doors[1] = new Door("h13");
doors[2] = new Door("h14");
doors[3] = new Door("h15");
doors[4] = new Door("h16");
doors[0].x = 000;
doors[1].x = 200;
doors[2].x = 400;
doors[3].x = 600;   
doors[4].x = 800;
for (var i=0; i<doors.length; i++) {
    doors[i].img = document.createElement("img");
    doors[i].img.src = "images/transpdoor.png";
    doors[i].dateImg = document.createElement("img");
    doors[i].dateImg.src = "images/dates/"+(i+2012)+".png";
    doors[i].openImg = document.createElement("img");
    doors[i].openImg.src = "images/metaldoor_open.png";
}
/*doors[0].img.src = "images/metaldoor.png";
doors[1].img.src = "images/metaldoor.png";
doors[2].img.src = "images/metaldoor.png";
doors[3].img.src = "images/vaultdoor.png";
doors[4].img.src = "images/mysterydoor.png";
doors[5].img.src = "images/metaldoor.png";
doors[0].openImg.src = "images/metaldoor_open.png";
doors[1].openImg.src = "images/metaldoor_open.png";
doors[2].openImg.src = "images/metaldoor_open.png";
doors[3].openImg.src = "images/vaultdooropen.png";
doors[4].openImg.src = "images/mysterydooropen.png";
doors[5].openImg.src = "images/metaldoor_open.png";*/
/*for (var i=0; i<doors.length; i++) {
    labels[i] = document.createElement("img");
}
labels[0].src="images/procLabel.png";
labels[1].src="images/finaLabel.png";
labels[2].src="images/catsLabel.png";
labels[3].src="images/museLabel.png";
labels[4].src="images/ques.png";
labels[5].src="images/googLabel.png";*/
// start game button
var startButtonElem = document.querySelector(".clickToPlayBanner");
// canvas 2d context
var ctx  = document.getElementById("bigCanvas").getContext("2d");
var miniElem = document.getElementById("miniCanvas");
var mini = miniElem.getContext("2d");
//var mus  = document.getElementById("MusCanvas").getContext("2d");
//var fin  = document.getElementById("FinCanvas").getContext("2d");
//var cat  = document.getElementById("CatCanvas").getContext("2d");
//var pro  = document.getElementById("ProCanvas").getContext("2d");
//var goo = document.getElementById("GooCanvas").getContext("2d");
//gems
var gemsArray = [hexgemImg, squaregemImg, diamondgemImg, yingemImg, yanggemImg, yanggemImg];
var gemsX = [18,19,21,18,18,18];
var gemsY = [97,39,70,11,11,11];
// room width determined by the number of doors times door separations distance (200)
var roomWidth = doors.length*200;
// canvas dimensions
bigWidth = document.getElementById("bigCanvas").width;
bigHeight = document.getElementById("bigCanvas").height;
// particle effect
var particleFX = {
    image: particleImg,
    progress: 1.0,
    restart: function() {
        this.progress = 0.0;
    },
    updateProgress: function() {
        this.progress+=deltaTime/1000;
    },
    draw: function(context) {
        var scaleCoeff = 5;
        context.scale(this.progress*scaleCoeff,this.progress*scaleCoeff);
        context.globalAlpha = 1-Math.min(1,this.progress*2);
        context.drawImage(this.image,0,0);
        context.globalAlpha = 1;
    }
};

// clear context transforms
function clear(context) {
    if (context) {
        context.setTransform(1,0,0,1,0,0);
    }
    else {
        ctx.setTransform(1,0,0,1,0,0);
    }
}

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
    if (!insideDoor && timeOut < 0.5) {timeOut+=deltaTime/1000;}
    // scroll to appropriate part of the page
    if (targetH >= 0) {
        smoothScrollTo(targetH);
    }
    // handle keyboard input and apply acceleration
    if (playMode) {
        handleKeypresses();
        // changes the sprite's animation
        updateAnimation();
    } else {
        if (insideDoor) {
           walkOut();
           // special animation rules for the mini canvases
           updateMiniAnim();
           character.x2 += character.v2*deltaTime/20;
           // draw the sparkles
            /*if (particleFX.progress<1.1) {
                particleFX.updateProgress();
            }*/
            if (rightPressed) {
                //targetH = 420;
            }
        }
        // get to the door
        else {
            seekDoor();
            // changes the sprite's animation
            updateAnimation();
        }
    }
    // update position
     if (Math.abs(character.velocity) > 0.3) {
        character.x += character.velocity*deltaTime/20;
     }
     // wrap around if the character goes too far to the left
    if (character.x < doors.length*400) { 
        character.x = doors.length*400*3; 
    }
    /*if (!allVisited) {
        if (doors[0].visited && doors[1].visited && doors[2].visited && doors[3].visited && doors[4].visited) {
            allVisited = true;
        }
    }*/
}

// scroll towards a target: 1 call = 1 frame
function smoothScrollTo(target) {
	var prevTop; // used to check for stuck
    var tolerance = 6;
    var currentTop;
    if (!isWebkit && !isEdge) {
        currentTop = document.documentElement.scrollTop;
        prevTop = document.documentElement.scrollTop;
    }
    else {
        currentTop = document.body.scrollTop;
    }
    if (currentTop <= (target-tolerance)) {
        currentTop = currentTop + Math.max(tolerance,(deltaTime/200)*(target - currentTop));
    }
    if (currentTop >= (target+tolerance)) {
        currentTop = currentTop + Math.min(-1*tolerance,(deltaTime/200)*(target - currentTop));
    }
    if (!isWebkit  && !isEdge) {
        document.documentElement.scrollTop = currentTop;
    }
    else {
         document.body.scrollTop = currentTop;
    }
    if ((target-tolerance) < currentTop && currentTop < (target+tolerance)) {
        targetH = -1;
        return true;
    }
    // if stuck
    if (prevTop == document.documentElement.scrollTop) {
    	targetH = -1;
    	return true;
    }
    return false;
}

// walk towards the nearest door
function seekDoor() {
    var centerOfDoorOffset = 125;
    //var distToDoor = Math.abs(doors[door].x-(character.x+545))%1000 - centerOfDoorOffset;
    var distToDoor = (doors[door].x-(character.x%roomWidth));
    // door 0 is at position 0 and is subject to wrap-space problems
    if (door==0) {
        // checks to see if wrap space is affecting the distance calculation
        if (distToDoor < -200) { 
            distToDoor = roomWidth-(character.x%roomWidth); 
        }
    }
    if (distToDoor < 2 && distToDoor > -2) {
        character.velocity = 0;
        centeredInDoorway = true;
    } else {
        var desiredVelocity = Math.min(Math.abs(distToDoor)/12,5);
        if (distToDoor < 0) {
            character.velocity -= desiredVelocity*0.01*deltaTime; 
       }
        else {
            character.velocity += desiredVelocity*0.01*deltaTime;
        }
        if (character.velocity > character.maxVelocity) { character.velocity = character.maxVelocity; }
        if (character.velocity < -character.maxVelocity) {character.velocity = -character.maxVelocity; }
    }
}

// a "smooth acceleration" out of the door
function walkOut() {
    var end = 20;
    if ((character.x2-end) > 80) {
        character.v2 = (-1*(character.x2-end)/50+0.5);
    }
    else {
        character.v2=0;
        /*if (!doors[door].visited) {
            doors[door].visited = true;
            //particleFX.restart();
        }*/
    }
}

// global draw
function draw() {
    drawBig(); 
    if (insideDoor) {
        /*switch(door)  {
            case -1: break;
            case 0: drawPro(); break;
            case 1: drawFin(); break;
            case 2: drawCat(); break;
            case 3: drawMus(); break;
            case 5: drawGoo(); break;
        }*/
        drawMini(mini);
    }
 }

// draw on the main canvas
function drawBig() {

     // "camera" follows character
    var cameraPos = character.x-bigWidth/2;
    
    // ****** draw the background ******

    // floor color
    ctx.fillStyle="#ffffff";

    ctx.fillRect(0,418,700,500);
    
    // slats
    for (i=0; i<33; i++) {
        ctx.beginPath();
        ctx.moveTo(320, 0);
        //1.428
        ctx.lineTo(((50*i-cameraPos)%roomWidth)*1.428+850, 600);
        ctx.stroke();
    }
    
    // wall color   
    ctx.fillStyle="#19263a"/*"#42706c"*/;
    ctx.fillRect(0,0,700,418);
    
    
    // draw the instructions / controls
    ctx.drawImage(controlsImg,220,100);
    ctx.fillStyle="#000000";
    
    // ***** foreground *****
    
    
    // draw the doors at the appropriate positions
    for (var i=0; i<doors.length; i++) {
        clear();
        var arbitraryOffset = bigWidth/4; // makes the wrapping happen off-screen
        var doorWidth = 60; // 1/2 of the door width is the center of the door
        ctx.translate((doors[i].x-cameraPos+arbitraryOffset)%roomWidth+roomWidth-arbitraryOffset-doorWidth/2,290);

		// if open (there can only be one)
		if (i == door) {
			ctx.drawImage(doors[i].openImg,-62,0);
		} else {
			ctx.fillStyle = "rgb("+(190+15*i)+","+(190+15*i)+","+(190+15*i)+")";
			ctx.fillRect(2,0,58,128);
			ctx.drawImage(doors[i].img,0,0);
			//drawNumber(2012+i,(12+doors[i].x-cameraPos+arbitraryOffset)%roomWidth+roomWidth-arbitraryOffset-doorWidth/2,290+30);
			ctx.drawImage(doors[i].dateImg,13,35);
			ctx.translate((doors[i].x-cameraPos+arbitraryOffset)%roomWidth+roomWidth-arbitraryOffset-doorWidth/2,290);
		}

        clear();
    }
    clear();
    
    // draw the avatar in the center
    // current animation
    var anim = character.anims[character.anim];
    clear();
    ctx.translate(bigWidth/2,310+character.y);
    if (character.left) { ctx.scale(-1,1); }
    if (!insideDoor) {
    	if (character.anim != "none") {
        // the -35 makes it so that the avatar pivots about its center
        ctx.drawImage(anim.spriteSheet, anim.frameWidth*character.animFrame,0,anim.frameWidth,anim.frameHeight,-35,0,anim.frameWidth,anim.frameHeight);
    	}
    }
    clear();

 }
 
// draws a number of the "custom font" on the main canvas at a given position
function drawNumber(num, x, y) {
	if (isIE) return;
	var numString = "" + num;
	for (var i=0; i<numString.length; i++) {
		// clear previous transforms
		clear();
		// translate to the soon-to-be upper-left corner of the digit
    	ctx.translate(x + 8*i,y);
    	// draw the digit at position i of the number string, but place it to the right of the previous
    	// i*2 = padding of 2 px
    	//console.log(8*parseInt(numString[i]));
    	var startX = 8*parseInt(numString[i]);
    	if (!isIE) ctx.drawImage(digitsImg, startX, 0, 8, 16, i*2, 0, 8, 16);		
	}
	
}

function drawMini(context) {
	// shortcut var
    var anim = character.anims[character.anim];
    context.clearRect(0,0,500,500);
    // using the standard door for the open img
    context.translate(500,0);
    context.scale(-1,1);
    context.drawImage(doors[0].openImg,0,0);
	clear(context);
    context.translate(character.x2+40,5);
    if (character.anim != "none") {
    context.scale(-1,1);
    context.drawImage(anim.spriteSheet, anim.frameWidth*character.animFrame,0,anim.frameWidth,anim.frameHeight,-35,0,anim.frameWidth,anim.frameHeight);
    }
    // reset transforms
    clear(context);
    /*if (!doors[index].visited) {
        context.drawImage(gemsArray[index],135,50);
    }
    context.translate(135,50);
    particleFX.draw(context);
    clear(context);*/
}
/*  
function drawMus() {
    drawMini(mus, 3);
}
function drawFin() {
    drawMini(fin, 1);
}
function drawCat() {
    drawMini(cat, 2);
}
function drawPro() {
    drawMini(pro, 0);
}
function drawGoo() {
    drawMini(goo, 5);
}
 */
 function handleKeypresses() {
     var accel = 20;
     if (rightPressed && !leftPressed) {
        character.velocity+=accel*(deltaTime/1000);
        if (character.velocity > character.maxVelocity) { character.velocity = character.maxVelocity; }
    }
    if (!rightPressed && leftPressed) {
        character.velocity-=accel*(deltaTime/1000);
        if (character.velocity < -character.maxVelocity) { character.velocity = -character.maxVelocity; }
    }
    if (!rightPressed && !leftPressed || rightPressed && leftPressed) {
        if (character.velocity < 0) {
            character.velocity+=accel*(deltaTime/1000);
        }
        if (character.velocity > 0) {
            character.velocity-=accel*(deltaTime/1000);
        }
        if (Math.abs(character.velocity) < 0.2 ) {
            character.velocity = 0;
        }
    }
 }
 
 function updateAnimation() {
     // increase frame number if ready 
     if (character.percentToNextFrame >= 10) {
         character.percentToNextFrame = 10;
     }
     if (character.percentToNextFrame >= 1) {
         character.animFrame+=1;
         character.percentToNextFrame-=1;
     }
     // animation complete, what next?
     if(character.animFrame >= character.anims[character.anim].numFrames) {
          if (character.anims[character.anim].onComplete == "loop") {
            character.animFrame =  0;
          } else {
              character.anim = character.anims[character.anim].onComplete;
              character.animFrame =  0;
          }
     }
     if (centeredInDoorway) { 
         // if the character is not yet inside the door
         if (!insideDoor) {
            // start enter anims
            if (character.anim=="idle" || character.anim=="walking") {character.anim = "turn"; }
            // use deltatime to regulate frame rate per second // percent to next frame is based on 1, not 100
           character.percentToNextFrame += deltaTime/60; // 120 is an arbitrary constant
           character.y-=deltaTime/60;
           // if done
           if (character.anim=="none") { 
               targetH = -1;
               miniElem.style.top = doors[door].scrollToHeight+60+"px";
               hideBackgroundDoor();
               if (smoothScrollTo(doors[door].scrollToHeight)) {
                   insideDoor = true;
               }
               //document.body.scrollTop=doors[door].scrollToHeight; 
               
               //document.documentElement.scrollTop=doors[door].scrollToHeight;
               timeOut = 0;
               //insideDoor=true; 
               /*if (door==4) {
                    allVisited=false;
                    playMode=true;
                    door=-1;
                    for (i=0; i<doors.length; i++) {
                        doors[i].visited= false;
                    }
                }*/
           }
         }
     }
     else {
        if (character.velocity > 0) {
            character.anim = "walking";
            character.left = false;
        }
        if (character.velocity < 0) {
            character.anim = "walking";
            character.left  = true;
        }
        if (character.velocity == 0) {
            character.animFrame =  0;
            character.anim = "idle";
        }
        // use deltatime and velocity to make sure that the legs move with the ground
        character.percentToNextFrame += Math.abs(character.velocity)*deltaTime/300; // 300 is arbitrary constant
    }
 }
 
 function updateMiniAnim() {
     // increase frame number if ready 
     if (character.percentToNextFrame >= 1) {
         character.animFrame+=1;
         character.percentToNextFrame-=1;
     }
     // animation complete, what next?
     if(character.animFrame >= character.anims[character.anim].numFrames) {
          if (character.anims[character.anim].onComplete == "loop") {
            character.animFrame =  0;
          } else {
              character.anim = character.anims[character.anim].onComplete;
              character.animFrame =  0;
          }
     }
     else {
        if (character.v2 < 0) {
            character.anim = "walking";
        }
        if (character.v2 == 0) {
            character.animFrame =  0;
            character.anim = "idle";
        }
        // use deltatime and velocity to make sure that the legs move with the ground
        character.percentToNextFrame += Math.abs(character.v2)*deltaTime/300; // 300 is arbitrary constant
    }
 }
 
 // checks to see if the background-image is already hidden before doing getElemById
 var bdHidden = false;
 function hideBackgroundDoor() {
 	if (!bdHidden) {
 		//document.getElementById(doors[door].name).style.backgroundImage = "none";
 		bdHidden = true;
 	}
 }
 
 // door constructor
 function Door(name_) {
     this.name = name_;
     this.x = 0;
     this.img = emptyImage;
     this.openImg = emptyImage;
     this.scrollToHeight = 0;
     this.visited=false;
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
 
 var character = {
     x: 1900,
     y: 0,
     x2: 400,
     v2: 0,
     left: false,
     velocity: 20, /* velocity is linear, positive is +x */
     maxVelocity: 4,
     anim: "idle",
     percentToNextFrame: 0,
     animFrame: 0,
     anims: {
         // "id" : new Animation("name", width, height, number of frames, img element reference)
         "idle" : new Animation("idle", 74, 123, 1,idleImg ),
         "walking" : new Animation("walking",74,123,4,walkImg),
         "turn" : new Animation("turn",74,123,2,turnImg),
         "walkin" : new Animation("walkin",74,123,13,walkinImg),
         "dissapear" : new Animation("dissapear",74,123,4,dissapearImg),
         "none" : new Animation("none",0,0,1,emptyImage)
     },
     enterIndex: 0
 };
 character.anims["turn"].onComplete = "walkin";
 character.anims["walkin"].onComplete = "dissapear";
 character.anims["dissapear"].onComplete = "none";
 
window.addEventListener("focus", onFocus);

function onFocus() {
    character.percentToNextFrame = 0;
}
 
 //window.addEventListener("resize", onResize);
 var minResizeWidth = 900;
 var small = (window.innerWidth < minResizeWidth);
 /*function onResize() {
     if (!small & window.innerWidth < minResizeWidth) {
         var minis = document.getElementsByClassName("miniCanvas");
         for (i=0; i<minis.length; i++) {
             minis[i].style.opacity=0;
             small = true;
         }
     }
     if (small & window.innerWidth > minResizeWidth) {
         var minis = document.getElementsByClassName("miniCanvas");
         for (i=0; i<minis.length; i++) {
             minis[i].style.opacity=1;
             small = false; 
         }
     }
 }*/
 
 document.addEventListener("scroll",onScroll);
 var prevScroll = -1;
 function onScroll() {
     var topDist = 500;
     if (insideDoor) {
	 var correctScrollTop = 0;
	 // chrome and safari
	 if (isWebkit) { correctScrollTop = document.body.scrollTop; }
	 // firefox and IE
	 else { correctScrollTop = document.documentElement.scrollTop; }
	   if (correctScrollTop < prevScroll) {
		   if (correctScrollTop < topDist) {
			   prevScroll = -1;
			   resume();
		   }
		   return;
	   }
	   else {
		   prevScroll = correctScrollTop;
	   }
    }
 }
 
 // start button
 startButtonElem.addEventListener("click", function() {
 	startButtonElem.style.display = "none"; // hide button
 	document.getElementById("bigCanvas").style.display = "block"; // show canvas
 	targetH = 200; // scroll into view
 	getDoorHeights();
 });
 
 // click navigation
 document.getElementById("HomeBtn").addEventListener("click", function() { 
 	targetH = 50; 
 });
 document.getElementById("AboutMeBtn").addEventListener("click", function() { 
 	targetH = contactHeight; 
 });
 document.getElementById("BoardGamesBtn").addEventListener("click", function() { 
 	var directory = window.location.href.slice(0,window.location.href.indexOf("index.html"));
 	window.location.assign(directory + "/BenConnick.pdf");
 });
 document.getElementById("ProjectsBtn").addEventListener("click", function() { 
 	window.location.assign("https://bencgames.wordpress.com/"); 
 });
 document.getElementById("miniCanvas").addEventListener("click", function() { targetH = 420; });
/*document.getElementById("ProCanvas").addEventListener("click", function() { targetH = 420; });
document.getElementById("CatCanvas").addEventListener("click", function() { targetH = 420; });
document.getElementById("FinCanvas").addEventListener("click", function() { targetH = 420; });
document.getElementById("MusCanvas").addEventListener("click", function() { targetH = 420; });
document.getElementById("GooCanvas").addEventListener("click", function() { targetH = 420; });*/
 
 document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        leftPressed=true;
        rightPressed=false;
    }
    if(event.keyCode == 39) {
        rightPressed=true;
        leftPressed=false;
        rightPressedInDoor();
    }
    // this is repeated because it means that if both keys are pressed, 
    // the most recent one takes precedence
    if(event.keyCode == 37) {
        rightPressed=false;
    }
});
document.addEventListener('keyup', function(event) {
    if(event.keyCode == 37) {
        leftPressed = false;
    }
    if(event.keyCode == 39) {
        rightPressed = false;
    }
    if(event.keyCode == 13) {
        upPressed();
    }
    if(event.keyCode == 40) {
        // cheat mode  allVisited=true;
    }
});

// use clicking on the canvas' "buttons" to register keypresses
/*function fireKey(el, code)
{
    //Set key to corresponding code. 37 is left arrow key.
    var key = code;
    console.log("firekey run");
    if(document.createEventObject)
    {
    	console.log("createEventObject");
        var eventObj = document.createEventObject();
        eventObj.keyCode = key;
        el.fireEvent("onkeydown", eventObj);   
    }	
    else if(document.createEvent)
    {
    console.log("createEvent");
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("keydown", true, true);
        eventObj.which = key;
        el.dispatchEvent(eventObj);
    }
} */

/*function fireKeyUp(el, code)
{
    //Set key to corresponding code. 37 is left arrow key.
    var key = code;
    if(document.createEventObject)
    {
        var eventObj = document.createEventObject();
        eventObj.keyCode = key;
        el.fireEvent("onkeyup", eventObj);   
    } 
    else if(document.createEvent)
    {
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("keyup", true, true);
        eventObj.which = key;
        el.dispatchEvent(eventObj);
    }
} */

function simulateKeyPress(code) {
	if(code == 37) {
        leftPressed=true;
        rightPressed=false;
    }
    if(code == 39) {
        rightPressed=true;
        leftPressed=false;
        rightPressedInDoor();
    }
}

function simulateKeyUp(code) {
    if(code == 37) {
        leftPressed = false;
    }
    if(code == 39) {
        rightPressed = false;
    }
    if(code == 13) {
        upPressed();
    }
}

var keyDownByMouse = false;

document.getElementById("leftBtn").addEventListener("mousedown",function(event) {
	simulateKeyPress(37);
	keyDownByMouse = true;
});
document.getElementById("rightBtn").addEventListener("mousedown",function(event) {
	simulateKeyPress(39);
	keyDownByMouse = true;
});
document.getElementById("enterBtn").addEventListener("mouseup",function(event) {
	simulateKeyUp(13);
});

document.addEventListener("mouseup",function() {
	if (keyDownByMouse) {
		simulateKeyUp(37);
		simulateKeyUp(39);
		keyDownByMouse = false;
	}
});

function rightPressedInDoor() {
	if (timeOut<0.5) { targetH = 420;  return; }
}

// checks to see if you can enter a door
function upPressed() {
    // if the user is entering text, don't do anything
    if (document.activeElement == document.getElementById("uIn")) { return; }
    // if the player is inside a door, go back to the top of the page and resume()
    if (timeOut<0.5) { targetH = 420;  return; }
    var minDistance = 100000;
    var minDoorIndex = -1;
    if (true) {
        for (i=0; i<doors.length; i++) {
            // this convoluted equation calculates how close the character is close to a door on screen
            var distToDoor = Math.abs(doors[i].x-(character.x)%roomWidth); // allowed to be negative
            if (distToDoor < minDistance) {
                minDoorIndex = i;
                minDistance = distToDoor;
            }
            if (i==0) {
                distToDoor = roomWidth-(character.x)%roomWidth;
                if (distToDoor < minDistance) {
                    minDoorIndex = i;
                    minDistance = distToDoor;
                }
            }
        }
    	enterDoor(minDoorIndex);
	}
}

function enterDoor(doorIndex) {
	getDoorHeights();
    playMode = false;
    door = doorIndex;
}

function resume() {
    playMode = true;
    centeredInDoorway = false;
    insideDoor = false;
    //document.getElementById(doors[door].name).style.backgroundImage = 'url("images/metaldoor_flipped.png")';
    bdHidden = false; // reset the bool for the door
    door = -1; 
    character.y=0;
    character.anim = "idle";
    mini.clearRect(0,0,500,500);
    /*mus.clearRect(0,0,500,500);
    pro.clearRect(0,0,500,500);
    cat.clearRect(0,0,500,500);
    fin.clearRect(0,0,500,500);
    goo.clearRect(0,0,500,500);*/
    character.x2=400;
    character.v2=0;
}

function getDoorHeights() {
	doors.forEach(function(door) {
		//console.log("door " + door.name + " height " + document.getElementById(door.name).getBoundingClientRect().top);
	    // rects are relative to the viewport
	    // body rect relative to viewport
	    var bodyRect = document.body.getBoundingClientRect();
		// get the element relative to the viewport
    	var elemRect = document.getElementById(door.name).getBoundingClientRect();
    	// elem relative to body
    	var offset = elemRect.top - bodyRect.top;
    	// add 50 for spacing from top
	    door.scrollToHeight = offset - 50;
	});
	// body rect relative to viewport
	var bodyRect = document.body.getBoundingClientRect();
	// get the element relative to the viewport
	var elemRect = document.getElementById("contact").getBoundingClientRect();
	// elem relative to body
	var offset = elemRect.top - bodyRect.top;
	// add 50 for navbar
	contactHeight = offset - 50;
}

function msieversion() {
        var ua = navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        var edge = ua.indexOf("Edge");
        if (edge > 0) {
        	isEdge = true;
        }
        if (edge > 0 || msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./))  {    // If Internet Explorer, return version number
            alert("Some features on this page are not compatible with Internet Explorer or Microsoft Edge. For the full experience, use a different browser."); //parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
            return true;
        }
   return false;
}

function start() {
	isIE = msieversion();
	mobileDebug(true);
    rightPressed=true;
    prevTime = Date.now();
    gameLoop();
}

var dbg;

function mobileDebug(enabled) {
	if (enabled) {
		dbg = document.createElement("div");
		dbg.style.maxHeight = "5000px";
		document.body.appendChild(dbg);
		window.onerror = function(errorMsg, url, linenumber) { handleErrorMobile(errorMsg, url, linenumber); };
	} else {
		dbg.style.display = "none";
	}
}

function handleErrorMobile(errorMsg, url, linenumber) {
		dbg.style.display = "block";
		dbg.innerHTML = dbg.innerHTML + "<br>"
		+ errorMsg + ", " + url + ", line# " + linenumber;
	}

// loading
/*
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
*/
start();

// wait until the elements are in place 
// to find out where they are
window.onload = function() {
	getDoorHeights();
};