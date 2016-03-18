// reusable functions that are not reliant on other parts of the program
// --------------------------------------------------------------------------

// shortcut for document.querySelector
function getByClass(className) {
	return document.querySelector("."+className);
}

// shortcut for document.querySelector
function getById(id) {
	return document.getElementById(id);
}

// checks to see if an element has a class
function hasClass(ele,cls) {
  return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

// adds a class to an element
function addClass(ele,cls) {
  if (!hasClass(ele,cls)) ele.className += " "+cls;
}

// removes a class from an element
function removeClass(ele,cls) {
  if (hasClass(ele,cls)) {
	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
	ele.className=ele.className.replace(reg,' ');
  }
}