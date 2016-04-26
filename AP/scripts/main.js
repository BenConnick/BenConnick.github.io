// MAIN FUNCTIONALITY OF THE APP

// runs once on start - sets up program
function init() {
	mobileDebug(true);
	loadJSON();
	loadCookies();
	setCookieButtonText();
	activateButtons();
	clearMoves();
	populateKeywords();
}

// returns weapon object from name string
function getWeapon(name) {
	for (var i=0; i<weapons.length; i++) {
		if (weapons[i].name == name) {
			return weapons[i];
		}
	}
	// if none
	return weapons[0];
}

// creates a button for a move object
function createUseButton(moveObject) {
	var useBtn = document.createElement("button");
	useBtn.setAttribute("class","useBtn");
	useBtn.innerHTML = "use (" + moveObject.AP + " AP)";
	useBtn.onclick = function() {
		useAbility(moveObject);
	}
	return useBtn;
}

// removes use button in a container
function removeUseButtons(containerElem) {
	var UseButtons = containerElem.querySelectorAll(".useBtn");
	for (var j=0; j<UseButtons.length; j++) {
		UseButtons[j].parentNode.removeChild(UseButtons[j]);
	}
}

// special text values for use with the displayMove function
var addText = 'Add to <span style="font-weight: bold">My Moves</span>';
var removeText = 'Added';
var useText = 'Use';
var buttonText = addText;
var abilityBoxUniqueId = 0;

// create a move ui elem within specified container
function displayMove(move, hideButton, containerElem) {
	
	// hideButton default to hide
	if (hideButton == null) hideButton = true;
	// container default to body
	if (!containerElem) containerElem = document.body;
	
	var rollStr = "";
	if (move.roll != "") {
		rollStr = '<div class="categoryLabel">Roll</div>'+
		'<div>'+move.roll+'</div>';
	}
	var diffStr = "";
	if (move.difficulty != null && move.difficulty != "") {
		diffStr = '<div class="categoryLabel">Difficulty</div>'+move.difficulty;
	}
	
	var rangeStr = "";
	if (move.range != "") {
		rangeStr = '<div class="categoryLabel">Range</div>'+
		'<div>'+move.range+' </div>'
	}
	
	if (move.AP == "") {
		move.AP = "0";
	}
	var special = "Effect"; // default
	if (move.roll != "" && move.roll != null) {
		special = "On Success" // if a roll is required
	}
	if (move.special != null && move.special != "") {
		special = ' ['+move.special+']';
	}
	
	var triggerStr = "";
	if (move.trigger != "" && move.trigger != null) {
		triggerStr = '<div class="categoryLabel">Trigger</div><div>' + move.trigger + '</div>';
	} 
	
	// create the box that displays the move
	var outerContainer = document.createElement("div");
	outerContainer.setAttribute("class","moveBox");
	// increase unique Id for collapsing
	abilityBoxUniqueId++;
	// create outer shell and name
	outerContainer.innerHTML = '<div class="topRow" id="AB'+abilityBoxUniqueId+'"><p class="moveName">'+move.name+'</p></div>';
	// create inner part and contents
	var container = document.createElement("div");
	container.setAttribute("class","innerMoveBox");
	container.innerHTML = 
	/*'<div class="circle keyword" style="text-decoration: none" onclick="d(\'AP\')">'+
	'<span class="AP">'+
	move.AP+'</span></div><span class=buttonHolder></span><br>'+
	*/
	// Roll
	parseKeywords(parsePlaceholders(rollStr)) + diffStr +
	// Reaction Trigger
	parseKeywords(parsePlaceholders(triggerStr)) +
	// Effect
	'<div class="categoryLabel">'+special+'</div>'+
	'<div>'+parseKeywords(parsePlaceholders(move.effect))+'</div>'+
	// Range
	parseKeywords(parsePlaceholders(rangeStr));

	// display the box on the page
	if (myMoves.indexOf(move) > -1) {
		//	add use button	
		var useBtn = createUseButton(move);
		useBtn.setAttribute("class","useBtn");
		removeUseButtons(container);
		outerContainer.appendChild(useBtn);
	}
	outerContainer.appendChild(container);
	containerElem.appendChild(outerContainer);
	
	if (!move.basic && hideButton == false) {
		// add the "add to moves" button
		var addBtn = document.createElement("button");
		addBtn.setAttribute("class","addBtn");
		addBtn.innerHTML = buttonText;
		addBtn.onclick = function() {
			if (move.added) {
				console.log(move.name + " removed");
				myMoves.pop(move);
				character.moves.pop(move.name);
				move.added = false;
			
				addBtn.innerHTML = addText;
				addBtn.style.backgroundColor = "rgba(255,255,255,0.5)";
			
				removeUseButtons(container);
			}
			else {
				console.log(move.name + " added");
				myMoves.push(move);
				console.log(myMoves);
				character.moves.push(move.name);
				move.added = true;
			
				addBtn.innerHTML = removeText;
				addBtn.style.backgroundColor = "rgba(0,255,0,0.5)";
			
				//var useBtn = createUseButton(move);
				//removeUseButtons(container);
				//container.querySelector(".buttonHolder").appendChild(useBtn);
			}
		}
		container.appendChild(addBtn);
		if (myMoves.indexOf(move) > -1) {
			addBtn.style.backgroundColor = "rgba(0,255,0,0.5)";
			addBtn.innerHTML = removeText;
		}
	}
	
	 collapserObjects["AB"+abilityBoxUniqueId] = new Collapser(outerContainer,outerContainer.querySelector(".topRow"),container);
}

