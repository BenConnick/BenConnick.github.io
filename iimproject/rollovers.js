/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// element objects are named after the content of the quote

var likeEachother = document.getElementById("quote1");
var notGoodEnough = document.getElementById("quote2");
var inspireThem = document.getElementById("quote3");
var expandGames = document.getElementById("quote4");

if (document.getElementById("quote4") != null) {
    notGoodEnough.onclick = function() {
        window.location = "notGoodEnough.html";
    };

    expandGames.onclick = function() {
        window.location = "expand.html";
    };

    likeEachother.onclick = function() {
        window.location = "likeEachother.html";
    };

    inspireThem.onclick = function() {
        window.location = "somethingToInspire.html";
    };
}

var quoteElements = document.getElementsByClassName("quote");

function getCssProperty(element, property){
   return window.getComputedStyle(element,null).getPropertyValue(property);
}

function pixelsStringToNumber(str) {
    return Number(str.substring(0,str.length-2));
}

function createNewChirp( target ) {
    var newChirp = document.createElement("div");
    newChirp.target = target;
    var left = getCssProperty(target,"left");
    var top = getCssProperty(target,"top");
    newChirp.style.pointerEvents = "none";
    newChirp.className = "chirp";
    newChirp.style.left = ""+(pixelsStringToNumber(left)+window.innerWidth/40) + "px";
    newChirp.style.top = ""+(pixelsStringToNumber(top)-window.innerWidth/40) + "px";
    newChirp.style.width = ""+window.innerWidth/10+"px";
    newChirp.style.height = newChirp.style.width;
    newChirp.style.opacity = 0.5;
    document.body.appendChild(newChirp);
};

window.onload = function() {
for (i=0; i<quoteElements.length; i++) {
    //var left = getCssProperty(quoteElements.item(i), "left");
    //var top = getCssProperty(quoteElements.item(i), "top");
    quoteElements.item(i).onmouseover = function() { createNewChirp(event.currentTarget); };
    //console.log(left);
}
};

window.setInterval(function() {glow();}, 10);

function glow() {
    var chirps = document.getElementsByClassName("chirp");
    //onsole.log(chirps.length);
    if (chirps.length > 0) {
        for (i=0; i<chirps.length; i++) {
            if (chirps.item(i).style.opacity <= 0) {
                document.body.removeChild(chirps.item(i));
            }
            else {
                var chirpWidth = pixelsStringToNumber(chirps.item(i).style.width);
                chirps.item(i).style.left = "" + (pixelsStringToNumber(chirps.item(i).style.left) - 0.02*chirpWidth/2) + "px";
                chirps.item(i).style.top =  "" + (pixelsStringToNumber(chirps.item(i).style.top) - 0.02*chirpWidth/2) + "px";
                chirps.item(i).style.width = "" + chirpWidth*1.02 + "px";
                chirps.item(i).style.height = chirps.item(i).style.width;
                chirps.item(i).style.opacity-=0.01;
            }
        }
    }
}

if (document.getElementById("pic") != null) {
    var about = document.getElementById("about");
    document.getElementById("pic").onmouseover = function() { about.className = "aboutHover";};
    document.getElementById("pic").onmouseout = function() { about.className = "about";};
}