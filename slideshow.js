"use strict"

// a slideshow class, simply controls a slideshow
var Slideshow = {
	slides: undefined, // nodelist
	buttons: [], // array of button elems
	currentSlide: 0,
	// play must be called in order to begin autoplaying
	autoplaying: false,
	// the id of the timer for autoadvancing the slides
	windowTimer: undefined,
	// beginning slideshow
	init: function() {
		this.slides = document.querySelectorAll(".slideshowSlide");
		this.createButtons();
		this.show(0);
		this.play();
	},
	createButtons: function() {
		// ref
		var that = this;
		// Buttons
		function create(container, id) {
			var button = document.createElement("button");
			button.onclick = function() { 
				that.show(id);
				that.stop(); // do not auto-advance once the user is interested
			};
			button.setAttribute("class","slideButton");
			buttonHolder.append(button);
			that.buttons.push(button);
		}
		var buttonHolder = document.querySelector(".slideshowButtons");
		for (var i=0; i<that.slides.length; i++) {
			create(buttonHolder, i);
		}
	},
	next: function() {
		this.show(this.currentSlide+1);
	},
	prev: function() {
		this.show(this.currentSlide-1);
	},
	show: function(n) {
		this.currentSlide = n;
		if (n >= this.slides.length) { this.currentSlide = 0 } 
		if (n < 0) { this.currentSlide = this.slides.length-1 } ;
		for (var i = 0; i < this.slides.length; i++) {
			this.slides[i].style.display = "none"; 
			this.buttons[i].style.backgroundColor = "#333";
		}
		this.slides[this.currentSlide].style.display = "block"; 
		this.buttons[this.currentSlide].style.backgroundColor = "white";
	},
	play: function() {
		if (!this.autoplaying) {
			var that = this;
			this.windowTimer = setInterval(function() { that.next(); }, 2000);
		}
		this.autoplaying = true;
	},
	stop: function() {
		this.autoplaying = false;
		window.clearInterval(this.windowTimer);
	}
}

// init on page load
window.addEventListener("load",function() { Slideshow.init(); });