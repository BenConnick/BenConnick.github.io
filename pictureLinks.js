window.addEventListener("load",init);

var viewer = {};

//http://stackoverflow.com/a/27743820
// forEach method, could be shipped as part of an Object Literal/Module
var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, array[i]); // passes back stuff we need
  }
};

function setViewerDisplay(dispString) {
	viewer.frame.style.display = dispString;
	viewer.dark.style.display = dispString;
	viewer.closeBtn.style.display = dispString;
}

function closeViewer() {
	// if defined
	if (viewer.frame!=undefined) {
		setViewerDisplay("none");
	}
	if (viewer.querySelector("iframe") != undefined) {
		toggleVideo(viewer.querySelector("iframe"), 'hide');
	}
}

function showViewer() {
	// if defined
	if  (viewer.frame!=undefined) {
		setViewerDisplay("block");
	}
	// make sure you're at the top
	viewer.frame.scrollTop = 0;
}

function toggleVideo(frame, state) {
    // if state == 'hide', hide. Else: show video
    var iframe = frame.contentWindow;
    func = state == 'hide' ? 'pauseVideo' : 'playVideo';
    iframe.postMessage('{"event":"command","func":"' + func + '","args":""}','*');
}

function init() {

	// stores a reference to the project-viewer frame
	viewer.frame = document.querySelector("#floatingFrame");
	viewer.dark = document.querySelector(".darkOverlay");
	viewer.closeBtn = document.querySelector("#closeFloatingFrameBtn");
	
	// exit
	viewer.dark.onclick = function() { closeViewer(); };
	viewer.closeBtn.onclick = function() { closeViewer(); };
	
	// thumbnail buttons
	var containers = document.querySelectorAll(".projectBtnHolder");
	console.log(containers);
	forEach(containers,function(container) {
		var buttons = container.children;
		forEach(buttons,function(button) {
			button.onclick = function() {
				// loop through everything in the viewer and hide it
				for (var i=0; i<viewer.frame.children.length; i++) {
					console.log(viewer.frame.children[i]);
					viewer.frame.children[i].style.display = "none";
				};
				//container.style.display = "none";
				var sectId = button.id.substring(0,button.id.indexOf("Btn")) + "Sect";
				console.log(sectId);
				//document.querySelector("#"+sectId).style.display = "block";
				//viewer.frame.innerHTML = document.querySelector("#"+sectId).innerHTML;
				document.querySelector("#"+sectId).style.display = "block";
				showViewer();
			}
		});
	});
	console.log("thumbnails successfully linked");

	// clicking
	document.getElementById("emoney").onclick = function() { console.log("click"); window.location = 'FinancialTimeline/index.html'; };
	document.getElementById("CvRscreenshot").onclick = function() { console.log("click"); window.location = 'https://bitbucket.org/theHooloovoo/amalgamation'; };
	document.getElementById("PHscreenshot").onclick = function() { console.log("click"); window.location = 'http://people.rit.edu/bxc3201/ProcrastinatorHero'; };
	document.getElementById("googlyScreenshot").onclick = function() { console.log("click"); window.location = 'http://bengames.x10host.com/GooglyEyes/UnityWorldProject.html'; };
	document.getElementById("dreamsOfUsScreenshot").onclick = function() { console.log("click"); window.location = 'DreamsOfUs/index.html'; };
}