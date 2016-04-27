// FUNCTIONS USED TO DIRECTLY INTERACT WITH THE DOM
// ALSO BUTTON CONTROLS
// -----------------------------------------------
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
	getByClass("bottomBar").style.bottom = "-2em";
	clearTimeout(bottomTimeout);    	
	bottomTimeout = setTimeout(function() {
		retractUseBox();
	},9000);
}
function retractUseBox() {
	getByClass("bottomBar").style.bottom = "-11em";
}

function closeCreator() {
	getByClass("characterCreationBox").style.display = "none";
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

function showDefinitionBox() {
	defBox.style.bottom = "-2em";
}

function hideDefinitionBox() {
	defBox.querySelector("p").innerHTML = "";
	defBox.style.bottom = "-150%";
}

// BUTTON CONTROLS

// runs on init
function activateButtons() {
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
	getById("bbAPplus").onclick = function() {
		addToAP(1);
	}
	getById("bbAPminus").onclick = function() {
		addToAP(-1);
	}
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
			//showCharacter();
			//listMyMoves();
			enterBattleMode(true);
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
	getById("endTurn").onclick = function() {
		endTurnPhase(); // battle.js
	}
	getById("undoAbility").onclick = function() { undoAbility(); }
	getById("bbMove").onclick = function() {
		useAbility(basicMoves[0]);
	}
	getById("bbAttack").onclick = function() {
		useAbility(basicMoves[1]);
	}
	getById("bbCharacter").onclick = function() {
		turn ? setHP(HP+1) : setHP(HP-1);
	}

	getByClass("battleButton").onclick = function() {
		enterBattleMode(true);
	}
	
	getByClass("weaponSelector").onchange = function() {
		// change weapon picture
		if (this.value == character.primaryWeaponName) {
			getByClass("selectedWeaponImg").style.backgroundImage = 'url("images/'+character.primaryWeaponName+'.png")';
			attackValue.innerHTML = getWeapon(character.primaryWeaponName).damage;
		} else {
			getByClass("selectedWeaponImg").style.backgroundImage = 'url("images/'+character.secondaryWeaponName+'.png")';
			attackValue.innerHTML = getWeapon(character.secondaryWeaponName).damage;
		}
		// change whether basic attack is melee or range
		if (getWeapon(this.value).range == "touch") {
			// display standard attack
			
		} else {
			// display ranged attack
			
		}
	}
	
	/*getById("GotAttacked").onclick = function() {
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
	}*/
}