// check if the move exists (this is a slow method)
function moveExistsInList(name,list) {
	for (var i=0; i<list.length; i++) {
		if (list[i].name == name) {
			return true;		
		}
	}
	return false;
}

function useAbility(moveObject) {
	//console.log(moveObject.roll);
	// subtract AP
	addToAP(-1 * moveObject.AP)
	
	// move up info box
	extendUseBox();
	
	var roll = tryParseRoll(moveObject.roll);
	if (roll != null && roll != "") {
		roll = "<br>Roll: " + roll;
	} else {
		roll = "";
	}
	
	// set menu text to AP
	getById("rollCalculation").innerHTML = moveObject.name + " used."
	+ "<br>AP used: " + moveObject.AP + "  Current AP: " + AP;
	//+ roll;
	
	/*if (moveObject.roll == "") {
		getById("rollCalculation").innerHTML = "This ability automatically succeeds";
	}
	else {
		var result = tryParseRoll(moveObject.roll) 
		console.log(result);
		if (result == "" || result == undefined) {
			getById("rollCalculation").innerHTML = moveObject.roll;
		}
		else {
			getById("rollCalculation").innerHTML = result;
		}
	}*/
	
	// offer "simulate roll" button
}

function parseMath(mathStr) {
	// output string
	var newString = mathStr;
	// array of strings
	var parts = mathStr.split(" ");
	// array of equation 
	var numbersAndOperators = [];
	// loop through the equation
		(function (piece) {
		if (piece == "+" || piece == "-") {
			numbersAndOperators.push(piece);
		} else {
			var piecePH = replacePlaceholder(piece);
			if (piecePH != undefined) {
				if (parseInt(piecePH) != NaN) {
					numbersAndOperators.push(parseInt(piecePH));
					
				}
			} else {
				if (parseInt(piece) != NaN) {
					numbersAndOperators.push(parseInt(piece));
				}
			}
		}
	});
	var total = 0;
	for (var i=0; i<numbersAndOperators.length; i++) {
		console.log("num/op " + numbersAndOperators[i]);
		if (numbersAndOperators[i] == "+") {
			total += (numbersAndOperators[i-1] + numbersAndOperators[i+1]);
			i = i+1; // already added second arg
		}
		if (numbersAndOperators[i] == "-") {
			total += (numbersAndOperators[i-1] + numbersAndOperators[i+1]);
			i = i+1; // already added second arg
		}
	}
	return total
}

function replacePlaceholder(ph) {
	// set to lower case for comparisons
	var placeholderLowerCase = ph.toLowerCase();
	// if ph is an equation
	if (ph.indexOf("+") >= 0 || ph.indexOf("-") >= 0) {
		return parseMath(ph);
	}
	// if ph is a single word, then replace it with its value
	switch(placeholderLowerCase) {
		case "d" : return DieImgElem(); break;
		case "ad" : return DieImgElem("attack"); break;
		case "dd" : return DieImgElem("defense"); break;
		case "strength" : return character.attributes["Strength"]; break;
		case "agility" : return character.attributes["Agility"]; break;
		case "intelligence" : return character.attributes["Intelligence"]; break;
		case "spirit" : return character.attributes["Spirit"]; break;
		case "weapon" : return getWeapon(character.primaryWeaponName).damage; break;
		case "defense" : return archetypes[character.charClass].Defense; break;
		default: return undefined
	}
}

// find and replace known placeholders in a string
function parsePlaceholders(str) {
	// if beginning character of a placeholder is detected
	var foundPlaceholder = false;
	// save the start of the placeholder for making a substring
	var beginIdx = -1;
	// list of placeholders for replacement
	var placeholders = [];
	// find placeholders
	for (var i=0; i<str.length; i++) {
		// if the first character of the placeholder was previously found
		if (foundPlaceholder) {
			// if the last character of the placeholder is now found
			if (str[i] == "|") {
				// create the placeholder string
				var phStr = str.substring(beginIdx+1,i);
				// add to list
				placeholders.push(phStr);
				// wait for next placeholder
				foundPlaceholder = false;
			}
		}
		else {
			// placeholder beginning character detected
			if (str[i] == "|") {
				beginIdx = i; // start substring
				foundPlaceholder = true;
			}
		}
	}
	// replace placeholders
	for (var i=0; i<placeholders.length; i++) {
		// for each placeholder in the list
		str = str.replace("|"+placeholders[i]+"|",replacePlaceholder(placeholders[i]));
	}
	return str;
}

