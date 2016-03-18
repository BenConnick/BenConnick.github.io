// Move class
function Move(name, roll, AP, effect, range, special, trigger, difficulty) {
	this.name = name;
	this.roll = roll;
	this.AP = AP;
	this.effect = effect;
	this.range = range;
	this.special = special;
	this.added = false;
	if (!trigger) {
		trigger = "";
	}
	this.trigger = trigger;
	this.difficulty = difficulty;
}

// GLOBAL VARS
var dbg = getById("mobileDebug");
var allMoves = [];
var myMoves = [];
var basicMoves = []; 
var slayerMoves = [];
var defenderMoves = [];
var scholarMoves = [];
var battlemageMoves = [];
var assasinMoves = [];
var hunterMoves = [];
var currScreen = "Main Menu";
var prevScreen = "";
var backDisabled = true;
var glossary = JSON.parse(glossaryString).glossary;
var keywords = {};
var glossaryHistory = [];
var glossaryForward = [];
var collapserObjects = {};

var choiceDescriptions = {
	"Slayer" : "<br><img src='images/Slayer.png' class='classPic'/><br>The Slayer is a monster specialist. Tough and damage-focused.",
	"Defender" : "<br><img src='images/Defender.png' class='classPic'/><br>The Defender is a professional soldier. Battle hardened and team-focused.",
	"Battlemage" : "<br><img src='images/Battlemage.png' class='classPic'/><br>The Battlemage is an expert on combat-magic. Powerful and control-focused.",
	"Scholar" : "<br><img src='images/Scholar.png' class='classPic'/><br>The Scholar is a learned arcane master. Intelligent and tactics-focused.",
	"Assassin" : "<br><img src='images/Assassin.png' class='classPic'/><br>The Assassin is a contract killer. Ruthless and target-focused.",
	"Hunter" : "<br><img src='images/Hunter.png' class='classPic'/><br>The Hunter is a master of thriving in nature. Keen and trap-focused.",
	"Smithing and Appraisal" : "Smithing allows you to craft weapons, armor, and other objects out of metal, given a proper forge.  Appraisal allows you to judge the proper value for an item, particularly weapons, armor, jewelry, and other treasure.",
	"Acrobatics and Athletics" : "Acrobatics allows you to perform daunting acts with your body, like walking on a thin ledge or performing a flip. Athletics allows you to perform feats of strength such as running long distances and carrying heavy objects.",
	"Performance and Bluff" : "Performance allows you to play instruments, give a persuasive argument, or give a rousing speech. Bluff allows you to tell convincing lies, or convincingly fake an identity",
	"Alchemy and Cooking" : "Alchemy allows you craft useful potions. Cooking allows you to cook delicious meals and prepare rare or dangerous dishes.",
	"Thievery and Sneaking" : "Thievery allows you to successfully steal things without getting notice. Sneaking allows you to hide in difficult places and to move without making noise. Some characters get advantages for being hidden in combat.",
	"Survival and Tracking" : "Survival allows you to make shelters, locate water, and other skills you would need to survive outside of civilization. Tracking allows you to find animals in their habitats, or to follow a person or creature using only their tracks."
}
var character = {}; // character object, stores attributes and skills
character.name = "Anonymous";
character.attributes = { "Strength" : 0, "Agility" : 0, "Intelligence" : 0, "Spirit" : 0 };
character.fightingStyles = {}; // these are filled out later
character.skills = {}; // these are filled out later
character.moves = [];
character.meta = {"complete": false, "lastModified" : "never"};
var cookieList = [];
var HP = 10;
var AP = 10;
var maxAP = 10;
var classInagl=0;
var choiceText = [
	"Create a Character",
	"Choose your <span class='keyword' onclick='d(\"Archetype\")'>archetype</span>",
	"Choose your skills",
	"Choose exactly four (4) abilities",
	"Choose a name"
];
character.charClass = "none";
var primaryFightingStyleChoice;
character.primaryFightingStyle = "none";
var secondaryFightingStyleChoice;
character.secondaryFightingStyle = "none";
var primarySkillChoice;
character.primarySkill = "none";
var secondarySkillChoice;
character.secondarySkillChoice = "none";
var fightingStyles = [
"Martial Combat",
"One Handed Weapons",
"Two Handed Weapons",
"Throwing Weapons",
"Marksmanship",
"Magic"
];
var skills = [
"Smithing and Appraisal",
"Acrobatics and Athletics",
"Performance and Bluff",
"Alchemy and Cooking",
"Thievery and Sneaking",
"Survival and Tracking"
];
var characterClasses = [
"Slayer", 
"Defender",	
"Scholar", 
"Battlemage", 
"Assassin", 
"Hunter"
];
/*var phyOrMen = choiceBtnGroup(["physicalBtn","mentalBtn"]);
var strOrAgl = choiceBtnGroup(["agilityBtn","strengthBtn"]);
var intOrSpi = choiceBtnGroup(["intelligenceBtn","spiritBtn"]);*/
var primarySkillChoice = {};
var choiceNumber = 1;
var lastChoice = 4;
var bottomTimeout;
var choiceTextElem = getById("choiceDescriptionText");
var defBox = getByClass("definitionBox");

