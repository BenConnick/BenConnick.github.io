var battleCountainer
var advancedCollapser;
var specialCollapser;
var turn;
var attackValue;
var bigDefendBox;
var defendBox;
var hpBar;
var hpNum;
var maxHP;
var moveBox;
var attackBox;
var characterBox;
var moveContainer;
var basic;
var advanced;
var special;

// activates the battle mode
function enterBattleMode(myTurn) {
	// get DOM element references
	moveContainer = getByClass("super");
	basic = getByClass("attackAndMove");
	attackValue = getById("attackValue");
	hpBar = getByClass("HPBar");
	hpNum = getByClass("HPText");
	bigDefendBox = getById("bbBigDefend");
	defendBox = getById("bbDefend");
	moveBox = getById("bbMove");
	attackBox = getById("bbAttack");
	characterBox = getById("bbCharacter");
	battleContainer = getByClass("battleContainer");
	
	// show the battle screen
	showScreen("Battle");
	// set ap to maxAP
	setAP(maxAP);
	// set hp to character's current hp
	maxHP = archetypes[character.charClass].HP;
	setHP(maxHP);
	// start on the character's turn
	turn = myTurn;
	// set name
	getByClass("battleName").innerHTML = character.name;
	// first weapon
	getByClass("selectedWeaponImg").style.backgroundImage = 'url("images/'+character.primaryWeaponName+'.png")';
	// first weapon damage value
	attackValue.innerHTML = getWeapon(character.primaryWeaponName).damage;
	// clear inner box this doesn't work because there are not the inner elements where moves are stored
	//basic.innerHTML = advanced.innerHTML = special.innerHTML = "";
	// set basic attack based on first weapon
	if (getWeapon(character.primaryWeaponName).range == "touch") {
		// melee
		//displayMove(basicMoves[1],true,moveContainer.getElementsByClassName("attackAndMove")[0]);
	} else {
		// ranged
		//displayMove(basicMoves[2],true,moveContainer.getElementsByClassName("attackAndMove")[0]);
	}
	// add move ability
	//displayMove(basicMoves[0],true,moveContainer.getElementsByClassName("attackAndMove")[0]);
	// set character portrait
	getByClass("battleCharacterImg").style.backgroundImage = 'url("images/'+character.charClass+'.png")';
	// set weapon selector text (only supports two currently)
	getByClass("weaponSelector").innerHTML = 
		"<option>" + character.primaryWeaponName + "</option>" +
		"<option>" + character.secondaryWeaponName + "</option>";
	// get elem
	advanced = getByClass("advancedMoves");
	// create a collapser for the advanced moves
	advancedCollapser = new Collapser(
		advanced, 
		advanced.getElementsByClassName("title")[0], 
		advanced.getElementsByClassName("inner")[0], 
		function(expanded) { 
			expanded ? advanced.getElementsByClassName("title")[0].innerHTML = " - Advanced" : advanced.getElementsByClassName("title")[0].innerHTML = " + Advanced"
		}, 
		true
	);
	// collapse on start
	advancedCollapser.toggle();
	// get elem
	special = getByClass("specialMoves");
	// create a collapser for the advanced moves
	specialCollapser = new Collapser(
		special, 
		special.getElementsByClassName("title")[0], 
		special.getElementsByClassName("inner")[0], 
		function(expanded) { 
			expanded ? special.getElementsByClassName("title")[0].innerHTML = " - Archetype" : special.getElementsByClassName("title")[0].innerHTML = " + Archetype"
		}, 
		true);
	// collapse on start
	specialCollapser.toggle();
	activateTurnSpecificUI(turn);
}

function endTurnPhase() {
	turn = !turn;
	if (turn) setAP(maxAP);
	activateTurnSpecificUI(turn);
}

function activateTurnSpecificUI(turn) {
	if (turn) attackMode(); else defenseMode();
}

function showDefenseUI() {
	bigDefendBox.style.display = "block";
	defendBox.style.display = "block";
	attackBox.style.display = "none";
	moveBox.style.display = "none";
}

function hideDefenseUI() {
	bigDefendBox.style.display = "none";
	defendBox.style.display = "none";
	attackBox.style.display = "block";
	moveBox.style.display = "block";
}

function attackMode() {
	// change the big buttons
	hideDefenseUI();
	
	// change background
	battleContainer.style.backgroundColor = "rgb(200,180,180)";
	
	var aInner = advanced.getElementsByClassName("inner")[0];
	var sInner = special.getElementsByClassName("inner")[0];
	aInner.innerHTML = "";
	sInner.innerHTML = "";
	
	for (var i=0; i<myMoves.length; i++) {
		//console.log("move name in battle.js: " + myMoves[i].name);
		if (myMoves[i].name == "Basic Melee Attack" || myMoves[i].name == "Basic Ranged Attack" || myMoves[i].name == "Move") {
			//displayMove(myMoves[i],true,moveContainer.getElementsByClassName("attackAndMove");
		} else {
			if (myMoves[i].basic) {
				if (myMoves[i].name == "Defend" || myMoves[i].name == "Focus Defend") {
					// do not display defensive moves
				} else {
					displayMove(myMoves[i],true,aInner);
				}
			} else {
				displayMove(myMoves[i],true,sInner);
			}
		}
	} 
}

function defenseMode() {
	// change the big buttons
	showDefenseUI();
	
	// change background
	battleContainer.style.backgroundColor = "rgb(180,180,200)";

	var aInner = advanced.getElementsByClassName("inner")[0];
	var sInner = special.getElementsByClassName("inner")[0];
	aInner.innerHTML = "";
	sInner.innerHTML = "";
	
	for (var i=0; i<myMoves.length; i++) {
		//console.log("move name in battle.js: " + myMoves[i].name);
		if (myMoves[i].name == "Basic Melee Attack" || myMoves[i].name == "Basic Ranged Attack" || myMoves[i].name == "Move") {
			//displayMove(myMoves[i],true,moveContainer.getElementsByClassName("attackAndMove");
		} else {
			if (myMoves[i].basic) {
				if (myMoves[i].name == "Defend" || myMoves[i].name == "Focus Defend") {
					displayMove(myMoves[i],true,aInner);
				}
			} else {
				if (myMoves[i].special == "Reaction") {
					displayMove(myMoves[i],true,sInner);
				}
			}
		}
	} 
}

// synonym function
function startBattleMode(myTurn) {
	enterBattleMode(myTurn);
}