function tryParseRoll(rollStr) {
	var newStr = "";
	var rollStrArr = rollStr.split(" ");
	for (var i=0; i<rollStrArr.length; i++) {6
		var word = rollStrArr[i];
		var found = false;
		switch (word) {
			case "Attack":
				found = true;
				newStr += "d20 + "+character.attributes["Agility"];
				break;
			case "Defense":
				found = true; 
				newStr += "d20 + "+archetypes[character.charClass].Defense;
				break;
		}
		var skills_ = Object.keys(character.skills);
		for (var j=0; j<skills_.length; j++) {
			if (found) { break; }
			var skill = skills_[j];
			if (word == skill) {
				found = true;
				newStr += "1d20 + "+ word +"[" + character.skills[skill] + "]";
				break;
			}
			else if (word == skill.split(" and ")[0]) {
				found = true;
				newStr += "d20 + "+ word +"[" + character.skills[skill] + "]";
				break;
			}
			//console.log(skill.split(" and ")[1]);
			else if (word == skill.split(" and ")[1]) {
				found = true;
				newStr += "d20 + "+ word +"[" + character.skills[skill] + "]";
				break;
			}
		}
		var keys_ = Object.keys(character.attributes);
		for (var j=0; j<keys_.length; j++) {
			if (found) { break; }
			var k = keys_[j];
			if (word == k) {
				found = true;
				newStr += "d20 + " + character.attributes[k];
				break;
			}
		}
		
		/*var styles_ = Object.keys(character.fightingStyles);
		for (var j=0; j<styles_.length; j++) {
			var style = styles_[j];
			if (word == style) {
				return "1d20 + "+ word +"[" + character.fightingStyles[word] + "]";
			}
		}*/
		if (!found) {
			newStr += word;
		}
	}
	return newStr;
}

function listMoves(moveListName) {
	//console.log("listMoves " + moveListName + " " + moveLists[moveListName].length);
	for (var i=0; i<moveLists[moveListName].length; i++) {
		displayMove(moveLists[moveListName][i]);
	}  
	//activateKeywords(); console.log("burp"); 
}

function listMovesCC(moveListName) {
	for (var i=0; i<moveLists[moveListName].length; i++) {
		displayMove(moveLists[moveListName][i],false);
	} 
}

function listMyMoves(container) {
	//console.log("listMoves " + myMoves + " " + myMoves.length);
	for (var i=0; i<myMoves.length; i++) {
		displayMove(myMoves[i],true,container);
	} 
}

function clearMoves() {
	var boxes = document.querySelectorAll(".moveBox");
	for (var i=0; i<boxes.length; i++) {
		boxes[i].parentNode.removeChild(boxes[i]);
	}

}

function clearScreens() {
	clearMoves();
	getById("loadButtons").style.display = "none";
	getById("mainMenu").style.display = "none";
	getById("saveArea").style.display = "none";
	getByClass("myCharacterBox").style.display = "none";
	getByClass("helpBox").style.display = "none";
	getById("aboutSection").style.display = "none";
	getByClass("helpfulHint").style.display = "none";
}

function resetAP() {
	setAP(maxAP);
}
function setAP(value) {
	AP = value;
	getByClass("APCounter").innerHTML = "" + AP + "AP";
	getByClass("APBattleCounter").innerHTML = "&nbsp&nbsp" + AP + "&nbsp&nbsp";
}
function addToAP(arg) {
	setAP(AP + arg);
}

function choiceBtnGroup(buttonIdList, questionNum) {
	var groupObject = {};
	groupObject.selected = "none";
	buttonIdList.forEach(function(buttonName) {
		var cbtn = getById(buttonName);
		if (questionNum == 1) {
			cbtn.onclick = function() {
				buttonIdList.forEach(function(buttonName) {
					var btn = getById(buttonName);
					removeClass(btn,"highlight");
				});
				addClass(cbtn,"highlight");
				getById("done").setAttribute("class","complete");
				getById("done").removeAttribute("disabled");
				groupObject.selected = buttonName;
				console.log(buttonName+" button pressed");
				characterClasses.forEach(function(archetypeName) {
					getById(archetypeName+"Preview").style.display = "none";
				});
				getById(buttonName+"Preview").style.display = "block";
			}
		}
		else {
		cbtn.onclick = function() {
			buttonIdList.forEach(function(buttonName) {
				var btn = getById(buttonName);
				removeClass(btn,"highlight");
			});
			addClass(cbtn,"highlight");
			getById("done").setAttribute("class","complete");
			getById("done").removeAttribute("disabled");
			groupObject.selected = buttonName;
			if (choiceDescriptions[buttonName] != "" && choiceDescriptions[buttonName] != null) {
				//choiceTextElem.innerHTML = choiceDescriptions[buttonName];
				choiceTextElem.style.display = "block";
			} 
			else {
				//choiceTextElem.innerHTML = "";
				choiceTextElem.style.display = "none";
			}
		}
		}
	});
	return groupObject;
}

