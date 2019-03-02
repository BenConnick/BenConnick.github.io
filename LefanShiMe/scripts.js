// page elements
var gallery;
var upButton;
var viewer;
var viewerContainer;
var descriptionEl;
var viewerLeftArrow;
var viewerRightArrow;
var hamburger;
var mobileNavInner;
var scrollData = undefined;

function createPreviewElement(artData) {
  var linkEl = document.createElement("a");
  linkEl.classList.add("preview");
  linkEl.href = "index.html?" + artData.fullImageURL;
  var imageEl = document.createElement("img");
  imageEl.src = artData.previewURL;
  var nameEl = document.createElement("span");
  nameEl.innerHTML = artData.previewName;

  linkEl.appendChild(imageEl);
  linkEl.appendChild(nameEl);
  gallery.appendChild(linkEl);
}

function showViewer(artData) {
  show(viewerContainer);
  show(description);
  hide(upButton);
  hide(gallery);
  show(viewerRightArrow);
  show(viewerLeftArrow);
  viewer.src = artData.fullImageURL;
  description.innerHTML = artData.description;
  var idx = artData.index;
  if (idx < 1) {
    hide(viewerLeftArrow);
  } else {
    viewerLeftArrow.href = "index.html?" + artworks[idx - 1].fullImageURL + "#viewer";
  }
  if (idx >= artworks.length - 1) {
    hide(viewerRightArrow);
  } else {
    viewerRightArrow.href = "index.html?" + artworks[idx + 1].fullImageURL + "#viewer";
  }
}

function showGallery() {
  hide(viewerContainer);
  hide(description);
  show(upButton);
  show(gallery);
  gallery.innerHTML = "";
  for (var i=0; i<artworks.length; i++) {
    createPreviewElement(artworks[i]);
  }
}

function hide(el) {
  el.classList.add("hidden");
}

function show(el) {
  el.classList.remove("hidden");
}

function fadeout(el) {
  el.classList.add("faded-out");
  el.classList.remove("faded-in");
}

function fadein(el) {
  el.classList.remove("faded-out");
  el.classList.add("faded-in");
}

function init() {
  // find elements
  gallery = document.getElementById("gallery");
  upButton = document.getElementById("backtop");
  viewer = document.getElementById("viewer");
  viewerContainer = document.querySelector(".viewerContainer");
  descriptionEl = document.getElementById("description");
  viewerLeftArrow = document.getElementById("leftbutton");
  viewerRightArrow = document.getElementById("rightbutton");
  hamburger = document.querySelector(".hamburger");
  mobileNavInner = document.querySelector(".mobileNavInner");

  // mobile nav
  hamburger.addEventListener("click",() => {
    hide(hamburger);
    show(mobileNavInner);
    fadein(mobileNavInner);
  });

  // home page
  if (window.location.href.indexOf("index") > -1) {
    // check if the url contains image query
    var linkParts = window.location.href.split(/[\?\#]/);
    if (linkParts != undefined && linkParts[1] != undefined) {
      var artData = getArtData(linkParts[1])
      if (artData != undefined) {
        showViewer(artData);
        return;
      }
    }
    // no valid image query, show home page
    showGallery();
  }

  // up button click
  if (upButton != undefined) {
    upButton.addEventListener("click",() => {
      console.log("scroll to top");
      scrollData = {
        startPos: getScrollTop(),
        targetPos: 0,
        startTime: Date.now(),
        duration: 500
      };
    });
    tick(1);
  }
}

function tick(dt) {
  handleAutoScroll(dt);
  window.requestAnimationFrame(tick);
}

function handleAutoScroll(dt) {
  if (scrollData === undefined) return;
  var millis = Date.now() - scrollData.startTime;
  var t = millis / scrollData.duration;
  var done = t > 1;
  if (done) {
    setScrollTop(scrollData.targetPos);
    scrollData = undefined; // clear
  } else {
    var deltaPos = scrollData.targetPos - scrollData.startPos;
    setScrollTop(scrollData.startPos + deltaPos * easeInOutSin(t));
  }
}

function setScrollTop(y) {
  document.documentElement.scrollTop = y; // chrome
  document.body.scrollTop = y; // safari
}

function getScrollTop() {
  //                 chrome                 ||        safari
  return document.documentElement.scrollTop || document.body.scrollTop;
}

function easeInOutSin(t,a=3.2,b=0.5,h=-0.5,v=0.5) {
  return b * fakeSin(a*(t+h))+v;
}

function fakeSin(x) {
  var threeFactorial = 6;
  var fiveFactorial = 120;
  var sevenFactorial = 5040;
  var third = x*x*x;
  var fifth = third*x*x;
  var seventh = fifth*x*x;
  return x - third/threeFactorial + fifth/fiveFactorial - seventh/sevenFactorial
}

function getArtData(partialImageURL) {
  for(var i=0; i<artworks.length; i++) {
    if (artworks[i].fullImageURL.indexOf(partialImageURL) > -1) {
      artworks[i].index = i;
      return artworks[i];
    }
  }
}

window.addEventListener("load",init);
