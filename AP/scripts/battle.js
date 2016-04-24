var advancedCollapser;
var specialCollapser;
var turn;

// activates the battle mode
function enterBattleMode(myTurn) {
	// get DOM element references
	var moveContainer = getByClass("super");
	var basic = getByClass("attackAndMove");
	var advanced = getByClass("advancedMoves");
	var special = getByClass("specialMoves");
	
	// show the battle screen
	showScreen("Battle");
	// set ap to maxAP
	setAP(maxAP);
	// set hp to character's current hp
	setHP(archetypes[character.charClass].HP);
	// start on the character's turn
	turn = myTurn;
	// set name
	getByClass("battleName").innerHTML = character.name;
	// first weapon
	getByClass("selectedWeaponImg").style.backgroundImage = 'url("images/'+character.primaryWeaponName+'.png")';
	// clear inner box this doesn't work because there are not the inner elements where moves are stored
	//basic.innerHTML = advanced.innerHTML = special.innerHTML = "";
	// set basic attack based on first weapon
	if (getWeapon(character.primaryWeaponName).range == "touch") {
		// melee
		displayMove(basicMoves[1],true,moveContainer.getElementsByClassName("attackAndMove")[0]);
	} else {
		// ranged
		displayMove(basicMoves[2],true,moveContainer.getElementsByClassName("attackAndMove")[0]);
	}
	// add move ability
	displayMove(basicMoves[0],true,moveContainer.getElementsByClassName("attackAndMove")[0]);
	// set character portrait
	getByClass("battleCharacterImg").style.backgroundImage = 'url("images/'+character.charClass+'.png")';
	// set weapon selector text (only supports two currently)
	getByClass("weaponSelector").innerHTML = 
		"<option>" + character.primaryWeaponName + "</option>" +
		"<option>" + character.secondaryWeaponName + "</option>";
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
	// create a collapser for the advanced moves
	specialCollapser = new Collapser(
		special, 
		special.getElementsByClassName("title")[0], 
		special.getElementsByClassName("inner")[0], 
		function(expanded) { 
			expanded ? special.getElementsByClassName("title")[0].innerHTML = " - Special" : special.getElementsByClassName("title")[0].innerHTML = " + Special"
		}, 
		true
	);
	// toggle
	specialCollapser.toggle();
	for (var i=0; i<myMoves.length; i++) {
		//console.log("move name in battle.js: " + myMoves[i].name);
		if (myMoves[i].name == "Basic Melee Attack" || myMoves[i].name == "Basic Ranged Attack" || myMoves[i].name == "Move") {
			//displayMove(myMoves[i],true,moveContainer.getElementsByClassName("attackAndMove");
		} else {
			if (myMoves[i].basic) {
				displayMove(myMoves[i],true,advanced.getElementsByClassName("inner")[0]);
			} else {
				displayMove(myMoves[i],true,special.getElementsByClassName("inner")[0]);
			}
		}
	} 
}