// The following 3 function run in order
// 1) save answer from last question
function addToCharacter() {
	switch (choiceNumber) {
	case 1:
		//primarySkillChoice.selected = skills[characterClasses.indexOf(characterClass.selected)];
		//character.primarySkill = primarySkillChoice.selected;
		
		// update character obj 
		character.charClass = characterClass.selected;
		
		// set attributes based on class
		character.attributes["Strength"] =  archetypes[character.charClass].Attributes[0]; // attributeDefaults[character.charClass][0];
		character.attributes["Agility"] = archetypes[character.charClass].Attributes[1];
		character.attributes["Intelligence"] = archetypes[character.charClass].Attributes[2];
		character.attributes["Spirit"] = archetypes[character.charClass].Attributes[3];
		
		// set primary and secondary weapon based on class
		character.primaryWeaponName = archetypes[character.charClass].Weapon1;
		character.secondaryWeaponName = archetypes[character.charClass].Weapon2;
		
		// set special abilities
		myMoves = myMoves.concat(moveLists[character.charClass]);
		moveLists[character.charClass].forEach(function (specialMove) {
			character.moves.push(specialMove.name);
		});
		//console.log(myMoves[myMoves.length-1]);	
		 
		break;
	case 2:
		character.name = getById("nameField").value;
		completeCharacter();
		console.log("done");
		break;
	case 3:
		//document.body.removeEventListener("click", checkSufficientMoves);
		break;
	case 4:
		break;
	default:
		break;
	}
}

// 2) advance to the next question
function advanceQuestion() {
	choiceNumber++;
	// present choices
	presentChoice(choiceNumber);
}

// 3) present the new question
function presentChoice(choiceN) {
	// clear text
	choiceTextElem.innerHTML = "";
	choiceTextElem.style.display = "none";
	
	// 1 - Class
	if (choiceN == 1) {
		characterClass = createAndDisplayButtonGroup(characterClasses, getById("q1ButtonHolder"), 1);
		promoteToClassChoiceGroup(characterClasses, getById("q1"));
	}
	
	// 2 - Skills - DEACTIVATED
	if (choiceN == 2) {
	/*
	//set primarySkillChoice.selected = result from class selection
	primarySkillChoice.selected = skills[characterClasses.indexOf(characterClass.selected)];
	//set correcponder character attribute
	character.PrimarySkill = primarySkillChoice.selected;
		var excludingPrimary = [];
		skills.forEach(function(skill) {
			if (skill != character.primarySkill) {
				excludingPrimary.push(skill)
			}
		});
		secondarySkillChoice = createAndDisplayButtonGroup(excludingPrimary, getById("q2"));
		
	*/
	}
	
	// 3 Moves - DEACTIVATED
	if (choiceN == 3) {
		// Reset to basic moves
		myMoves = [];
		console.log("moves RESET");
		basicMoves.forEach(function(m) {
			m.basic = true;
			myMoves.push(m);
		});
		//document.body.addEventListener("click", checkSufficientMoves);
		/*listMovesCC(character.charClass);
		window.scroll(0,0);*/
	}
	
	// All choices
		
	// clear previous choice from screen
	if (getById("q"+ (choiceN-1) )) {
		getById("q"+ (choiceN-1) ).style.display = "none";
	}
	// display current choice
	getById("q"+choiceN).style.display = "block";
	// set appropriate title
	getByClass("ccTitle").innerHTML = choiceText[choiceN];

	// reset next button until choice is made
	getById("done").setAttribute("class","incomplete");
	getById("done").setAttribute("disabled", "true");
	
	// Name
	if (choiceN == 2) {
		clearMoves();
		getById("done").setAttribute("class","complete");
		getById("done").removeAttribute("disabled");
	}
}

function createAndDisplayButtonGroup(listIds, container, questionNum) {
		// clear container element
		//container.innerHTML = "";
		// loop through choices and append the buttons
		listIds.forEach(function(id) {
			var choiceBtn = document.createElement("button");
			choiceBtn.setAttribute("id",id);
			choiceBtn.setAttribute("class","choice");
			choiceBtn.innerHTML = id;
			container.appendChild(choiceBtn);
		});	
		// add the buttons to a button group
		return choiceBtnGroup(listIds, questionNum); // return the group object
}

