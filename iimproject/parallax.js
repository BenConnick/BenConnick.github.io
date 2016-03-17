/* 
 * Author: Ben Connick
 * File: parallax.js
 * Controls parallax for all pages
 */

var foreground = document.getElementById("foreground");
var background = document.getElementById("background");
document.onmousemove = function(event) { 
    background.style.backgroundPosition = ""+event.pageX/40+"% 0%";
    foreground.style.backgroundPosition = ""+event.pageX/20+"% 0%";
};

window.onresize = function() { resizeDarken(); };

function resizeDarken() {
    var darken = document.getElementById("darken");
    darken.style.height = "100%";
    darken.style.height = ""+document.body.scrollHeight+"px";
}
resizeDarken();