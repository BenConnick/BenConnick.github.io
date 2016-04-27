// SETUP THE STARTING VARS
// -----------------------

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
var APHistory = [];

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
	"Choose a name",
	"Choose your skills",
	"Choose exactly four (4) abilities"
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
var lastChoice = 2;
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

var archetypes = {
	"Slayer" : 
	{
		"Weapon1" : "Battleaxe",
		"Weapon2" : "Longbow",
		"Attributes" : [6,4,4,2],
		"Attack" : 5,
		"Defense" : 4,
		"HP" : 8
	},
	"Defender" : 
	{
		"Weapon1" : "Longsword",
		"Weapon2" : "Buckler-Shield",
		"Attributes" : [5,5,2,4],
		"Attack" : 4,
		"Defense" : 5,
		"HP" : 9
	},
	"Scholar" : 
	{
		"Weapon1" : "Staff",
		"Weapon2" : "Throwing-Knives",
		"Attributes" : [2,4,7,6],
		"Attack" : 3,
		"Defense" : 3,
		"HP" : 6
	},
	"Battlemage" : 
	{
		"Weapon1" : "Staff",
		"Weapon2" : "Throwing-Knives",
		"Attributes" : [2,4,6,4],
		"Attack" : 3,
		"Defense" : 3,
		"HP" : 6
	},
	"Assassin" : 
	{
		"Weapon1" : "Shortsword",
		"Weapon2" : "Throwing-Knives",
		"Attributes" : [4,6,4,2],
		"Attack" : 6,
		"Defense" : 3,
		"HP" : 6
	},
	"Hunter": 
	{
		"Weapon1" : "Longbow",
		"Weapon2" : "Shortsword",
		"Attributes" : [4,6,4,2],
		"Attack" : 5,
		"Defense" : 3,
		"HP" : 6
	}
}

function Weapon(nameArg, damageArg, APArg, bonusArg, rangeArg, specialArg) {
	this.name = nameArg;
	this.AP = APArg;
	this.bonus = bonusArg;
	this.damage = damageArg;
	this.range = rangeArg;
	this.special = specialArg;
	this.print = function() {
		return this.name + ": " + this.damage + " " + this.type + " damage, " + this.AP + " AP drain, " + this.bonus + " bonus attack, special:" + this.special;
	}; 
}

var weapons = [];
weapons.push(new Weapon("Fists","2","-1",0,"touch",""));
weapons.push(new Weapon("Shortsword","5","+0",1,"touch",""));
weapons.push(new Weapon("Battleaxe","7","+1",0,"touch",""));
weapons.push(new Weapon("Throwing-Knives","3","+0",0,"3/6/9",""));
weapons.push(new Weapon("Longbow","5","+0",0,"4/8/16",""));
weapons.push(new Weapon("Crossbow","6","+0",0,"4/8/16",""));
weapons.push(new Weapon("Staff","2","+0",0,"touch","Magic +1"));
weapons.push(new Weapon("Longsword","6","+0",0,"touch",""));
weapons.push(new Weapon("Throwing-Spears","4","+0",0,"3/6/9",""));
weapons.push(new Weapon("Buckler-Shield","0","+0",0,"touch",""));