var weaponDefaults = {
	"Martial Combat" : "Fists",
	"One Handed Weapons" : "Shortsword",
	"Two Handed Weapons" : "Battleaxe",
	"Throwing Weapons" : "Throwing-Knives",
	"Marksmanship" : "Longbow",
	"Magic" : "Staff"
};
/*var weapon1Defaults = {
	"Slayer" : "Battleaxe",
	"Defender" : "Longsword",
	"Scholar" : "Staff",
	"Battlemage" : "Staff",
	"Assassin" : "Shortsword",
	"Hunter": "Longbow"
}
var weapon2Defaults = {
	"Slayer" : "Longbow",
	"Defender" : "Throwing-Spears",
	"Scholar" : "Throwing-Knives",
	"Battlemage" : "Throwing-Knives",
	"Assassin" : "Throwing-Knives",
	"Hunter": "Shortsword"
}
var attributeDefaults = {
	"Slayer" : [5,4,4,3],
	"Defender" : [4,5,3,4],
	"Scholar" : [4,4,5,3],
	"Battlemage" : [3,4,5,4],
	"Assassin" : [4,5,4,3],
	"Hunter": [4,5,4,3]
}*/
var archetypes = {
	"Slayer" : 
	{
		"Weapon1" : "Battleaxe",
		"Weapon2" : "Longbow",
		"Attributes" : [6,4,4,2],
		"Attack" : 5,
		"Defense" : 3,
		"HP" : 15
	},
	"Defender" : 
	{
		"Weapon1" : "Longsword",
		"Weapon2" : "Buckler-Shield",
		"Attributes" : [5,5,2,4],
		"Attack" : 4,
		"Defense" : 4,
		"HP" : 16
	},
	"Scholar" : 
	{
		"Weapon1" : "Staff",
		"Weapon2" : "Throwing-Knives",
		"Attributes" : [2,4,7,6],
		"Attack" : 3,
		"Defense" : 2,
		"HP" : 12
	},
	"Battlemage" : 
	{
		"Weapon1" : "Staff",
		"Weapon2" : "Throwing-Knives",
		"Attributes" : [2,4,6,4],
		"Attack" : 3,
		"Defense" : 2,
		"HP" : 13
	},
	"Assassin" : 
	{
		"Weapon1" : "Shortsword",
		"Weapon2" : "Throwing-Knives",
		"Attributes" : [4,6,4,2],
		"Attack" : 6,
		"Defense" : 2,
		"HP" : 14
	},
	"Hunter": 
	{
		"Weapon1" : "Longbow",
		"Weapon2" : "Shortsword",
		"Attributes" : [4,6,4,2],
		"Attack" : 5,
		"Defense" : 2,
		"HP" : 13
	}
}

function Weapon(nameArg, damageArg, APArg, bonusArg, typeArg, specialArg) {
	this.name = nameArg;
	this.AP = APArg;
	this.bonus = bonusArg;
	this.damage = damageArg;
	this.type = typeArg;
	this.special = specialArg;
	this.print = function() {
		return this.name + ": " + this.damage + " " + this.type + " damage, " + this.AP + " AP drain, " + this.bonus + " bonus attack, special:" + this.special;
	}; 
}