function promoteToClassChoiceGroup(listIds, container) {
	listIds.forEach(function(id) {
		var classButton = getById(id);
		addClass(classButton,"classButton");
		/*
		var classPanel = document.createElement("div");
		classPanel.setAttribute("id",id + " panel");
		classPanel.setAttribute("class","classPanel");
		var classImg = document.createElement("img");
		classImg.setAttribute("id",id + " image");
		classImg.setAttribute("class","classImg");
		classImg.setAttribute("src","images/" + id + ".png");
		
		classPanel.appendChild(classButton);
		classButton.appendChild(classImg);
		container.appendChild(classPanel);*/
	});
}

function deleteDuplicateButtons() {
	if (choiceNumber != 2) {
		// special case for deleting buttons with the same id
		//getById("q"+ (choiceNumber) ).innerHTML = "";
	}
}

function setMyCharacterBox() {
	getByClass("characterName").innerHTML = character.name;
	getByClass("characterClass").innerHTML = character.charClass;
	getByClass("str").innerHTML = character.attributes["Strength"];
	getByClass("agl").innerHTML = character.attributes["Agility"];
	getByClass("int").innerHTML = character.attributes["Intelligence"];
	getByClass("spi").innerHTML = character.attributes["Spirit"];
	getById("primaryWeaponImg").setAttribute("src","images/"+character.primaryWeaponName+".png");
	getById("primaryWeaponName").innerHTML = character.primaryWeaponName;
	getById("primaryWeaponDamage").innerHTML = convertDamageStr(getWeapon(character.primaryWeaponName).damage,1); 
	getById("secondaryWeaponImg").setAttribute("src","images/"+character.secondaryWeaponName+".png");
	getById("secondaryWeaponName").innerHTML = character.secondaryWeaponName;
	getById("secondaryWeaponDamage").innerHTML = convertDamageStr(getWeapon(character.secondaryWeaponName).damage,2);
	getById("defenseStat").innerHTML = archetypes[character.charClass].Defense;
	getById("damageThresholdStat").innerHTML = archetypes[character.charClass].HP;
	getById("characterPicture").setAttribute("src","images/"+character.charClass+".png")
	getByClass("SA").innerHTML = character.skills[skills[0]];
	getByClass("AA").innerHTML = character.skills[skills[1]];
	getByClass("PB").innerHTML = character.skills[skills[2]];
	getByClass("AC").innerHTML = character.skills[skills[3]];
	getByClass("TS").innerHTML = character.skills[skills[4]];
	getByClass("ST").innerHTML = character.skills[skills[5]];
}

function convertDamageStr(damStr, weaponNum) {
	// look for "dX"
	var dieType = "";
	for (var i=4; i<22; i+=2) {
		if (damStr.indexOf("d"+i) > -1) {
			dieType = "d"+i;
			break;
		}
	}
	if (dieType == "") {
		// hide image
		getById("weapon"+weaponNum+"Die").style.display = "none"
	} else {
		// change image
		getById("weapon"+weaponNum+"Die").setAttribute("src","images/"+dieType+".png" );
	}
	
	// look for Strength
	if (damStr.indexOf("Strength") > -1) {
		// replace with value
		return "+"+character.attributes["Strength"];
	}
	return damStr;
}

function completeCharacter() {
	setMyCharacterBox();
	var d = new Date();
	console.log(d.toISOString());
	//document.cookie = 'time=' + d.toISOString() + '; expires=Thu, 18 Dec 2020 12:00:00 UTC';
	character.meta.lastModified = d.toISOString();
	document.cookie = 'character=' + JSON.stringify(character) + '; expires=Thu, 18 Dec 2222 12:00:00 UTC'; 
	var saveMoveNames = [];
	console.log("character save complete");
	character.meta.complete = true;
	removeClass(getById("saveBtn"), "incomplete");
	addClass(getById("saveBtn"), "complete");
}

function checkSufficientMoves() {
	if (choiceNumber > 2) {
		console.log(myMoves.length);
		if (myMoves.length == 2 + basicMoves.length) {
			console.log("complete");
			window.scroll(0,0);
			addClass(getById("done"),"complete");
			getById("done").removeAttribute("disabled");
		}
		else {
			removeClass(getById("done"),"complete");
			getById("done").setAttribute("disabled",true);
		}
	}
}

function showCharacter() {
	dbg.innerHTML = "showCharacter started";
	if (!character.meta.complete) {
		//console.log(character.attributes);
		//console.log(character.meta.complete);
		console.log("incomplete character data");
		return;
	}
	getByClass("myCharacterBox").style.display = "block";
}

var jsonObj;
function loadJSON() {
	jsonObj = JSON.parse(jsonString);
	jsonObj.moves.forEach(function(move) {
		createMoveFromJSON(move);
	});
}