var choiceDescriptions = {

	// SLAYER
	"Slayer" : "<br>"
	// picture
	+"<img src='images/Slayer.png' class='classPic'/><br>"
	// description
	+"The Slayer is a monster specialist. Tough and damage-focused. <br>"
	// primary weapon
	+"<div class='ccWeapon1Box'><p class='ccWeaponDesc'>4<img src='images/attackdie.png' class='dieSize2'> <img src='images/Battleaxe.png' class='ccWeaponPic'/></div>"
	// secondary weapon
	+"<div class='ccWeapon2Box'><p class='ccWeaponDesc'>3<img src='images/attackdie.png' class='dieSize2'> <img src='images/Longbow.png' class='ccWeaponPic'/></div>"
	// defenses
	// special moves
	+"",
	
	// DEFENDER
	"Defender" : "<br>"
	// picture
	+"<img src='images/Defender.png' class='classPic'/><br>"
	// description
	+"The Defender is a professional soldier. Battle hardened and team-focused.",
	
	// BATTLEMAGE
	"Battlemage" : "<br>"
	// picture
	+"<img src='images/Battlemage.png' class='classPic'/><br>"
	// description
	+"The Battlemage is an expert on combat-magic. Powerful and control-focused.",
	
	// SCHOLAR
	"Scholar" : "<br>"
	// picture
	+"<img src='images/Scholar.png' class='classPic'/><br>"
	// description
	+"The Scholar is a learned arcane master. Intelligent and tactics-focused.",
	
	// ASSASSIN
	"Assassin" : "<br>"
	// picture
	+"<img src='images/Assassin.png' class='classPic'/><br>"
	// description
	+"The Assassin is a contract killer. Ruthless and target-focused.",
	
	// HUNTER
	"Hunter" : "<br>"
	// picture
	+"<img src='images/Hunter.png' class='classPic'/><br>"
	// description
	+"The Hunter is a master of thriving in nature. Keen and trap-focused.",
	
	"Smithing and Appraisal" : "Smithing allows you to craft weapons, armor, and other objects out of metal, given a proper forge.  Appraisal allows you to judge the proper value for an item, particularly weapons, armor, jewelry, and other treasure.",
	"Acrobatics and Athletics" : "Acrobatics allows you to perform daunting acts with your body, like walking on a thin ledge or performing a flip. Athletics allows you to perform feats of strength such as running long distances and carrying heavy objects.",
	"Performance and Bluff" : "Performance allows you to play instruments, give a persuasive argument, or give a rousing speech. Bluff allows you to tell convincing lies, or convincingly fake an identity",
	"Alchemy and Cooking" : "Alchemy allows you craft useful potions. Cooking allows you to cook delicious meals and prepare rare or dangerous dishes.",
	"Thievery and Sneaking" : "Thievery allows you to successfully steal things without getting notice. Sneaking allows you to hide in difficult places and to move without making noise. Some characters get advantages for being hidden in combat.",
	"Survival and Tracking" : "Survival allows you to make shelters, locate water, and other skills you would need to survive outside of civilization. Tracking allows you to find animals in their habitats, or to follow a person or creature using only their tracks."
}

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
	"",
	4,
	"|Weapon||ad|",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Basic Ranged Attack",
	"",
	5,
	"|Weapon||ad|",
	"4/8/12",
	"",
	"",
	""
	)
);
basicMoves.push(new Move(
	"Full Melee Attack",
	"",
	6,
	"",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Trip",
	"",
	5,
	"Target tests agility against you. If they lose, they gain the Prone status. Target must be within 1 size category of you.",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Grapple",
	"",
	5,
	"Target tests agility against you. If they lose, they gain the Grappled status. Target must be within 1 size category of you.",
	"Touch",
	""
	)
);
basicMoves.push(new Move(
	"Mark",
	"",
	2,
	"You sign a Marking Sigil in the air. One target gains the Marked status.",
	"Sight",
	"Magic"
	)
);
basicMoves.push(new Move(
	"Defend",
	"",
	1,
	"Roll |Defense||dd|",
	"",
	"Reaction",
	"You are attacked"
	)
);
basicMoves.push(new Move(
	"Focus Defend",
	"",
	4,
	"Roll |Defense + 4||dd|",
	"",
	"Reaction",
	"You are attacked"
	)
);

// Mark basic moves
basicMoves.forEach(function(m) {
	m.basic = true;
	myMoves.push(m);
	allMoves.push(m);
});

function Collapser(container, clickElem, innerElem, callback, expanded, titleElem) {
	this.uniqueId = container.id || "no id assigned";
	this.container = container;
	this.clickElem = clickElem;
	this.innerElem = innerElem;
	this.titleElem = titleElem;
	this.expanded = expanded || false;
	if (titleElem) {
		this.title = this.titleElem.innerHTML;
		this.expanded ? this.titleElem.innerHTML = " - "+this.title : this.titleElem.innerHTML = " + "+this.title;
	}
	this.toggle = function() {
		if (this.expanded) {
			window.scrollBy(0,-1*innerElem.clientHeight);
			this.expanded = false;
			this.innerElem.style.height = '0'
			this.innerElem.style.overflow = "hidden";
			if (this.title) this.titleElem.innerHTML = " + "+this.title;
		} else {
			this.innerElem.style.height = 'auto';
			this.expanded = true;
			window.scrollBy(0,innerElem.clientHeight);
			if (this.title) this.titleElem.innerHTML = " - "+this.title;
		}
		if (callback) callback(this.expanded);
	}
	this.clickElem.onclick = (function(event) {
		//console.log(event.currentTarget.id);
		//collapserObjects[event.currentTarget.id].toggle();
		this.toggle();
	}).bind(this);
}