var weapons = [];
weapons.push(new Weapon("Fists","d4 + Strength","-1",0,"melee",""));
weapons.push(new Weapon("Shortsword","d6 + Strength","+0",1,"melee",""));
weapons.push(new Weapon("Battleaxe","d12 + Strength","+1",0,"melee",""));
weapons.push(new Weapon("Throwing-Knives","d4 + Strength","+0",0,"ranged",""));
weapons.push(new Weapon("Longbow","d6 + Strength","+0",0,"ranged",""));
weapons.push(new Weapon("Crossbow","6","+0",0,"ranged",""));
weapons.push(new Weapon("Staff","d4 + Strength","+0",0,"melee","Magic +1"));
weapons.push(new Weapon("Longsword","d8 + Strength","+0",0,"melee",""));
weapons.push(new Weapon("Throwing-Spears","d6 + Strength","+0",0,"ranged",""));
weapons.push(new Weapon("Buckler-Shield","0","+0",0,"melee",""));

var moveLists = { 
"moves" : allMoves, 
"myMoves" : myMoves,
"basic" : basicMoves, 
"Slayer" : slayerMoves, 
"Defender" : defenderMoves, 
"Scholar" : scholarMoves, 
"Battlemage" : battlemageMoves, 
"Assassin" : assasinMoves, 
"Hunter" : hunterMoves 
}

// Basic moves
basicMoves.push(new Move(
	"Move",
	"",
	1,
	"Move one space",
	"",
	""
	)
);
basicMoves.push(new Move(
	"Basic Melee Attack",
	"Agility",
	4,
	"|Weapon||d|",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Basic Ranged Attack",
	"Agility",
	5,
	"|Weapon||d|",
	"Long",
	"",
	"",
	"Short-range: 3|d|, Medium-range: 2|d|, Long-range: 1|d|"
	)
);
basicMoves.push(new Move(
	"Full Melee Attack",
	"Agility",
	6,
	"",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Trip",
	"Agility",
	5,
	"Target tests agility against you. If they lose, they gain the Prone status",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Mark",
	"",
	2,
	"You sign a marked sigil in the air. One target gains the Marked status",
	"Sight",
	""
	)
);
basicMoves.push(new Move(
	"Evade",
	"",
	0,
	"Roll |Defense||d|",
	"",
	"Reaction",
	"You are attacked at touch range"
	)
);
basicMoves.push(new Move(
	"Parry",
	"",
	1,
	"Roll |Defense + 2||d|",
	"",
	"Reaction",
	"You are attacked at touch range"
	)
);

// Mark basic moves
basicMoves.forEach(function(m) {
	m.basic = true;
	myMoves.push(m);
	allMoves.push(m);
});

function getWeapon(name) {
	for (var i=0; i<weapons.length; i++) {
		if (weapons[i].name == name) {
			return weapons[i];
		}
	}
	// if none
	return weapons[0];
}

function createUseButton(moveObject) {
	var useBtn = document.createElement("button");
	useBtn.setAttribute("class","useBtn");
	useBtn.innerHTML = "use (" + moveObject.AP + " AP)";
	useBtn.onclick = function() {
		useAbility(moveObject);
	}
	return useBtn;
}

function removeUseButtons(containerElem) {
	var UseButtons = containerElem.querySelectorAll(".useBtn");
	for (var j=0; j<UseButtons.length; j++) {
		UseButtons[j].parentNode.removeChild(UseButtons[j]);
	}
}

var addText = 'Add to <span style="font-weight: bold">My Moves</span>';
var removeText = 'Added';
var useText = 'Use';
var buttonText = addText;

function displayMove(move) {
	displayMove(move,true,document.body);
}

function displayMove(move, hideButton) {
	displayMove(move, hideButton, document.body);
}

