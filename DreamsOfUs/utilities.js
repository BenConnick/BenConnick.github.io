// helpful functions that aren't dependent on anything

// exponents
function xToPowerOfY(x,y) {
	var result = 1;
	for (var i=0; i<y; i++) {
		result*=x;
	}
	return result
}

// hide
function hideElement(elem) {
	console.log(elem.id);
	elem.style.display = "none";
}

// display
function displayBlock(elem) {
	elem.style.display = "block";
}

// clear context transforms
function clear(context) {
	if (!context) {
		// special exception for this program
		context = app.graphics.ctx;
	}
	context.setTransform(1,0,0,1,0,0);
}

function q(str) {
	return document.querySelector(str);
}

// time
var deltaTime = 0;
var prevTime = 0;


// developer debugging
var x_debug_x = false;

window.addEventListener("load",function() {
	if (x_debug_x) q("#cheatInput").style.display = "block";
	var x_CheatInput_x = q("#cheatInput");
	x_CheatInput_x.onkeydown=function(event) { 
		if (event.keyCode == 13) x_HandleCheats_x(event.target || event.srcElement);
	};
});
function x_HandleCheats_x(elem) {
	console.log("handle cheats activated: " + elem.value);
	switch(elem.value) {
		case "onelife":
			app.game.lives = 1;
			break;
		case "longlife":
			app.game.lives = 10000;
			break;
		case "debugoff":
			toggleDebug();
			break;
		case "speedup":
			app.game.maxGameTime = 10000;
			break;
		case "catcrazy":
			app.game.catChance = 1;
			break;
	}
}

// map a value between an original min and max to a proportionate new value in a new min and max
function MapValue(val,minOrig,maxOrig,minNew,maxNew) {
	return minNew + (maxNew-minNew) * (val - minOrig) / (maxOrig-minOrig);
}

function toggleDebug() {
	if (x_debug_x) {
		q("#cheatInput").style.display = "none";
	} else {
		q("#cheatInput").style.display = "block";
	}
	x_debug_x = !x_debug_x;
}

/*
// gets a random number between 0 and 1 on a bell curve
function GetRandBellCurved(steepness) {
	var val = 0;
	// sum the values of Math.random. Larger "steepness" is closer to average
	for (var i=0; i<steepness; i++) {
		val += Math.random()/steepness;
	}
	return val;
}

// recursively finds APPROXIMATE halfway points and fills an array with sequential halfway points
function Xenos(min,max,depth) {
	// if invalid value
	if (depth <= 0) return;
	
	// pre-determine the length of the array
	var valsLength = xToPowerOfY(2,depth-1)+1;
	// create an array to hold values
	var vals = [];
	// fill array with 0
	for (var i=0; i<valsLength; i++) {
		vals[i] = 0;
	}
	// set midpoint value
	//vals[Math.floor(valsLength/2)+1] = XenosRand(min,max);
	
	// recursively fill the array
	XenosRec(min,max,valsLength,vals);
	return vals;
}

// helper function for Xenos
function XenosRec(min,max,length,vals) {
	// if there is no space left, exit the recursion
	if (length<=0) {
		return;
	// if there is space, fill the middle space and go deeper 
	} else {
		// set mid value
		vals[Math.floor(length/2)] = XenosRand(min,max);
		XenosRec(min, vals[Math.floor(length/2)], Math.floor(length/2), vals);
		XenosRec(vals[Math.floor(length/2)], max, Math.floor(length/2), vals);
	}
}

function XenosRand(min,max) {
	return min+(max-min)*GetRandBellCurved(3);
}
*/