function createMoveFromJSON(m) {
	var newMove = new Move(m.Name, m.Roll, m.AP, m.Effect, m.Range, m.Special, m.Trigger);
	allMoves.push(newMove);
	if (moveLists[m.Class] != null) {
	moveLists[m.Class].push(newMove);
	} else {
	console.log(m.Class + " class could not be identified");
	}
}

function resetCharacter() {
	// Fill character skills
	character.attributes["Strength"] = 0;
	character.attributes["Agility"] = 0;
	character.attributes["Intelligence"] = 0;
	character.attributes["Spirit"] = 0;
	
	character.fightingStyles = {
	"Martial Combat" : 0,
	"One Handed Weapons" : 0,
	"Two Handed Weapons": 0,
	"Throwing Weapons" : 0,
	"Marksmanship" : 0,
	"Magic" : 0,
	}
	character.skills = {
	"Alchemy and Cooking" : 0,
	"Smithing and Appraisal" : 0,
	"Survival and Tracking" : 0,
	"Thievery and Sneaking" : 0,
	"Acrobatics and Athletics" : 0,
	"Performance and Bluff" : 0
	}
}

function loadCharacterFromCookie() {
	for (var i=0; i<cookieList.length; i++) {
		if (cookieList[i].indexOf("character=") > -1) {
			var start = cookieList[i].indexOf("{");
			var end = cookieList[i].length;
			loadCharacterFromString(cookieList[i].substring(start,end));
			break;
		}
	}
}

function loadCharacterFromString(str) {
	character = JSON.parse(str);
	clearScreens();
	hideStartingButtons();
	console.log("Character Loaded");
	setMyCharacterBox();
	completeCharacter();
	// import moves from string
	character.moves.forEach(function(moveName) {
		for (var i=0; i<allMoves.length; i++) {
			if (allMoves[i].name == moveName) {
				//console.log("move loaded: "+moveName);
				myMoves.push(allMoves[i]);
				break;
			}
		}
	});
	dbg.innerHTML = "loadCharacterFromString run";
	//showCharacter();
	enterBattleMode(true);
	window.scroll(0,0);
	//listMyMoves();
}

function setCookieButtonText() {
	// get load button text
		var cName = "";
		var dateString = "";
		for (var i=0; i<cookieList.length; i++) {
			// get characterName
			if (cookieList[i].indexOf("character=") > -1) {
				var end = cookieList[i].length;
				cName = cookieList[i].substring(cookieList[i].indexOf('"name":')+8,end);
				end = cName.indexOf('"');
				cName = cName.substring(0,end); 
				end = cookieList[i].length;
				cookieList[i].indexOf('"lastModified":')
				var start = cookieList[i].indexOf('"lastModified":')+16
				dateString = cookieList[i].substring(start,start + 10);
			}			
		}
		/*console.log(cookieList[0]);
		var tempStr = cookieList[0];
		var end = tempStr.length;
		className = tempStr.substring(tempStr.indexOf('"charClass":')+13,end);
		end = className.indexOf('"');
		className = className.substring(0,end); 
		end = tempStr.length;
		tempStr.indexOf('"lastModified":')
		var start = tempStr.indexOf('"lastModified":')+16
		dateString = tempStr.substring(start,start + 10);
		getById("cookieLoadBtn").innerHTML = className + " on " + dateString;
		*/
		getById("cookieLoadBtn").innerHTML = cName + " on " + dateString;
		if (cName == "") {
			 getById("cookieLoadBtn").innerHTML = "Browser does not have any character data";
		}
}

function loadCookies() {
	cookieList = [];
	//console.log("COOKIE TEXT\n********************\n" + document.cookie);
	if (document.cookie != "" && document.cookie != null) {
		var startInagl = 0;
		// load cookies
		for (var i=0; i<document.cookie.length; i++) {
			if (document.cookie[i] == ";") {
				//console.log("end of cookie found");
				cookieList.push(document.cookie.substring(startInagl,i));
				startInagl = i+1;
			}
		}
		// last cookie may not have semicolon
		if (startInagl+1 < document.cookie.length) {
			cookieList.push(document.cookie.substring(startInagl,document.cookie.length));
		}
	}
	// hide intro if cookie found
	if (cookieList.length > 0) getById("intro").style.display = "none";
}

function mobileDebug(enabled) {
	if (enabled) {
		window.onerror = function(errorMsg, url, linenumber) { handleErrorMobile(errorMsg, url, linenumber); };
	} else {
		dbg.style.display = "none";
	}
}

function handleErrorMobile(errorMsg, url, linenumber) {
	dbg.style.display = "block";
	dbg.innerHTML = dbg.innerHTML + "<br>"
	+ errorMsg + ", " + url + ", line# " + linenumber;
}