var abilityBoxUniqueId = 0;
function displayMove(move, hideButton, containerElem) {
	if (containerElem == null) { containerElem = document.body; }
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
	parseKeywords(rollStr) + diffStr +
	// Reaction Trigger
	parseKeywords(triggerStr) +
	// Effect
	'<div class="categoryLabel">'+special+'</div>'+
	'<div>'+parseKeywords(parsePlaceholders(move.effect))+'</div>'+
	// Range
	parseKeywords(rangeStr);

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

function replacePlaceHolder(ph) {
	var placeholderLowerCase = ph.toLowerCase();
	switch(placeholderLowerCase) {
		case "|d|" : return new DieImgElem().outerHTML; break;
		case "|strength|" : return character.attributes["Strength"]; break;
		case "|agility|" : return character.attributes["Agility"]; break;
		case "|intelligence|" : return character.attributes["Intelligence"]; break;
		case "|spirit|" : return character.attributes["Spirit"]; break;
		case "|weapon|" : return getWeapon(character.primaryWeaponName).damage; break;
		case "|defense|" : return archetypes[character.charClass].Defense; break;
	}
}

function parsePlaceholders(str) {
	var beginIdx = -1;
	var foundPlaceholder = false;
	for (var i=0; i<str.length; i++) {
		if (foundPlaceholder) {
			if (str[i] == "|") {
				var phStr = str.substring(beginIdx,i+1);
				str = str.replace(phStr,replacePlaceHolder(phStr));
				console.log("replaced " + phStr + " with " + replacePlaceHolder(phStr));
				foundPlaceholder = false;
			}
		}
		else {
			if (str[i] == "|") {
				beginIdx = i;
				foundPlaceholder = true;
			}
		}
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

function listMyMoves() {
	//console.log("listMoves " + myMoves + " " + myMoves.length);
	for (var i=0; i<myMoves.length; i++) {
		displayMove(myMoves[i]);
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

function getByClass(className) {
	return document.querySelector("."+className);
}
function getById(id) {
	return document.getElementById(id);
}

function resetAP() {
	setAP(maxAP);
}
function setAP(value) {
	AP = value;
	getByClass("APCounter").innerHTML = "" + AP + "AP";
	getByClass("BBAPCounter").innerHTML = "" + AP + " AP";
}
function addToAP(arg) {
	setAP(AP + arg);
}
function extendMenu() {
	getByClass("topBar").style.top = "-28em";
	getByClass("optionsBtn").style.display = "none";
	getByClass("hideBtn").style.display = "block";
}
function retractMenu() {
	getByClass("topBar").style.top = "-51em";
	/*getByClass("hideBtn").style.display = "none";
	getByClass("optionsBtn").style.display = "block";*/
}
function extendUseBox() {
	getByClass("bottomBar").style.bottom = "-4em";
	clearTimeout(bottomTimeout);    	
	bottomTimeout = setTimeout(function() {
		retractUseBox();
	},9000);
}
function retractUseBox() {
	getByClass("bottomBar").style.bottom = "-11em";
}

function hasClass(ele,cls) {
  return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
  if (!hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
  if (hasClass(ele,cls)) {
	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
	ele.className=ele.className.replace(reg,' ');
  }
}

function choiceBtnGroup(buttonIdList, questionNum) {
	var groupObject = {};
	groupObject.selected = "none";
	buttonIdList.forEach(function(buttonName) {
		var cbtn = getById(buttonName);
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
				choiceTextElem.innerHTML = choiceDescriptions[buttonName];
				choiceTextElem.style.display = "block";
			} 
			else {
				choiceTextElem.innerHTML = "";
				choiceTextElem.style.display = "none";
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
		
		break;
	case 2:
		break;
	case 3:
		document.body.removeEventListener("click", checkSufficientMoves);
		break;
	case 4:
		character.name = getById("nameField").value;
		completeCharacter();
		console.log("done");
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
		characterClass = createAndDisplayButtonGroup(characterClasses, getById("q1"));
		promoteToClassChoiceGroup(characterClasses, getById("q1"));
	}
	
	// 2 - Skills
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
	
	// 3 Moves
	if (choiceN == 3) {
		// Reset to basic moves
		myMoves = [];
		console.log("moves RESET");
		basicMoves.forEach(function(m) {
			m.basic = true;
			myMoves.push(m);
		});
		document.body.addEventListener("click", checkSufficientMoves);
		listMovesCC(character.charClass);
		window.scroll(0,0);
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
	if (choiceN == 4) {
		clearMoves();
		getById("done").setAttribute("class","complete");
		getById("done").removeAttribute("disabled");
	}
	if (choiceN == 2) {
		//getById("done").setAttribute("class","complete");
		//getById("done").removeAttribute("disabled");
		advanceQuestion();
	}
}

function createAndDisplayButtonGroup(listIds, container) {
		// clear container element
		container.innerHTML = "";
		// loop through choices and append the buttons
		listIds.forEach(function(id) {
			var choiceBtn = document.createElement("button");
			choiceBtn.setAttribute("id",id);
			choiceBtn.setAttribute("class","choice");
			choiceBtn.innerHTML = id;
			container.appendChild(choiceBtn);
		});	
		// add the buttons to a button group
		return choiceBtnGroup(listIds); // return the group object
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
	if (choiceNumber > 1 && choiceNumber < 4) {
		// special case for deleting buttons with the same id
		getById("q"+ (choiceNumber) ).innerHTML = "";
	}
}

function closeCreator() {
	getByClass("characterCreationBox").style.display = "none";
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
	document.cookie = 'character=' + JSON.stringify(character) + '; expires=Thu, 18 Dec 2020 12:00:00 UTC'; 
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

function hideStartingButtons() {
	getById("mainMenu").style.display = "none";
}

function showLoadingButtons() {
	getById("loadButtons").style.display = "block";
}

function hideLoadingButtons() {
	getById("loadButtons").style.display = "none";
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
				myMoves.push(allMoves[i]);
				break;
			}
		}
	});
	dbg.innerHTML = "loadCharacterFromString run";
	showCharacter();
	listMyMoves();
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
	console.log("COOKIE TEXT\n********************\n" + document.cookie);
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
	
	// check
	var cont = true;
	var j = 0;
	if (j>=defObj.Tags.length) { cont=false; }
	while (cont) {
		// kill loop if out of range
		if (j>=defObj.Tags.length-1) { cont=false; }
		var tag = defObj.Tags[j];
		//console.log("j: " + j);
		//console.log(defObj.Tags[j]);
		var keyIndex = lowerString.indexOf(tag.toLowerCase());
		if (tag == "Marked") console.log('"Marked" found? '+keyIndex);
		// if the term is found
		if (keyIndex >= 0) {
			cont = false;
			return parseKeywordRec(htmlString,tag);
		}
		j++;
	}
	
	// default case
	return htmlString;
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

function validKeyword(str, kWord, idx) {
	if (idx > 0) {
		// check if the prev char is in the alphabet
		var prevChar = str.substring(idx-1,idx);
		// if it is, return false
		if ("A" < prevChar && prevChar < "z") {
			return false;
		}
	}
	var end = idx + kWord.length;
	if (end < str.length-2) {
		// check if the next char is in the alphabet
		var nextChar = str.substring(end,end+1);
		// if it is, perform more tests (plurals)
		if ("A" < nextChar && nextChar < "z") {
			// simple plural
			if (nextChar == "s") {
				return true;
			}
			// "es" plural
			if (nextChar == "e" && end < str.length-3) {
				if (str.substring(end,end+2) == "es") {
					return true;
				}
			}
			// otherwise return false
			return false;
		}
	}
	return true;
}

function showDefinitionBox() {
	defBox.style.bottom = "-2em";
}

function hideDefinitionBox() {
	defBox.querySelector("p").innerHTML = "";
	defBox.style.bottom = "-150%";
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

var turn;
// activates the battle mode
function enterBattleMode(myTurn) {
	if (myTurn) {
		setAP(5);
	} else {
		setAP(10);
	}
	setHP(archetypes[character.charClass].HP);
	turn = myTurn;
	getByClass("battleHUD").style.display = "block";
	getByClass("initiativeButtons").style.display = "none";
}

function setHP(val) {
	HP = val;
	getByClass("HPCounter").innerHTML = HP + " HP";
}

function Collapser(container, clickElem, innerElem) {
	this.uniqueId = container.id;
	this.container = container;
	this.clickElem = clickElem;
	this.innerElem = innerElem;
	this.expanded = false;
	this.toggle = function() {
		if (this.expanded) {
			window.scrollBy(0,-1*innerElem.clientHeight);
			this.expanded = false;
			this.innerElem.style.height = '0'
			this.innerElem.style.overflow = "hidden";
		} else {
			this.innerElem.style.height = 'auto'
			this.expanded = true;
			window.scrollBy(0,innerElem.clientHeight);
		}
	}
	this.clickElem.onclick = function(event) {
		console.log(event.currentTarget.id);
		collapserObjects[event.currentTarget.id].toggle();
	}
}

function DieImgElem(typeStr) {
	var dieImg = document.createElement("img");
	dieImg.style.width = "1.5em";
	dieImg.style.height = "1.5em";
	dieImg.style.verticalAlign = "bottom";
	// display black if no type
	if (typeStr == null) {
		dieImg.src = "images/perspective-dice-six-faces-six.png"
	}
	// red if attack
	if (typeStr == "attack") {
		dieImg.src = "images/attackdie.png";
	}
	// blue if defense
	if (typeStr == "defense") {
		dieImg.src = "images/defensedie.png";
	}
	return dieImg;
}

// on clicks
getById("intro").onclick = function() {
	getById("intro").style.display = "none";
}

getByClass("characterBtn").onclick = function() {
	retractMenu();
	showScreen("Character");
};
getByClass("helpBtn").onclick = function() {
	retractMenu();
	showScreen("Help");
};
getByClass("mainMenuBtn").onclick = function() {
	retractMenu();
	showScreen("Main Menu");
};
getByClass("allMovesBtn").onclick = function() {
	retractMenu();
	showScreen("All Moves");
};
getByClass("resetBtn").onclick = function () {
	resetAP();
};
getByClass("plusOneBtn").onclick = function () {
	addToAP(1);
};
getByClass("minusOneBtn").onclick = function () {
	addToAP(-1);
};
getByClass("bottomBar").onclick = function () {
	retractUseBox();
};
getByClass("optionsBtn").onclick = function() {
	extendMenu();
};
getByClass("threeBars").onclick = function() {
	extendMenu();
};
getByClass("hideBtn").onclick = function() {
	retractMenu();
};
getByClass("backButton").onclick = function() {
	goBackToPrevScreen();
}
getById("aboutBtn").onclick = function() {
	clearScreens();
	showScreen("About");
};
getById("loadBtn").onclick = function() {
	showScreen("Import");
};
getById("textLoadBtn").onclick = function() {
	hideLoadingButtons();
	//console.log(document.querySelector("textarea").value);
	loadCharacterFromString(document.querySelector("textarea").value);
};
getById("cookieLoadBtn").onclick = function() {
	hideLoadingButtons();
	loadCharacterFromCookie();
};
getById("done").onclick = function() {
	deleteDuplicateButtons();
	addToCharacter();
	if (choiceNumber >= lastChoice) {
		closeCreator();
		clearMoves();
		showCharacter();
		listMyMoves();
		return;
	}
	advanceQuestion();	
};
getById("ccStartBtn").onclick = function() {
	startCharacterCreation();
};
getById("saveBtn").onclick = function() {
	showScreen("Export");
};
getById("clipboardBtn").onclick = function() {
	clipboardCopyCharacterText();
};
getById("helpLink").onclick = function() {
	clearScreens();
	getByClass("helpBox").style.display = "block";
	window.scroll(0,0);
	setScreenString("Help");
};
getById("combatExampleLink").onclick = function() {
	showScreen("Combat Example");
};
getById("quickReferenceLink").onclick = function() {
	showScreen("Quick Reference");
};
getById("closeDefBox").onclick = function() {
	hideDefinitionBox();
}
getById("defBack").onclick = function() {
	// if there are entries
	if (glossaryHistory.length > 1) {
		glossaryForward.push(glossaryHistory.pop()); // move from back to forward
		d(glossaryHistory.pop()); // this adds to history
	}
}
getById("defFwd").onclick = function() {
	// if there are entries
	if (glossaryForward.length > 0) {
		d(glossaryForward.pop()); // this adds to history
	}
}
getById("IAttack").onclick = function() {
	enterBattleMode(true);
}
getById("GotAttacked").onclick = function() {
	enterBattleMode(false);
}
getById("HPplus").onclick = function() {
	setHP(HP+1);
}
getById("HPminus").onclick = function() {
	setHP(HP-1);
}
getById("NextTurn").onclick = function() {
	var newAP = AP + 5;
	if (newAP > maxAP) { newAP = maxAP; }
	setAP(newAP);
}

window.onbeforeunload = function() { return "Are you sure you want to leave? All unsaved progress will be lost."; }

function init() {
	mobileDebug(true);
	loadJSON();
	loadCookies();
	setCookieButtonText();
	clearMoves();
	populateKeywords();
}

window.onload = init();