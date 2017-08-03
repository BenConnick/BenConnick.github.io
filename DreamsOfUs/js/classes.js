// classes.js
// author: Ben Connick
// last modified: 3/9/2017

"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

/**************************** CLASSES *********************************/
 
 //console.log("classes loaded");
 
 // 2D vector constructor
 function Vector2D(x_,y_) {
     this.x = x_;
     this.y = y_;
     this.magSqr = function() {
     		//console.log("magsqr called x: " + this.x + " y: " + this.y);
         return (this.x*this.x + this.y*this.y);
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
 	 this.name = "unnamed";
 	 this.enabled = true;
     this.x = 0;
     this.y = 0;
     this.xanchor = 0;
     this.yanchor = 0;
     this.scale = 1;
     this.angle = 0;
     this.left = false;
     this.xvelocity = 0;
     this.rotateWithXVel = true;
     this.bounds = undefined; // bounds: [left, right, up, down]
     this.radius = 50;
     this.yvelocity = 0;
     this.maxVelocity = 5;
     this.child = null;
     this.percentToNextFrame = 0;
     this.animFrame = 0;
     this.anim = "idle";
     this.anims = {};
     this.flashingTime = 0;
     this.updatePosition = function () {
     	
     	var canvasWidth = app.graphics.canvasWidth;
     	var canvasHeight = app.graphics.canvasHeight;
     
         // update position
        if (Math.abs(this.xvelocity) > 0.01) {
           this.x += this.xvelocity*deltaTime/20;
        }
        if (Math.abs(this.yvelocity) > 0.01) {
           this.y += this.yvelocity*deltaTime/20;
        }
        if (this.bounds != undefined) {
        	// bounds: [left, right, up, down]
			if (this.x + this.radius > this.bounds[1]) {
				this.x = this.bounds[1] -  this.radius;
			}
			if (this.x - this.radius < this.bounds[0]) {
				this.x = this.bounds[0] + this.radius;
			}
			if (this.y + this.radius > this.bounds[3]) {
				this.y = this.bounds[3] - this.radius;
			}
			if (this.y - this.radius < this.bounds[2]) {
				this.y = this.bounds[2] + this.radius;
			}
	   }
     };
     
     this.updateAnim = function() { app.graphics.updateAnimation(this); };
     this.update = function() {
     	// don't run if the object is disabled
     	if (!this.enabled) return;
     	
         this.updatePosition();
         this.updateAnim();
     };
     this.draw = function() {
     	// don't draw if the object is disabled
     	if (!this.enabled) return;
     	
     	// don't draw if the object is invisible
     	// object invisible off and on when "flashing"
     	if (this.flashingTime > 0) {
     		this.flashingTime -= deltaTime;
     		if (this.flashingTime%100 > 50) {
     			return;
     		}
     	}
     
        clear();
        // current animation
        var anim = this.anims[this.anim];
        // translate to appropriate position
        app.graphics.ctx.translate(this.x,this.y);
        //angle = 0;
        // change angle according with velocity
        if (this.rotateWithXVel) {
        	this.angle=Math.max(Math.min(this.xvelocity/30,0.2),-1);
        }
        // rotate to angle
        app.graphics.ctx.rotate( this.angle );
        // offset
        app.graphics.ctx.translate(this.xanchor,this.yanchor);
        // flip for opposite direction
        if (this.left) { app.graphics.ctx.scale(-1,1); }
        // the -frameWidth/2 makes it so that the avatar is drawn from its center
        app.graphics.ctx.drawImage(anim.spriteSheet, 
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
        	app.graphics.ctx.translate(this.child.xanchor,this.child.yanchor);
        
        	// current animation
        	var childAnim = this.child.anims[this.child.anim];
        	app.graphics.ctx.drawImage(childAnim.spriteSheet, 
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