function setupCharacterExport() {
	var saveMoveNames = [];
	myMoves.forEach(function(m) {
		saveMoveNames.push(m.name);
	});
	getById("saveArea").style.display = "block";
	getById("saveText").innerHTML = JSON.stringify(character);
}

function clipboardCopyCharacterText() {
	var text = document.querySelector('#saveText');
	if (document.body.createTextRange) { // ms
		var range = doc.body.createTextRange();
		range.moveToElementText(text);
		range.select();
	} else if (window.getSelection) { // moz, opera, webkit
		var selection = window.getSelection();            
		var range = document.createRange();
		range.selectNodeContents(text);
		selection.removeAllRanges();
		selection.addRange(range);
	} else {
		var textField = document.createElement('textarea');
		textField.innerText = text.innerHTML;
		document.body.appendChild(textField);
		textField.select();
		document.execCommand('copy');
		textField.remove();
	}
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Copying text command was ' + msg);
	} catch (err) {
		console.log('Oops, unable to copy');
	}
}

function setScreenString(screenString) {
	prevScreen = currScreen;
	currScreen = screenString;
	removeClass(getByClass("backButton"),"backDisabled");
	backDisabled = false;
}

function goBackToPrevScreen() {
	showScreen(prevScreen);
	addClass(getByClass("backButton"),"backDisabled");
	backDisabled = true;
}

function showScreen(screenString) {
	window.scroll(0,0);
	clearScreens();
	switch(screenString) {
		case "Main Menu":
			getById("mainMenu").style.display = "block";
			break;
		case "Help":
			retractMenu();
			clearScreens();
			getByClass("helpBox").style.display = "block";
			setScreenString("Help");
			break;
		case "Character":
			setMyCharacterBox()
			showCharacter();
			listMyMoves();
			setScreenString("Character");
			break;
		case "All Moves":
			retractMenu();
			clearScreens();
			listMoves("moves");
			setScreenString("All Moves");
			break;
		case "About":
			clearScreens();
			getById("aboutSection").style.display = "block";
			setScreenString("About");
			break;
		case "Character Creation":
			getByClass("characterCreationBox").style.display = "block";
			//getByClass("helpfulHint").style.display = "block";
			presentChoice(choiceNumber);
			hideStartingButtons();
			setScreenString("Character Creation");
			break;
		case "Import":
			hideStartingButtons();
			showLoadingButtons();
			setScreenString("Import");
			break;
		case "Export":
			clearScreens();
			setupCharacterExport();
			setScreenString("Export");
			break;
		case "Combat Example":
			clearScreens();
			getByClass("helpBox").style.display = "block";
			window.scroll(0,0);
			getById("combatExampleH").scrollIntoView(true);
			/*window.scroll(0,6500);*/
			setScreenString("Combat Example");
			break;
		case "Quick Reference":
			clearScreens();
			getByClass("helpBox").style.display = "block";
			window.scroll(0,0);
			getById("quickReference").scrollIntoView(true);
			setScreenString("Quick Reference");
			break;
		case "Battle":
			clearScreens();
			getByClass("battleContainer").style.display = "block";
			window.scroll(0,0);
			setScreenString("Battle");
			break;
	}
}

function startCharacterCreation() {
	clearScreens();
	resetCharacter()
	getByClass("characterCreationBox").style.display = "block";
	//getByClass("helpfulHint").style.display = "block";
	presentChoice(choiceNumber);
	hideStartingButtons();
	setScreenString("Character Creation");
}

// display definition
function d(term) {
	var definitionObject = null;
	if (keywords[term] != null) {
		definitionObject = glossary[keywords[term]];
	}
	else {
		glossary.forEach(function(defObj) {
			if (definitionObject == null) {
			if (defObj.Term.toLowerCase() == term.toLowerCase()) {
				definitionObject = defObj;
				//console.log(defObj.Definition);
			}
			}
			/*defObj.Tags.forEach(function(synonym) {
				if (synonym.toLowerCase() == term.toLowerCase()) {
					console.log(defObj.Definition);
				}
			});*/
		});
	}
	if (!definitionObject) { 
		console.log("could not find " + term); 
		return; 
	}
	
	// update history
	glossaryHistory.push(definitionObject.Term);
	
	// set header
	defBox.querySelector(".definitionHeader").innerHTML = definitionObject.Term;
	
	// set body
	defBox.querySelector("p").innerHTML = parseKeywords(definitionObject.Definition);
	showDefinitionBox();
}

/*function activateKeywords() {
	var keywordElements = document.querySelectorAll(".keyword");
	console.log(keywordElements[0]);
	for (var i=0; i<keywordElements.length; i++) {
		var temp = keywordElements.item(i).innerHTML;
		keywordElements.item(i).onclick = function() { d(temp); }
	};
}*/

