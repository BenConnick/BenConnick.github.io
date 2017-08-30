window.addEventListener("load",init);

var viewer = {};

//http://stackoverflow.com/a/27743820
// forEach method, could be shipped as part of an Object Literal/Module
var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, array[i]); // passes back stuff we need
  }
};

function toggleViewer() {
  viewer.hidden = !viewer.hidden;
  updateViewer();
}

function updateViewer() {
  viewer.frame.style.left = viewer.hidden ? "-150%" : "0%";
  viewer.closeBtn.style.display = viewer.hidden ? "none" : "block";
}

function setViewerDisplay(dispString) {
	viewer.frame.style.display = dispString;
	//viewer.dark.style.display = dispString;
	viewer.closeBtn.style.display = dispString;
}

function closeViewer() {
	// if defined
	if (viewer.frame!=undefined) {
		//setViewerDisplay("none");
		viewer.hidden = true; 
		updateViewer();
		if (viewer.section.querySelector("iframe") != undefined) {
			toggleVideo(viewer.section.querySelector("iframe"), 'pause');
		}
	}
}

function showViewer() {
	// if defined
	if  (viewer.frame!=undefined) {
		viewer.hidden = false; 
		updateViewer();
	}
	// make sure you're at the top
	viewer.frame.scrollTop = 0;
}

function toggleVideo(frame, state) {
    // if state == 'pause', pause. Else: show video
    var iframe = frame.contentWindow;
    var func = state == 'pause' ? 'pauseVideo' : 'playVideo';
    iframe.postMessage('{"event":"command","func":"' + func + '","args":""}','*');
}

function linkIdToUrl(id, url) {
  document.getElementById(id).onclick = function() { 
    console.log(id+" clicked"); 
    window.location = url; 
  };
}

function init() {

	// stores a reference to the project-viewer frame
	viewer.frame = document.querySelector("#floatingFrame");
	viewer.dark = document.querySelector(".darkOverlay");
	viewer.closeBtn = document.querySelector("#closeFloatingFrameBtn");
	viewer.hidden = true;
	
	// exit
	viewer.dark.onclick = function() { closeViewer(); };
	viewer.closeBtn.onclick = function() { closeViewer(); };
	
	// filters
	var filterBtns = document.querySelectorAll(".filterBtn");
	forEach(filterBtns,function(filterBtn) {
		linkFilterBtnToFilter(filterBtn);
	});
	console.log("filters linked");
	
	// thumbnail buttons
	var containers = document.querySelectorAll(".projectBtnHolder");
	//console.log(containers);
	forEach(containers,function(container) {
		var buttons = container.children;
		forEach(buttons,function(button) {
			linkThumbnailBtnToSection(button);
		});
	});
	console.log("thumbnails linked");

	// clicking
	linkIdToUrl('emoney','FinancialTimeline/index.html');
	linkIdToUrl('CvRscreenshot','https://bitbucket.org/theHooloovoo/amalgamation');
	//linkIdToUrl('PHscreenshot','http://people.rit.edu/bxc3201/ProcrastinatorHero');
	//linkIdToUrl('googlyScreenshot','http://bengames.x10host.com/GooglyEyes/UnityWorldProject.html');
	linkIdToUrl('dreamsOfUsScreenshot','DreamsOfUs/index.html');
}

function linkThumbnailBtnToSection(button) {
	button.onclick = function() {
		// loop through everything in the viewer and hide it
		for (var i=0; i<viewer.frame.children.length; i++) {
			//console.log(viewer.frame.children[i]);
			viewer.frame.children[i].style.display = "none";
		};
		// buttons have the same prefix as the corresponding section
		var sectId = button.className.substring(0,button.className.indexOf("Btn")) + "Sect";
		//console.log(sectId);
		//document.querySelector("#"+sectId).style.display = "block";
		//viewer.frame.innerHTML = document.querySelector("#"+sectId).innerHTML;
		// store a reference to the section
		viewer.section = document.querySelector("#"+sectId);
		viewer.section.style.display = "block";
		showViewer();
	}
}

function linkFilterBtnToFilter(button) {
	button.onclick = function() { 
		var filterName = button.className.substring(0,button.className.indexOf("-filterBtn"));
		setFilter(filterName, button);
	}
}

function setFilter(name, button) {
	// hide all filters
	var filters = document.querySelectorAll(".filter");
	forEach(filters,function(filter) {
		filter.style.display = "none";
	});
	
	// clear button styles
	var filterBtns = document.querySelectorAll(".filterBtn");
	forEach(filterBtns,function(fb) {
		fb.style.color = "#222";
		fb.style.backgroundColor = "#ddd";
	});
	
	// hightlight this button
	button.style.color = "#ddd";
	button.style.backgroundColor = "#222";
	
	// find the div that contains the buttons for the given filter
	var filterElem = document.querySelector("."+name+"-filter")
	
	// validate
	if (filterElem) {
		filterElem.style.display = "block";
	} else {
		// show all by default
		document.querySelector(".all-filter").style.display = "block";
	}
}