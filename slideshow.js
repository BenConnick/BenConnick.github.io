"use strict"

var Slideshow = {
	slides: undefined,
	currentSlide: 0,
	// beginning slideshow
	init: function() {
		this.slides = document.querySelectorAll(".slideshowSlide");
		this.show(0);
	},
	next: function() {
		this.show(this.currentSlide+1);
	},
	prev: function() {
		this.show(this.currentSlide-1);
	},
	show: function(n) {
		this.currentSlide = n;
		if (n => this.slides.length) { this.currentSlide = 0 } 
		if (n < 0) { this.currentSlide = this.slides.length } ;
		for (var i = 0; i < this.slides.length; i++) {
			this.slides[i].style.display = "none"; 
		}
		this.slides[this.currentSlide].style.display = "block"; 
	}
}

// init on page load
window.addEventListener("load",function() { Slideshow.init(); });