// returns keyword elements in strings containing keywords
function parseKeywords(htmlString) {
	// create a string to hold the result
	var newString = htmlString;
	// loop through keywords and variants
	glossary.forEach(function(defObj) {
		newString = parseKeywordsHelper(newString,defObj);
	});
	
	// return parsed string
	return newString;
}

// loops through list of synonyms, returns parsed string
function parseKeywordsHelper(htmlString,defObj) {
	// null case
	if (htmlString == null || htmlString == "" || defObj == null) {
		//console.log("this is a test to see that the recursion is working");
		return "";
	}
	
	var lowerString = htmlString.toLowerCase();
	
	// create a string to return the value 
	var newString = htmlString;
	
	var cont = true;
	var j = 0;
	if (j>=defObj.Tags.length) { cont=false; }
	while (cont) {
		// kill loop if next index is out of range
		if (j>=defObj.Tags.length-1) { cont=false; }
		// run once per tag
		var tag = defObj.Tags[j];
		//console.log("j: " + j);
		//console.log(defObj.Tags[j]);
		var keyIndex = lowerString.indexOf(tag.toLowerCase());
		
		// if the term is found
		if (keyIndex >= 0) {
			newString = parseKeywordRec(newString,tag);
		}
		j++;
	}
	
	// return parsed string with keywords linked
	return newString;
}

// recurses and returns parsed string
function parseKeywordRec(htmlString, tag) {
	// null case
	if (htmlString == null || htmlString == "" || tag == null) {
		return "";
	}
	// lower
	var lowerString = htmlString.toLowerCase();
	// get index
	var keyIndex = lowerString.indexOf(tag.toLowerCase());
	// if the term is found
	if (keyIndex >= 0) {
		// check to see if the keyword is valid
		if (validKeyword(htmlString, tag, keyIndex)) {
			// parse before keyword
			var firstPart = 
			parseKeywordRec(
				htmlString.substring(
					0,
					keyIndex),tag
			);
	
			// add keyword class
			var keyword = "<span class='keyword' onclick='d(\""+tag+"\")'>" 
			+ htmlString.substring(keyIndex,keyIndex+tag.length) 
			+ "</span>";
	
			// onclick links to glossary
			// --- todo ---
	
			// parse after keyword
			var lastPart = 
			parseKeywordRec(
				htmlString.substring(
					keyIndex+tag.length,
					htmlString.length),tag
			);
	
			// since the keyword was found, 
			return firstPart + keyword + lastPart;
		}
	}
	return htmlString;
}

// helper for parsing keywords
function validKeyword(str, kWord, idx) {
	if (idx > 0) {
		// check if the prev char is allowed
		var prevChar = str.substring(idx-1,idx);
		// if it is in the alphabet, return false
		if ("A" < prevChar && prevChar < "z") return false;
		// if it is a hyphen, return false
		if (prevChar == "-") return false;
	}
	var end = idx + kWord.length;
	if (end < str.length-2) {
		// check if the next char is in the alphabet
		var nextChar = str.substring(end,end+1);
		// if it is, perform more tests (plurals)
		if ("A" < nextChar && nextChar < "z") {
			// simple plural
			if (nextChar == "s") return true;
			// "es" plural
			if (nextChar == "e" && end < str.length-3) {
				if (str.substring(end,end+2) == "es") return true;
			}
			// otherwise return false
			return false;
		}
	}
	return true;
}

// uses the glossary to fill the data structure
function populateKeywords() {
	var n=0; 
	glossary.forEach(function(kWord) {
		for (k=0; k<kWord.Tags.length; k++) {
		
			keywords[kWord.Tags[k]] = n;
		}
		n++;
	});
}

// enterBattleMode moved to battle.js

function setHP(val) {
	HP = val;
	//getByClass("HPCounter").innerHTML = HP + " HP";
}

function DieImgElem(typeStr) {
	/*var dieImg = document.createElement("img");
	dieImg.style.width = "1.2em";
	dieImg.style.height = "1.2em";
	dieImg.style.verticalAlign = "bottom";*/
	// display black if no type
	var src = "";
	if (typeStr == null) {
		//dieImg.src = "images/perspective-dice-six-faces-six.png"
		src = "images/perspective-dice-six-faces-six.png"
	}
	// red if attack
	if (typeStr == "attack") {
		//dieImg.src = "images/attackdie.png";
		src = "images/attackdie.png";
	}
	// blue if defense
	if (typeStr == "defense") {
		//dieImg.src = "images/defensedie.png";
		src = "images/defensedie.png";
	}
	/*console.log(""+dieImg.outerHTML);*/
	return '<img src="'+src+'" class="dieSize2">';
}


window.onbeforeunload = function() { return "Are you sure you want to leave? All unsaved progress will be lost."; }

window.onload = init();