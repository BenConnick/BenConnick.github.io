/*
Museum
An Interactive Fiction Demo
Author: Ben Connick
Language: Javascript
(c) 2015
*/

// *********** HELPER FUNCTIONS ************

String.prototype.lower = function() {
    return this.toLowerCase();
};

String.prototype.contains = function(str) {
    return (this.search(new RegExp(str,"i"))>=0);
};

Array.prototype.remove = function(str) {
	this.splice(this.indexOf(str),1);
};

function defaultList(lst) {
	if (lst) { return lst; } else { return []; }
}

function defaultStr(str) {
	if (str) { return str; } else { return ""; }
}

function searchArray(elem, arr) {
	for (var i=0; i<arr.length; i++) {
            if (typeof elem == "string") {
                elem = elem.lower();
            }
            if (elem === arr[i]) {
                    return true;
            }
	}
	return false;
}

function setRoomDirections(room) {
    room.directions = [room.north,room.east,room.south,room.west, room.up, room.down];
}

function setAllRoomDirections() {
    var keys = Object.keys(roomDic);
    for (var i=0; i<keys.length; i++) {
        setRoomDirections(roomDic[keys[i]]);
    }
}

function exit() {
	//stub
}

/*function arrayFromHashmap(hashmap) {
	var keys = [];
	for (key in hashmap) {
		if (hashmap.hasOwnProperty(key)) {
			keys.push(key);
		}
	}
	return keys;
}*/

// *********** CLASS DEFINITIONS *************

// Item class constructor
function Item(id, description, size, loc, announce, article, interaction, state, synonyms) {
    /* things which can be picked up
    id is the full name of the item and its key in the dictionary
    description is what is printed when the item is examined
    size is how many inventory spaces it takes up (one or two). If you want the item to be immovable, set size > 2
    loc is where the item is within the room
    interaction is a dictionary of functions that can be called (often these functions will make use of the state
    property). Not every item is going to be interactive, it"s there just in case.
    state is an optional value for a piece of scenery in case it changes
    Article is "A" "An" or "The" */
    if (id) { this.id = id; } else { this.id = "blank"; }
    if (description) { this.description = description; } else { this.description = "looks pretty ordinary"; }
    if (size) { this.size = size; } else { this.size = 1; }
    if (loc) { this.loc = loc; } else { this.loc = " is on the floor. "; }
    if (announce) { this.announce = announce; } else { this.announce = true; }
    if (article) { this.article = article; } else { this.article = "A "; }
    if (interaction) { this.interaction = interaction; } else { this.interaction = {}; }
    if (state) { this.state = state; } else { this.state = ""; }
    if (synonyms) { this.synonyms = synonyms; } else { this.synonyms = []; }
    
 }
// returns name and loc of this item
Item.prototype.brief = function() {
    return (this.article+this.id+this.loc);
};
Item.prototype.isIn = function(str) {
    var regex = new RegExp(this.id,"i");
    if (str.search(regex)>=0) { return true; }
    for (var i = 0; i < this.synonyms.length; i++) {
        regex = new RegExp(this.synonyms[i],"i");
        if (str.search(regex)>=0) { return true; }
    }
};

// Room class constructor
/*	rooms are the places where players spend all of their time.
    Each room is dimensionless, and acts as a node or cell.
    id is used to connect rooms and to title them. It is also the room"s key in the dictionary
    description is what is printed when the player enters the room.
    north and the other directions hold the id"s of adjacent accessible rooms. If no other room is accessible from a
        direction, it is a description of why the player cannot move that direction.
    things is an object list of thing objects that are in the room*/
    
function Room(id, description, north, east, south, west, up, down, dark, things) {
    if (id) { this.id = id; } else { this.id = "blank"; }
    if (description) { this.description = description; } else { this.description = "description"; }
    if (north) { this.north = north; } else { this.north = "There is a wall there"; }
    if (east) { this.east = east; } else { this.east = "There is a wall there"; }
    if (south) { this.south = south; } else { this.south = "There is a wall there"; }
    if (west) { this.west = west; } else { this.west = "There is a wall there"; }
    if (up) { this.up = up; } else { this.up = "You can't go up"; }
    if (down) { this.down = down; } else { this.down = "You can't go down"; }
    if (dark) { this.dark = dark; } else { this.dark = false; }
    if (things) { this.things = things; } else { this.things = []; }
    this.directions = [this.north,this.east,this.south,this.west, this.up, this.down];
}
Room.prototype.describe = function() {
    // get a string containing descriptions of all of the things in the room
    var stuffDesc = "";
    if(!this.dark && this.things.length>0) { 
        for (var i=0; i<this.things.length; i++) {
            if (itemDic[this.things[i]].announce) {
                stuffDesc+=itemDic[this.things[i]].brief();
            }
        }
    }
    // show available rooms
    var cardinals = ["north","east", "south", "west"];
    for (var i=0; i<4; i++) {
            if (roomDic[this.directions[i]]) {
                    if (!(roomDic[this.directions[i]].dark)) {
                            stuffDesc+=("\nThere is a light coming from the doorway to the "+cardinals[i]+".");
                    }
            }
    }
    // if the room is dark, do not describe it
    if (this.dark) {
            return "An unnatural darkness makes it impossible to see in here. "+stuffDesc;
            }
    else {
            return this.description+stuffDesc;
    }
};

// *********** GLOBAL VARIABLES *************
// the sleepiness of the character is used to disuade the player from attempting meta actions
var sleepy = 0;
// tips on
var tips = true;
// how many of your two hands are full (0, 1, or both)
var handsFull = 0;
// dreamcatcherTalk advances every time that a significant story event happens
/* "significant" story events:
0 - game start
1 - set on 1st shadow
2 - pick up from 1st shadow
3 - mirror chest opened
4 - coin taken 1st time
5 - mirror put in sarchophagus
6 - dreamcatcher taken by mouse
7 - coin put on gramophone
8 - dreamcatcher picked up again (Awa)
9 - set on snake shadow
10 - take hand
11 - entered house */
var dreamcatcherTalk = 0;
// if the game is over
var gameOver = false;
var keyTaken = false;
// mirrorMirror advances when the player looks in the mirror
var mirrorMirror = 0;
var inventory = [];

// **************** SCENERY *********************

// **************** ITEMS *******************
// list of all items
var itemDic = {};

function addItem(item) {
    itemDic[item.id] = item;
}

var table = new Item("table");
table.size = 9;
addItem(table);

var chair = new Item("chair");
chair.size = 2;
addItem(chair);

// the engraving on the atrium floor
var compass = new Item("compass");
compass.synonyms = ["compass", "rose", "engraving"];
compass.description = "An engraving of a an eight pointed compass rose. The four primary cardinal directions each point to an archway ";
compass.size = 10; // unmoveable
compass.announce = false;
addItem(compass);

var ladder = new Item("ladder");
ladder.description="an ordinary collapsible ladder";
ladder.size = 10;
ladder.article="There is a ";
ladder.loc=" standing upright by the t-rex. ";
ladder.announce=true;
addItem(ladder);

var key = new Item("key");
key.description="An old brass key with two teeth";
key.size=1;
key.article="There is a ";
key.loc=" dangling from a tooth of the t-rex. ";
key.announce=true;
addItem(key);

var dreamcatcher = new Item("dreamcatcher");
dreamcatcher.description="You look me over carefully. You see that my body is composed of a willow loop, with a string wrapped around so as to create a web-like pattern in the center. Eight hide strips hang down from me, and they have been threaded through many colorful beads. At the end of each of the strips are small goose feathers. ";
dreamcatcher.size = 0;
dreamcatcher.article = "I (";
dreamcatcher.loc= ") am nearby on the floor.";
dreamcatcher.synonyms.push("you");
addItem(dreamcatcher);

var dancerDiorama = new Item("dancers");
dancerDiorama.description="The masks of the dancers draw you in to their circle and you can almost feel the heat of the fire. You feel a sense of deja vu, like this has happened before. Your eye falls on the placard that is hung on the wall by the diorama. One part in particular catches your eye, \"Some Native Americans believed that like the spirit world, \n\nthe experiences of dreams are just as real as waking experiences.\"\n\nHmm. That's interesting.";
dancerDiorama.size = 10;
dancerDiorama.article="The ";
dancerDiorama.loc=" are set into an alcove of the wall, behind some glass. ";
dancerDiorama.announce=false;
dancerDiorama.synonyms = ["dancer","diorama","Indians"];
addItem(dancerDiorama);

var artifacts = new Item("artifacts");
artifacts.description="Various bows, headdresses and painted animal skins. None of which hold any particular value or interest for you. ";
artifacts.size=10;
artifacts.article="The ";
artifacts.loc=" hang on hooks in the wall behind the glass. ";
artifacts.announce=false;
artifacts.synonyms = ["artifact","wall"];
addItem(artifacts);

shadow = new Item("tree shadow");
shadow.description="It is an unnatural silhouette of an ominous, leafless tree. Never mind that there are no trees to be seen, I can tell that this shadow does not belong here. If you place me on it, I may be able to do something about it. ";
shadow.article="A strange ";
shadow.size=10;
shadow.synonyms = ["tree","shadow","silhouette"];
addItem(shadow);

var tyrannosaurus = new Item("tyrannosaurus");
tyrannosaurus.description="The massive bones are as awe inspiring now as you remember them being when you were young. ";
tyrannosaurus.article="The ";
tyrannosaurus.announce=false;
tyrannosaurus.size=10;
tyrannosaurus.synonyms = ["trex","t-rex"];
addItem(tyrannosaurus);

var chest = new Item("chest");
chest.description="The chest is made of a red varnished wood with a swirling grain. The showy golden lock seems solid. ";
chest.article="A large, ornate ";
chest.loc = " is lying on the floor, securely locked. ";
chest.size=10;
chest.synonyms = ["lock"];
addItem(chest);

var mirror = new Item("mirror");
mirror.description="The tiny, circular mirror, about two inches in diameter, reflects everything as it should, except when you point it at yourself. In the mirror you appear as a tall, dark haired woman in colonial-era servant's clothes. ";
mirror.announce=true;
mirror.loc = " is in the chest. ";
addItem(mirror);

var skeletons = new Item("skeletons");
skeletons.description="The carefully arranged skeletons fill you with a sort of sadness. They remind you how lifeless this room is. ";
skeletons.announce=false;
skeletons.synonyms = ["bones","dinosaurs","skeletal","skeleton","fossil","fossils"];
addItem(skeletons);

var gems = new Item("gems");
gems.description="The stones sparkle brightly in every conceivable color of the rainbow. They are securely placed behind shatter-proof glass. ";
gems.article = "The ";
gems.loc=" are behind the glass";
gems.announce=false;
gems.size=10;
gems.synonyms = ["gem","diamond","ruby","saphire","emerald","cases","case","stones"];
addItem(gems);

var sarcophagus = new Item("sarcophagus");
sarcophagus.description="A wooden sarcophagus. Its shape resembles a stylized man wearing pharaoh's garb. It looks heavy. ";
sarcophagus.size = 10;
sarcophagus.announce=false;
sarcophagus.synonyms = ["coffin","mummy"];
addItem(sarcophagus);

var slot = new Item("slot");
slot.description= "A shallow, circular slot about two inches in diameter. ";
slot.size = 10; // cannot be moved
slot.announce = false;
slot.loc = " is set into the forhead of the sarcophagus. ";
addItem(slot);

var coin = new Item("coin");
coin.description="A wide, golden coin about two inches in diameter. The coin sports a stylized eagle on one side and fine concentric grooves on the other. The coin has a small hole in its center. ";
coin.article="A golden ";
coin.loc=" is set into the slot in the forhead of the sarcophagus. ";
coin.size=0;
addItem(coin);

var finds = new Item("finds");
finds.description="These displays showcase brittle reminders of an age long past; dead memories in wood, porcelain and gold. ";
finds.article = "The ";
finds.loc=" are in display cases up against the wall";

var instruments = new Item("instruments");
instruments.description="A variety of instruments, some contemporary, others dating back to the prehistoric age. ";
instruments.article = "The ";
instruments.loc=" are here. ";
instruments.size = 10;
instruments.announce = false;
instruments.synonyms = ["piano","guitar","flute","drum"];
addItem(instruments);

var gramophone = new Item("gramophone");
gramophone.description = "It is an early gramophone-turntable with no record on it. As you look at it, you unconsciously feel the coin in your pocket, and realize that the hole in it is the same size as the one that a record for the gramophone's would have. ";
gramophone.size = 10;
gramophone.article= "There is a ";
gramophone.loc = " here. ";
gramophone.synonyms = ["record player","phonograph"];
addItem(gramophone);

var mouseShadow = new Item("mouse shadow");
mouseShadow.description="An unnatural mouse shadow that is similar to that of the tree from earlier. If you place me on it, I may be able to do something about it. ";
mouseShadow.size = 10;
mouseShadow.synonyms = ["shadow","mouse"];
addItem(mouseShadow);

var snakeShadow = new Item("snake shadow");
snakeShadow.description="That infernal shadow! It looks sluggish and weak from earlier. If you place me on it, we can finish this once and for all. ";
snakeShadow.size = 10;
snakeShadow.loc=" is curled up in a dark corner. ";
snakeShadow.synonyms = ["shadow","snake","corner"];
addItem(snakeShadow);

var tanks = new Item("tanks");
tanks.description="There are tanks of various sizes. Mostly vapid and depressing. Containing drab fish that are listless, lifeless or both. ";
tanks.size=10;
tanks.announce=false;
tanks.synonyms = ["shelf","tank"];
addItem(tanks);

var fish = new Item("fish");
fish.description="You stare into the eye sockets of a dead fish. The empty darkness stares back. Other fish drift slowly around, seemingly aware of the pointlessness of their existence. ";
fish.size=10;
fish.announce=false;
addItem(fish);

var specimens = new Item("specimens");
specimens.description="Some pickled creatures too strange and hideous for words. ";
specimens.size=10;
specimens.announce = false;
specimens.synonyms = ["specimen","pickled","deep","crustacean"];
addItem(specimens);

var crib = new Item("crib");
crib.description="A plain and rudimentary crib, with no fancy ornamentation or paint, but made with the utmost care and affection. ";
crib.size = 5;
addItem(crib);

var baby = new Item("baby");
baby.description="Your son breathes softly, his face free of worry. ";
baby.size = 2;
baby.article="A ";
baby.loc=" is in the crib. ";
baby.synonyms = ["son","baby","child"];
addItem(baby);

var armor = new Item("armor");
armor.description="Flickering images that you can only see when you don't look directly at them.";
armor.size=10;
armor.article="The ";
armor.loc=" are glowing softly in your vision. ";
armor.announce=false;
addItem(armor);

// ***************** ROOMS ********************

var currentRoom = new Room();

var demoRoom = new Room("Demo Room");
demoRoom.down = "Demo Basement";
demoRoom.description = "This is a rather boring room. There is a staircase leading down. ";
demoRoom.things=["table", "chair"];

var demoBasement = new Room("Demo Basement");
demoBasement.up = "Demo Room";
demoBasement.description = "It's too dark to see down here";

var atrium = new Room("Atrium");
atrium.description = "A large octagonal room, with huge, off-white and black, square stone tiles covering the floor. The ceiling is an unornamented stone dome. Four enormous banners are suspended over four corresponding archways, \nthe north facing one reads\n  \"Native American Exhibit\"\nthe east facing one,\n  \"Ancient Egypt Exhibit\" \nthe south facing one,\n  \"Marine Life Room\" \nand the west facing banner reads,\n  \"Space and Aeronautics Exhibit\".\nThe center tile has a small engraving in the shape of an eight pointed compass rose. ";
atrium.north = "Native American Exhibit";
atrium.east = "Ancient Egypt Exhibit";
atrium.south = "Marine Life Room";
atrium.west = "Space and Aeronautics Exhibit";
atrium.things=["dreamcatcher", "compass"];

var nativeAmerican = new Room("Native American Exhibit");
nativeAmerican.description = "A dim room with glass-covered walls displaying artifacts. A diorama shows masked Indians dancing around a fire pit. ";
nativeAmerican.south = "Atrium";
nativeAmerican.east = "Minerology Exhibit";
nativeAmerican.west = "Paleontology Exhibit";
nativeAmerican.things = ["dancers","artifacts","tree shadow"];

var space = new Room("Space and Aeronautics Exhibit");
space.description = "A high ceilinged room with images of the progress of manned flight covering the walls. Airplanes and space shuttles hang from the roof on powerful wires. ";
space.north = "Paleontology Exhibit";
space.east = "Atrium";
space.south = "Armor Exhibit";
space.dark = true;

var dinos = new Room("Paleontology Exhibit");
dinos.description= "A deep room that contains many prehistoric skeletons supported by metal bars. An enormous tyrannosaurus skeleton dominates the room, and the lights have been positioned to illuminate it from all angles. The lights glint off of something shiny in the tyrannosaur's mouth. ";
dinos.east = "Native American Exhibit";
dinos.south = "Space and Aeronautics Exhibit";
dinos.dark = true;
dinos.things=["ladder","tyrannosaurus"];

var gemRoom = new Room("Minerology Exhibit");
gemRoom.description= "The room is a veritable maze of glass. Everywhere there are long cases, short cases, tall cases, all displaying minerals and gem stones in varying sizes. ";
gemRoom.west = "Native American Exhibit";
gemRoom.south = "Ancient Egypt Exhibit";
gemRoom.dark = true;
gemRoom.things = ["chest","gems"];


var mummies = new Room("Ancient Egypt Exhibit");
mummies.description= "A cozy, carpeted room with a few displays showcasing various tomb finds. The lights are notably warm in color, and the displays part in the center of the room where a wooden sarcophagus sits. ";
mummies.north = "Minerology Exhibit";
mummies.south = "History of Music Exhibit";
mummies.west = "Atrium";
mummies.dark = true;
mummies.things = ["sarcophagus","coin","slot"];

var instrumentRoom = new Room("History of Music Exhibit");
instrumentRoom.description = "A round, coolly lit room packed with exquisite musical instruments on pedestals of varying heights. ";
instrumentRoom.north = "Ancient Egypt Exhibit";
instrumentRoom.west = "Marine Life Room";
instrumentRoom.dark = true;
instrumentRoom.things = ["instruments","gramophone","mouse shadow"];

var marineLife = new Room("Marine Life Room");
marineLife.description = "A thin, hallway-like room with tanks on either side. Most appear empty, or contain dull colored fish. One space is doused in blue light, and contains shelves with tiny tanks, in which crustacean-like specimens float motionless. A titlecard informs you that the shelf contains creatures who lived in the parts of the ocean \"Deeper than Light\". ";
marineLife.west = "Armor Exhibit";
marineLife.north = "Atrium";
marineLife.east = "History of Music Exhibit";
marineLife.dark = true;
marineLife.things=["tanks","fish","specimens","snake shadow"];


var armorRoom = new Room("Armor Exhibit");
armorRoom.description = "You are in a small wooden cabin with only one room. Flashes of lightning cast blueish luminescence onto the floor. There is a door on the north side of the house. As though the walls are translucent, you can see through them to ghostly images of suits of armor hanging on stands. Outside, the wind howls. ";
armorRoom.north = "Space and Aeronautics Exhibit";
armorRoom.east = "Marine Life Room";
armorRoom.dark = true;
armorRoom.things=["crib","baby","armor"];

var ladderTop = new Room("Top of the Ladder");
ladderTop.description= "You stand on the top of the collapsible ladder. ";
ladderTop.things=["key","tyrannosaurus"];
ladderTop.north = "Careful! Don't fall! ";
ladderTop.east = "Careful! Don't fall! ";
ladderTop.south = "Careful! Don't fall! ";
ladderTop.west = "Careful! Don't fall! ";
ladderTop.down = "Paleontology Exhibit";
var outside = new Room("Outside");
outside.description="You are outside. ";


// ***************  LIST OF ROOMS ************************
roomDic = {};

roomDic["Demo Room"] = demoRoom;
roomDic["Demo Basement"] = demoBasement;
roomDic["Atrium"] = atrium;
          
roomDic["Native American Exhibit"] = nativeAmerican;
roomDic["Space and Aeronautics Exhibit"] = space;
          
roomDic["Paleontology Exhibit"] = dinos;
roomDic["Minerology Exhibit"] = gemRoom;
roomDic["Ancient Egypt Exhibit"] = mummies;
          
roomDic["History of Music Exhibit"] = instrumentRoom;
roomDic["Marine Life Room"] = marineLife;
roomDic["Armor Exhibit"] = armorRoom;
          
roomDic["Top of the Ladder"] = ladderTop;
roomDic["Outside"] = outside;
           
           
// ******************* FUNCTIONS **********************

// (alphabetical order)

function advancedHelp() { return 'Advanced Help Test';  }

function breakThing() { return getSleepy([],'You ought not do that... '); }

function climb(lst, uIn) {
    lst = defaultList(lst);
    uIn = defaultStr(uIn);
    if (uIn.contains("ladder") && !searchArray("ladder", currentRoom.things)) {
            return "You cannot see a ladder. ";
    }
    return goUp(lst,uIn);
    return "You cannot climb";
}

    // handles special cases and unique gameplay situations/input
function conditionCheck(uIn) {
    /* returns "true" or "false" by way of the "OK" keyword
    checks for conditions that should carry out exceptions before or instead of the
    normal response to a player action */
    uIn = defaultStr(uIn);
    if (gameOver) { 
            return "would you like to exit?"; 
    }
    if (currentRoom === outside) {
            gameOver=true;
            return 'Suddenly, you hear a snapping sound. \n\nYou turn around to see the trunk of an enormous, bent oak snap with a loud "crack!" and fall towards the house. \n\nYou suddenly feel alert. You can feel the rain on your face, all remnants of your dream (for surely it was) vanish, and your powerful legs propel you forward, just as the tree lands with a crash, tearing a hole through the cabin. \n\nYou look behind you at where you were standing moments ago, and see a great branch impaled into the ground. \n\nBut you are not there, you are here, with your son safe in your arms. \n\nThe rain begins to let up, and soon it stops altogether. The clouds part, and the moonlight falls on your son, who is wearing an odd dreamcatcher around his neck. You wonder where it came from, and for a moment, you almost remember. But then you push it from your mind and head back into what\'s left of your house to dry off before the morning comes. \n\nThe End\n\nThank you for playing.';
    }/*
    if (ladder.isIn(uIn) && searchArray(ladder.id,currentRoom.things)) {
        ladderTop.down = currentRoom.id;
        setRoomDirections(ladderTop);
        enter(ladderTop);
        return "You climb up the ladder. "+"\n"+look();
    }
    if (ladder.isIn(uIn) && currentRoom === ladderTop) {
        enter(roomDic[ladderTop.down]);
        return "You climb down the ladder. "+"\n"+look();
        }
    if (ladder.isIn(uIn) && !searchArray("ladder",currentRoom.things)) {
        return "You cannot see a ladder. ";
    }
        */
    if (uIn.contains("dream catcher")) {
    	return "Dreamcatcher is a name. Please use one word (dreamcatcher), to refer to Dreamcatcher.";
    }
    if (slot.isIn(uIn) && dreamcatcherTalk === 4) {
        if (uIn.contains(" x") || uIn.contains(" ex")) {
            if (searchArray('mirror', inventory)) {
                return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ').slice(1),uIn)+' The slot is just the right size for the mirror. ';
                }
            else {
                return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ').slice(1),uIn)+' The slot is circular, shallow, and about two inches in diameter. ';
                }
        }
    }
    if (coin.isIn(uIn) && dreamcatcherTalk === 4) {
        if (uIn.contains('x ') || uIn.contains(' ex')) {
            return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ').slice(1),uIn)+' The coin is almost exactly the same shape as the mirror... ';
        }
    }
    return 'OK';
}


function commands() {
    str = "";
    var commandList = Object.keys(verbDic);
    for (var i=0; i<commandList.length; i++) {
        str+=commandList[i]+', ';
    }
    return(str);
}

function drop(lst, uIn) {
    /* uses handsFull, currentRoom, inventory, dreamcatcherTalk, mirrorMirror */

    // empty case
    if (lst.length === 0) {
            return "What do you want to drop? ";
    }
    // Other uses of the word "put"

    // "put on" as in "to wear"
    if (uIn.contains('put on')) {
    return putOn(lst);
    }
    
    // "set up" or "put up", especially the ladder
    if (uIn.contains(' up')) {
        return use(lst,uIn);
    }
	var target = "";
	var itemToDrop = "";
	var dreamcatcherMentioned = false;
	if (dreamcatcher.isIn(uIn)) { dreamcatcherMentioned = true; }
	
	// dreamcatcher special cases
	if (dreamcatcherMentioned && uIn.contains(' on')) { return dropDreamcatcher(lst, uIn); }
	
	// coin special cases
	if (coin.isIn(uIn)) {
		if (!searchArray('coin',inventory)) {
			return 'You don\'t have a coin. ';
		}
		if (slot.isIn(uIn)) { 
			return 'The coin won\'t fit back into the slot. ';
		}
		if (uIn.contains("back")) { 
			return 'The coin won\'t fit back into the slot. ';
		}
		if (gramophone.isIn(uIn) && searchArray('gramophone',currentRoom.things)) {
			return dropCoin(lst, uIn); 
		}
	}
	
	// mirror special cases
	if (mirror.isIn(uIn) && slot.isIn(uIn) && dreamcatcherTalk === 4) {
		return dropMirror(lst,uIn);
	}
	if (mirror.isIn(uIn) && sarcophagus.isIn(uIn) && dreamcatcherTalk === 4) {
		return dropMirror(lst,uIn);
	}
	// baby special case
	if (baby.isIn(uIn) && dreamcatcherTalk > 10) {
        return('You decide against setting your son down. ');
    }
    
    // drop on something special case (target)
    if (uIn.contains(' on')) {
    	// by checking both the input string and the parsed array, it safeguards against potential errors later on due to an inconsistency
        for (var i=0; i<lst.length; i++) {
            if (lst[i] === 'on') {
                beforeOn = lst.slice(0,i);
                afterOn = lst.slice(i+1);
                break;
            }
        }
        /* establishes what comes before the word "on" and what comes after so
        that it can attempt to use the grammatical structure to decide what item to
        drop, and what to drop the item onto */
        var BOStr = "";
        for (var i=0; i<beforeOn.length; i++) {
            BOStr+=(' '+beforeOn[i]);
        }
        var AOStr = "";
        for (var i=0; i++; i<afterOn.length) {
            AOStr+=(' '+beforeOn[i]);
        }
        // loop through and find the thing that you want to drop
        for (var i=0; i<inventory.length; i++) {
            if (itemDic[inventory[i]].isIn(BOStr.lower()) && inventory[i] !== "") {
                itemToDrop = inventory[i]; // found it!
            }
        }
        // loop through and find some thing that you could drop onto
        for (var i=0; i<currentRoom.things.length; i++) {
            if (itemDic[currentRoom.things[i]].isIn(AOStr.lower()) && currentRoom.things[i] !== "") {
                target = currentRoom.things[i];
            }
        }
        // yet another dreamcatcher exception
        if (target !== '' && itemToDrop === "dreamcatcher") {
            inventory.remove(itemToDrop);
            currentRoom.things.push(itemToDrop);
            itemDic[itemToDrop].loc = (") am resting on the " + target);
            return("You place me on "+itemDic[target].article.lower()+target);
        }
        if (target !== "" && itemToDrop !== "") {
            handsFull -= itemDic[itemToDrop].size;
            inventory.remove(itemToDrop);
            currentRoom.things.push(itemToDrop);
            itemDic[itemToDrop].loc = ('on the ' + target);
            return(itemToDrop+" placed on the "+target);
        }
        return "I don't understand how you could do that. ";
    }
    if (uIn.contains(' in')) {
        if (key.isIn(uIn)) {
            if ('lock' || chest.isIn(uIn)) {
                return openThing(lst,uIn);
            }
        }
        return 'You can\'t put that in there.';  
    }
    
    // after passing all tests
    for (var i=0; i<inventory.length; i++) {
    	var item = inventory[i];
        if (itemDic[item].isIn(uIn)) {
            itemToDrop = item;
        }
    }
    if (searchArray(itemToDrop, inventory)) {
        handsFull -= itemDic[itemToDrop].size;
        inventory.remove(itemToDrop);
        if (currentRoom === ladderTop) {
            roomDic[ladderTop.down].things.push(itemToDrop);
        } else {
            currentRoom.things.push(itemToDrop);
            itemDic[itemToDrop].loc = " is on the floor";
            return(itemToDrop + " dropped");
        }
    } else {
        return "You can't drop that. ";
    }
    return ('ERROR');
}

// drop helper function
function dropDreamcatcher(lst, uIn) {

	// drop the dreamcatcher onto the tree shadow
	if (searchArray('dreamcatcher',inventory) && searchArray('tree shadow',currentRoom.things)) {
                        currentRoom.things.remove('tree shadow');
                        inventory.remove('dreamcatcher');
                        currentRoom.things.push('dreamcatcher');
                        itemDic['dreamcatcher'].loc = (') am on the floor. ');
                        gemRoom.dark = false;
                        dinos.dark = false;
                        dreamcatcherTalk = 1;
                        return 'You take me out of your pocket and set me on the shadow. At first nothing happens, then, like a vacuum, the shadow begins moving towards me, shrinking until it is smaller than a dog. Suddenly, it darts off to the west. Be careful when picking me up. Light appears in the doorways to the east and west.';
                    }
	
	// drop the dreamcatcher onto the mouse shadow
	if (searchArray('dreamcatcher',inventory) && searchArray('mouse shadow',currentRoom.things)) {
		instrumentRoom.things.remove('mouse shadow');
		inventory.remove('dreamcatcher');
		dreamcatcherTalk = 6;
		// if you have the coin, continue
		if (searchArray(coin.id,inventory) || searchArray('coin',currentRoom.things)) {
			return 'You set me down on the mouse shadow, but it darts out of the way. It turns into a snake shadow and wraps around me, cloaking me in darkness until you can\'t see me. Then it slithers under the gramophone. ';
		// just in case you discarded the coin
		} else {
			var roomList = Object.keys(roomDic);
			for (var i=0; i<roomList.length; i++) {
				var room = roomList[i];
				if (searchArray('coin',roomDic[room].things)) {
					roomDic[room].things.remove('coin');
				}
			}
			inventory.push('coin');
			return 'You set me down on the mouse shadow, but it darts out of the way. It turns into a snake shadow and wraps around me, cloaking me in darkness until you can\'t see me. Then it slithers under the gramophone. Hmm you\'re missing something. Ah! There it is. You feel something fall into your pocket. ';
		}
	}
	
	// drop the dreamcatcher onto the mouse shadow
	if (searchArray('dreamcatcher',inventory) && searchArray('snake shadow',currentRoom.things)) {
		currentRoom.things.remove('snake shadow');
		inventory.remove('dreamcatcher');
		currentRoom.things.push('dreamcatcher');
		armorRoom.dark=false;
		armorRoom.north = 'Outside';
		armorRoom.east = 'There is a hazy wall there. ';
                setRoomDirections(armorRoom);
		dreamcatcherTalk = 9;
		var roomList = Object.keys(roomDic);
		for (var i=0; i<roomList.length; i++) {
			var room = roomList[i];
			roomDic[room].description  = roomDic[room].description + 'You hear the pounding of heavy rain above you. ';
		}
		return 'You set me down on the snake shadow. It flicks and writhes, distorting into strange shapes and ' +			   'spasming across the walls and floor. But eventually it gets smaller, and smaller, and smaller ' +			   'until it dissapears altogether. You notice the sound of rain hitting wood coming from above you. ' +			   'You look up, and to your surprise the ceiling is comprised of wooden planks. When you look back ' +			   'down, you see that I no longer take the form of a dreamcatcher, but instead resemble a familiar ' +			   'man, with brown eyes and short, curly hair. Take my hand, Awa. We\'re almost done here. The ' +			   'darkness is gone now, but the storm has just begun. ';
}
}

// drop helper function
function dropMirror(lst, uIn) {
	if (!searchArray('mirror', inventory)) {
		return 'You don\'t have a mirror. ';
	}
	inventory.remove('mirror');
	dreamcatcherTalk = 5;
	mummies.north = 'Minerology Exhibit';
	mummies.south = 'History of Music Exhibit';
	mummies.west = 'Atrium';
        setRoomDirections(mummies);
	mummies.things.push('mirror');
	instrumentRoom.dark = false;
	mirrorMirror = 1;
	mirror.size = 10;
	mirror.loc = ' is embedded in the forehead of the sarcophagus. ';
	mirror.description = 'You look into the mirror and see a wooden platform. Sobbing men and women are ' +						 'in shackles nearby. Large angry men are separating them by force. The image ' +						 'fades into another scene, but you look away with an aching in your chest. ';
	sarcophagus.description = sarcophagus.description + " There is a mirror in the slot in the head." ;
    return 'You put the mirror into the slot in the forehead of the sarcophagus. It clicks into place. ' +		   'You hear the stones move aside, and suddenly the whole room is flooded with blinding light. ' +		   'Memories flash before your eyes like photo negatives: a picnic with peanut butter on your nose, ' +		   'making sugar cookies, scraping your knee when you tried to rollerblade,' +		   ' and a visit to a museum. As soon as you see them, they fade away with the light. Try as you ' +		   'might, you can\'t remember anything. As your eyes adjust, you can see that the reflection in the ' +		   ' mirror has changed. It no longer reflects the room, but instead looks like a window into a ' +		   'strange scene. ';
        }

// drop helper function
function dropCoin(lst, uIn) {
	if (dreamcatcherTalk === 6) {
		dreamcatcherTalk = 7;
		instrumentRoom.things.push('dreamcatcher');
		return 'You place the coin on the turntable, with the grooved side up. As you let go, the needle falls ' +			   'onto the coin, and turntable begins spinning of its own volition. The gramophone starts playing a ' +			   'scratchy, indistinct sound. Soon, you can make out distinct drumbeats. The drums become clearer, '+			   'and as they do, you start to think of the diorama you saw earlier. A scratchy ' +			   'voice whispers indistinctly, "...of dreams... ...just as real..." ' +			   ' a popping sound interrupts the whispers, and the entire gramophone explodes open. I ' +			   'come flying out of ' +			   'the gramophone and land at your feet. The coin flies off of the turntable right into your hands. ';
	}
	if (dreamcatcherTalk < 6) {
		return 'As you are distracted with the gramophone, the mouse shadow climbs up your leg, and starts ' +			   'spreading like a puddle, but against gravity. You are somehow able to kick it off of you. ';
	}
	return 'The turntable is broken. ';
}


function enter(room) {
    /*the function that moves the player between cells when it
    is called, and also retrieves cell description and displays it*/
    //global currentRoom, inventory, dreamcatcherTalk
    if (room === outside && !searchArray('baby',inventory)) {
        return 'Wait! Please don\'t leave our son to his fate. Take him with you. ';
    }
    if (dreamcatcherTalk === 9 || dreamcatcherTalk === 10) {
        if (room === armorRoom) {
            dreamcatcherTalk = 11;
            currentRoom = room;
            return('\n\n~     ~     ~\n\n\n~     ~     ~\n\n\n                   Here our son sleeps. You have seen what will happen if you do not save him now. The storm is upon us, and so my time with you is at an end, for now. Take care, Awa. You see me put my hand on the baby\'s chest and as you watch, I become a dreamcatcher once more, this time hanging loosely around his neck on a thin string. '+'\n\n'+room.id+'\n'+room.describe());
        }
    }
    if (dreamcatcherTalk < 9) {
        if (searchArray('dreamcatcher',inventory)) {
            currentRoom = room;
            return(room.id+'\n'+room.describe());
        }
        else {
            if (currentRoom === atrium) {
                return getSleepy([],'You start to leave, but you stop yourself. You should pick up the dreamcatcher first. ');
            }
            else {
                return getSleepy([],'You start to leave, but you stop yourself. You get the sense that you were about to step off of the edge of a dark cliff. You should not go too far without me. ');
            }
        }
    }
    else {
        currentRoom = room;
        return(room.id+'\n'+room.describe());
        }
}

function examine(lst, uIn) {
	/* the function that controls what happens when the player
    examines something*/
    //uses global vars: tips, dreamcatcherTalk, mirrorMirror
    
    //empty exception
    if (lst.length === 0) {
        if (tips && uIn.contains('examine')) {
            return 'What do you want to examine? \n [TIP: You can abbreviate \'examine\' by using \'x\' instead]';
        } else { 
        	return 'What do you want to examine? '; 
        }
    }
    
    //walls floor ceiling
    var wallFloorCeiling = ["wall", "floor", "ceiling"];
    for (i=0; i<3; i++) {
        if (uIn.contains(wallFloorCeiling[i])) {
            if (i===0 && currentRoom === nativeAmerican) {
                break;
            }
            return "The "+wallFloorCeiling[i]+" is nondescript.";
        }
    }
    
    //dreamcatcher exception
    if (dreamcatcher.isIn(uIn)) {
        if (11 > dreamcatcherTalk && dreamcatcherTalk > 8) { 
        	return 'You see me as a familiar man, with brown eyes and short, curly, black hair. '; 
        }
        if (dreamcatcherTalk > 10) { 
        	return 'A familiar dreamcatcher. '; 
        }
    }
    
    //mirror exceptions
    if (uIn.contains('mirror')) {
    	return examineMirror();
    }
    
    // normal stuff
    for (var i=0; i<inventory.length; i++) {
        var item = inventory[i];
        if (itemDic[item].isIn(uIn)) {
            return(itemDic[item].description);
        }
    }
    for (var i=0; i<currentRoom.things.length; i++) {
		var item = currentRoom.things[i];
        if (itemDic[item].isIn(uIn)) {
            return(itemDic[item].description);
        }
    }
    var itemList = Object.keys(itemDic);
    for (var i=0; i<itemList.length; i++) {
		var item = itemList[i];
        if (itemDic[item].isIn(uIn)) {
            console.log(item);
            return 'You can\'t see that. ';
        }
    }
    var roomList = Object.keys(roomDic);
    for (var i=0; i<roomList.length; i++) {
	    var room = roomList[i];
        if (uIn.contains(room.lower())) {
            if (room === currentRoom.id) {
                return(currentRoom.describe());
            } else {
                return("You can't examine the "+room+" from here.");
            }
        }
    }
    if (uIn.contains('room') && !uIn.contains('marine')) {
        return(currentRoom.describe());
    }
    //self exception
    if (uIn.contains("self")) {
        if (dreamcatcherTalk < 4) {
            return("A perfectly average boy in every respect. The doctor said so. ");
        }
        if (dreamcatcherTalk === 5) {
            return("I... I don't remember...");
        }
        if (dreamcatcherTalk === 6) {
            return("My name is Awa. ");
        }
    }
    return("I do not know how to examine that");
}

// examine helper function
function examineMirror() {
        switch (mirrorMirror) {
        case 1:
            mirrorMirror = 2;
            break;
        case 2:
            mirror.description = 'You look into the mirror and see a small brown shed next to a big white house. In ' +'the distance some people or creatures are working in a green field. The image fades, replaced by a new one. ';
            mirrorMirror = 3;
            break;
	case 3:
            mirror.description = 'You look into a mirror and see a man. He is tall and his face looks kind. The' + ' man reaches towards the mirror. The image moves as though it is viewed through ' +	'someone\'s eyes. The image tilts down, following his hand, and you can see that it ' +							 'touches a bare abdomen. Another hand reaches in from outside the image and clasps ' +							 'his slowly. The image fades. ';
            mirrorMirror = 4;
            break;
	case 4:
            mirror.description = 'You look into the mirror and see a woman staring out of a window. Early autumn ' + 'light drifts through it and streams through the dust in the room she is in. ' +'She whips around to face the mirror, as though you startled her. Before you ' +							 'can say anything a figure blocks the image and starts walking toward the woman ' +							 'menacingly. You can feel your heartbeat increasing. As the figure reaches her, it ' +							 'grabs her roughly by the hand. The image fades. ';
            mirrorMirror = 5;
            break;
	case 5: 
            mirror.description = 'You look into the mirror and see a fight. Three men in plaid clothes are trying to ' + 'restrain a man in chains and rags. The chained man is on top of another man in ' +'a collared jacket, and is punching him savagely. A crowd has started to gather, ' +							 'someone in the crowd hands one of the plaid shirts a rifle. He takes it and aims it' +							 ' at the man in chains. You feel your stomach drop as the chained man flies back in ' +							 'a spray of blood and light. The image fades. ';
            mirrorMirror = 6;
            break;
	case 6:
            mirror.description = 'You look into the mirror and see the inside of a ship. Chained men and women lie ' +'together in the damp darkness. A woman suddenly springs to life and grabs a passing' + ' rat, and beings to devour it. An old man nearby begins shaking as tears roll down ' +'his face. The image fades. ';
            mirrorMirror = 7;
            break;	
	case 7:
        case 8:
        case 9:
        case 10:
        case 11:
            mirror.description = 'The mirror is like a window to pain. You don\'t want to look anymore. ';
            break;
            }
        return mirror.description;
}

function getSleepy(placeholder,str) {
    // uses globals: sleepy, currentRoom
    if (sleepy === 0) {
        sleepy +=2;
        return str+"You feel drowsy. Your mind becomes foggy. ";
    }
    if (sleepy === 1) {
        sleepy +=2;
        return str+"Your tiredness is compounded, you can barely... stay... awake... ";
    }
    if (sleepy>1) {
        if (!searchArray('dreamcatcher',inventory)) {
            currentRoom.things.remove('dreamcatcher');
            atrium.things.push('dreamcatcher');
        }
        sleepy = 0;
        currentRoom = atrium;
        return "You... so... sleepy... \n\n ~ ~ ~ ~ ~ ~ ~ \n\nYou wake up on the floor of the atrium. ";
    }
}

function Go(lst,uIn) {
    //global: currentRoom
    
    // empty excpetion
    if (lst.length<=0) { return("Where do you want to go?"); }
    var moveDic = {};
	moveDic['north'] =  goNorth;
	moveDic['east'] =  goEast;
	moveDic['south'] =  goSouth;
	moveDic['west'] =  goWest; 
	moveDic['up'] =  goUp;
	moveDic['down'] =  goDown;
    
    var moveList = Object.keys(moveDic);
    for (var i=0; i<moveList.length; i++) {
            if (uIn.contains(moveList[i])) {
                    return moveDic[moveList[i]](lst.slice(1),uIn);
            }
    }
    var roomList = Object.keys(roomDic);
    for (var i=0; i<roomList.length; i++) {
            var room = roomList[i];
            console.log(roomList);
            console.log(room);
            if (uIn.contains(room)) {
                    for (var i=0; i<4; i++) {
                            if (currentRoom.directions[i] === room) {
                                    return enter(roomDic[room]);
                            }
                    }
            }
    }
    return "That is not a recognized direction to go";
 }


function goNorth(lst,uIn){
    if (lst.length > 0) {
        if (verbDic[lst[0]] === goEast || verbDic[lst[0]] === goWest) {
            return 'You may only move in the four main cardinal directions';
        }
    }
    return move('N');
}
function goEast(lst,uIn){
    return move('E');
}

function goSouth(lst,uIn){
    if (lst.length > 0) {
        if (verbDic[lst[0]] === goEast || verbDic[lst[0]] === goWest) {
            return 'You may only move in the four main cardinal directions';
        }
    }
    return move('S');
}
        
function goWest(lst,uIn){
    return move('W');
}

function goUp(lst,uIn){
    return move('U');
}

function goDown(lst,uIn){
    return move('D');
}    

function help() {
    return '\nThis game is a work of interactive fiction. You control a character by typing commands into the box ' + 'at the top of the window, and your choices affect the story. To get you started, here are some basic ' + 'commands:\n**************************************\ngo, look, examine, pick up, put down. ' + '\n**************************************\n"Go" lets you go places. For example you can say ' + '"go north", or you can say "go to the ' + '[name of place you want to go]". You cannot always go where you want to, but you should be able to go ' + 'where you need to. \n"Look" lets you look at your surroundings. Look before you leap! \n"Examine" lets ' + 'you scrutinize the details of an object. Not everything can be examined, but you can feel free to try! ' + 'You never know what might give you a hint to the puzzle you are stuck on. \n"Pick up" or "take", lets ' + 'you take an object and put it in your inventory, which you can check by typing the command "inventory". ' + '\n"Put down" or "drop" lets you remove an item from your inventory and place it in the space you are in. ' + '\nIf you want to see ' + 'the list of shortcuts type "shortcuts"\nIf you want to see all the functional verbs, type "commands". \n\n';
}

function jump() {
    return('You hop. Nothing happens.');
}

function kill(lst,uIn) {
    if (lst.length === 0) {
        return 'What do you want to kill?';
    }
    if (uIn.contains('self') || uIn.contains(' me')) {
        return 'It may sound strange, but you cannot do that here. ';
    }
    if (dreamcatcher.isIn(uIn)) {
        return 'You cannot kill me. ';
    }
    if (baby.isIn(uIn)) {
        return 'Haha you must think you\'re so funny. But seriously, come on. ';
    }
    else {
        for (var i=0; i<lst.length; i++) {
            if (itemDic[lst[i]]) {
                return 'You cannot kill that which is not alive. ';
        	}    
        }
    return 'I do not know how you would kill that';
    }
}

function lift(lst,uIn) {
    for (var i=0; i<lst.length; i++) {
        if (searchArray(lst[i],currentRoom.things) || searchArray(lst[i],inventory)) {
            if (itemDic[lst[i]].size < 3) {
                return 'You lift the '+item+' but nothing happens. ';
            }
            else {
                return 'You can\'t lift that. ';
            }
        }
    }
}

function look(lst,uIn) {
    //global currentRoom
    if (lst.length === 0 || lst[0] === 'around') {
        return(currentRoom.id+'\n'+currentRoom.describe());
    }
    else {
        return examine(lst,uIn);
    }
}

function move(direction) {
    //the function that controls the player's movement
    var directions = ['N','E','S','W','U','D'];
    var dirNum = directions.indexOf(direction);
    
    // ladder exception
    if (direction === 'U') {
        if (searchArray('ladder', currentRoom.things)) {
            ladderTop.down = currentRoom.id;
            return enter(ladderTop);
    	}
    }
    // normal
	if (roomDic[currentRoom.directions[dirNum]]) {
		return enter(roomDic[currentRoom.directions[dirNum]]);
	}
	else {
		return currentRoom.directions[dirNum];
    }
}

function openThing(lst,uIn) {
    //global currentRoom global inventory global dreamcatcherTalk
    if (lst.length === 0) {
        return 'What do you want to open? ';
    }
    if (currentRoom === gemRoom && searchArray('key', inventory) && chest.loc === ' is lying on the floor, securely locked. ') {
        chest.loc = ' is lying open on the floor. ';
        mummies.dark = false;
        inventory.remove('key');
        currentRoom.things.push('mirror');
        dreamcatcherTalk = 3;
        return 'You open the chest. A shadow slithers out of it and darts off through the doorway to the south.' + 'At the bottom of the chest there is a small mirror. ';
    }
    if (currentRoom === gemRoom && chest.loc === ' is lying open on the floor. ') {
        return 'The chest is already open. ';
    }
    if (currentRoom === gemRoom && !searchArray('key', inventory)) {
        return 'You can\'t open the chest without a key. ';
    }
    return "I don't see how you could open that. ";
}

function openInventory(lst,uIn) {
    outputStr = '';
    if (inventory.length > 0) {
        outputStr+=('inventory:');
        for (var i=0; i<inventory.length; i++) {
            thing = inventory[i];
            outputStr+=('\n'+thing);
        }
    } else {
        return("empty");
    }
    return outputStr;
}

function playtest() {
    //global inventory, global dreamcatcherTalk
    dreamcatcherTalk = 3;
    nativeAmerican.things.remove('tree shadow');
    atrium.things.remove('dreamcatcher');
    inventory = ['dreamcatcher','mirror'];
    chest.loc = ' is lying open on the floor. ';
    dinos.dark = false;
    dinos.description = 'A deep room that contains many skeletal structures supported by metal ' +'bars. An enormous tyrannosaurus skeleton dominates the room, and the ' +'lights have been positioned to illuminate it from all angles. ';
    ladderTop.things.remove('key');
    gemRoom.dark = false;
    mummies.dark = false;
    return 'PLAYTEST SETUP COMPLETE';
}

function poke(lst,uIn) {
    if (lst.length>0) {
        return 'You accomplish nothing useful by this. ';
    }
    else {
        return 'Poke what? ';
    }
}

function pull(lst,uIn) {
    //global currentRoom;
    if (lst.length === 0) {
        return 'What do you want to pull? ';
    }
    if (dreamcatcher.isIn(uIn)) {
        if (searchList('dreamcatcher', currentRoom.things)) {
            return 'You pull me towards you. ';
        }
    }
    for (var item in currentRoom.things) {
        if (itemDic[item].isIn(uIn)) {
            if (itemDic[item].size<3) {
                return 'You pull the '+itemDic[item].id+' towards you. ';
            }  else {
                return 'It won\'t budge. ';
            }
        }
    }
    return 'You cannot pull that. ';
}

function push(lst,uIn) {
    //global currentRoom
    if (lst.length === 0) {
        return 'What do you want to push? ';
    }
    if (dreamcatcher.Isin(uIn)) {
        if (searchArray('dreamcatcher',currentRoom.things)) {
            return 'You push me. ';
        }
    }
	for (var i=0; i<currentRoom.things.length; i++) {
            item = currentRoom.things[i];
		if (itemDic[item].isIn(uIn)) {
			if (itemDic[item].size<3) {
				return 'You give the '+itemDic[item].id+' a shove. ';
			} else {
				return 'It won\'t budge. ';
			}
		}
    }
    return 'You cannot push that. ';
}

function putOn(lst,uIn) {
    if (lst.length === 0) {
        return "You can't put on nothing.";
    } else {
        return getSleepy([],"You try to put on "+lst[0]);
    }
}

function quitGame(lst,uIn) {
    exit();
}

function roomTest(lst,uIn) {
    str = ('This is the Room Test');
    currentRoom = 'Demo Room';
    test_room = roomDic[currentRoom];
    str += (test_room.describe());
    return str;
}

function setUpMuseum() {
    currentRoom = atrium;
    setAllRoomDirections();
    return currentRoom.id+'\n'+'Wake up. You are on the floor. You must hurry. The storm approaches. I will assist ' + 'you in any way I can. On the floor you can see a dreamcatcher. Pick it up.' + '\n [TIP: You can type "help" for instructions and commands.]' + '\n [TIP: Tips are ON. Type tipsOFF to turn tips OFF.]';
}

function shortcuts() {
    return 'n - go north\ne - go east\nw - go west\ns - go south\nu - go up\nd - go down\ninv - show inventory\n' + 'q - quit game\nl - look\nx or ex - examine';
}

function take(lst,uIn) {
    //global keyTaken, handsFull, currentRoom,inventory, dreamcatcherTalk
    if (lst.length === 0) {
        return 'What do you want to take? ';
    }
    // if the player tries to take something off
    if (uIn.contains(' off')) {
        return takeOff(lst.split(1),uIn); 
    }
    if (baby.isIn(uIn)) {
        inventory.push('baby');
        currentRoom.things.remove('baby');
        return 'You pick the baby up gently and cradle him in your arms. ';
    }
    // if the player is triggering the 'take my hand' event
    if (uIn.contains('hand')) {
        if (dreamcatcherTalk > 8) {
            if (searchArray('dreamcatcher', currentRoom.things)) {
                currentRoom.things.remove('dreamcatcher');
            }
            dreamcatcherTalk = 10;
            return 'You reach out your hand and slide your fingers through mine. As you do, the image of a tree ' + 'falling seeps into your mind. You then see a small brown cabin, and a baby asleep in a crib. ' + 'A woman sleeps nearby. While you watch, a tree crashes through the roof of the house. The woman ' + 'is instantly awake, but as the dust settles it is clear that the tree lands right on the crib. ' + 'Come now. You know why we are here. We haven\'t got much more time. I walk out through the ' + 'doorway to the west. ';
    	}
    }
    // if the player is triggering dreamcatcher events or just taking the dreamcatcher
    if (dreamcatcher.isIn(uIn)) {
        if (searchArray('dreamcatcher', currentRoom.things)) {
            if (dreamcatcherTalk === 9) {
                return take(lst,uIn+' hand');
            }
            inventory.push('dreamcatcher');
            currentRoom.things.remove('dreamcatcher');
            if (dreamcatcherTalk === 0) {
                return "You pick me up gently, and place me in your pocket. Let's get going, we haven't got much " +   "time to bring light before the storm. ";
            }
            if (dreamcatcherTalk === 1) {
                dreamcatcherTalk = 2;
                return "************\nLightning... Rain on face... The tree! The tree in the field is falling..." +   "\n************\n\n Hey, are you okay? Oh good. I couldn't see your thoughts for a second.";
            }
            if (dreamcatcherTalk === 2) {
                return  "You've got me now. Let's get going. ";
            }
            if (dreamcatcherTalk === 7) {
                dreamcatcherTalk = 8;
                marineLife.dark = false;
                return '\n*************************\n...before the angry men took... he couldn\'t protect... Awa, ' +   'take care of our baby... Awa... Awa... \n*************************\n\nAwa! Oh thank God ' +   'you\'re alright. I felt you were almost gone there. \nA light appears in the western doorway. ';
            }
        } else {
            if (searchArray('dreamcatcher',inventory)) {
                return "You already have me. ";
            } else {
                return "I am not here. ";
            }
        }
    // normal take operation
    } else {
        var str = "";
        for (var j=0; j<currentRoom.things.length; j++) {
            var thing = currentRoom.things[j];
            if (itemDic[thing].isIn(uIn)) {
                if (itemDic[thing].size<=(2-handsFull)) {
                    handsFull += itemDic[thing].size;
                    inventory.push(thing);
                    currentRoom.things.remove(thing);
                    // key event
                    if (thing === 'key') {
                        keyTaken = true;
                        dinos.description = 'A deep room that contains many skeletal structures supported by metal ' +      'bars. An enormous tyrannosaurus skeleton dominates the room, and the ' +      'lights have been positioned to illuminate it from all angles. ';
                    }
                    // coin event
                    if (thing === 'coin' && dreamcatcherTalk === 3) {
                        dreamcatcherTalk = 4;
                        slot.announce = true;
                        mummies.west = 'An enormous stone blocks the way. ';
                        mummies.north = 'An enormous stone blocks the way. ';
                        mummies.south = 'An enormous stone blocks the way. ';
                        sarcophagus.description = sarcophagus.description + " There is a two-inch diameter slot in the head. ";
                        setRoomDirections(mummies);
                        if (searchArray('mirror', inventory) || searchArray('mirror', currentRoom.things)) {
                            return 'You pry the coin out of the coffin, and it lands in your hand with a "pop". ' +     'Suddenly, enormous stones slide in front of all of the exits, trapping you inside. ';
                        } else {
                            for (r=0; r<Objects.keys(roomDic); r++) {
                                var room = Objects.keys(roomDic[r]);
                                if (searchArray('mirror', roomDic[room].things)) {
                                    roomDic[room].things.remove('mirror');
                                }
                            }
                            inventory.push('mirror');
                            return 'You pry the coin out of the coffin, and it lands in your hand with a "pop". ' +     'Suddenly, enormous stones slide in front of all of the exits, trapping you ' +     'inside. Hmm. You\'re missing something. I\'ll just get it for you. You feel ' +     'something fall into your pocket. ';
                        }
                    }       
                    str = (thing+" taken.");
                    return str;
                } else {
                    str = ('You cannot take the '+thing);
                    if (handsFull > 0 && itemDic[thing].size < 3) {
                        str = ('You will have to drop something if (you want to take something else');
                    }
                }
            } 
            if (searchArray(thing, inventory)) {
                str = ('You already have that. ');
            }
        }
        if (str.length === 0) {
            str = ("I cannot see how you could take that. ");
        }
        return str;
    }
}

 

function takeOff(lst,uIn) {
    if (lst[0].lower() === 'clothes') {
        return getSleepy([],"You attempt to take off your clothes. ");
    }
    else {
        return "You can't take off something you're not wearing";
    }
}

function talk(lst, uIn) {
    if (lst.length === 0) {
        return "There is no one here besides me and you. Would you like to talk about me (dreamcatcher), you, the light, or the " +     "storm?";
    }
    if (dreamcatcher.isIn(uIn)) {
        if (dreamcatcherTalk < 8) {
            return "My name is dreamcatcher. I am a part of the whole, as are you. I believe that I was created to guide you. " + "I can see everything you think, and you can hear me even though I do not speak. ";
        } else {
            return "My name is known to you. We were once one, before I had to leave your world. But we will meet again " + "in another life. ";
        }
    }
    if (uIn.contains('me')) {
        if (dreamcatcherTalk < 5) {
            return 'You appear like an ordinary boy of fourteen years of age. However, your spirit has known many ' +     'lifetimes besides this one, and will yet know many more. ';
        } else {
            return 'You are Awa. ';
        }
    }
    if (uIn.contains('light')) {
        return 'I do not know much about the light, only that darkness has taken its place, and you must restore ' +     'the light before we can return to the whole. And you must return to the whole before the storm, ' +     'or we will be trapped in darkness forever. ';
    }
    if (uIn.contains('storm')) {
        return 'When I was created, I was instilled with the knowledge of the storm which will bring the void to consume ' +     'us if you are not able to restore the light. ';
    } else {
        return "There is no one here besides me and you. Would you like to talk about me (dreamcatcher), you, the light, or the " +     "storm?";
    }
}


function tipsOn() {
    tips = true;
    return "Tips are now on.";
}

function tipsOff() {
    tips = false;
    return "Tips are now off.";
}

function use(lst,uIn) {
    //global tips
    if (mirror.isIn(uIn) && searchArray(sarcophagus.id,currentRoom.things) && searchArray(mirror.id,inventory)) {
        return dropMirror(lst,uIn);
    }
    if (sarcophagus.isIn(uIn) && searchArray(sarcophagus.id,currentRoom.things) && searchArray(mirror.id,inventory)) {
        return dropMirror(lst,uIn);
    }
    if (gramophone.isIn(uIn)) {
        if (searchArray('gramophone', currentRoom.things)) {
            if (dreamcatcherTalk === 6) {
                if (searchArray('coin', inventory)) {
                    return drop(lst,uIn+' coin');
                } else {
                    return 'Nothing you try brings the gramophone to life. The absence of any sort of record irks you. ';
                }
            }
            if (dreamcatcherTalk < 6) {
                return 'As you are distracted with the gramophone, the mouse shadow climbs up your leg, and starts ' +   'spreading like a puddle, but against gravity. You are somehow able to kick it off of you. ';
            } else {
                return 'The gramophone is broken. ';
            }
        } else {
            return 'You don\'t see a gramophone';
        }
    }
    if (chest.isIn(uIn)) {
        return openThing(lst, uIn);
    }
    if (key.isIn(uIn)) {
        return openThing(lst ,uIn);
    }
    if (tips) {
        return 'I do not understand [item\'s function is unspecified]';
    }
    else {
        return 'I do not understand';
    }
}

function wakeUp() {
    return "You are already awake. ";
}

function yes() {
    return '';
}
  
// Dictionary of usable verbs
verbDic = {};

verbDic['rt'] = roomTest; 
verbDic['tipsON']= tipsOn;   
verbDic['tipsOFF'] = tipsOff;
verbDic['wake'] = wakeUp;
verbDic['kill'] = kill;
verbDic['shortcuts'] = shortcuts;          
verbDic['jump'] =jump;
verbDic['get'] = take;
verbDic['pull'] = pull;
verbDic['enter'] = Go;
verbDic['playtest'] = playtest;   
verbDic['lift'] = lift;
verbDic['push'] = push;
verbDic['yes'] = yes;
verbDic['climb'] = climb;        
verbDic['set'] = drop;

verbDic['exit'] = quitGame; 
verbDic['quit'] = quitGame; 
verbDic['q'] = quitGame;
 
verbDic['go'] = Go; 
verbDic['walk'] = Go; 

verbDic['n'] = goNorth;
verbDic['north'] = goNorth;

verbDic['e'] = goEast; 
verbDic['east'] = goEast; 

verbDic['s'] = goSouth; 
verbDic['south'] = goSouth; 

verbDic['w'] = goWest;
verbDic['west'] = goWest; 

verbDic['u'] = goUp; 
verbDic['up'] = goUp; 

verbDic['d'] = goDown; 
verbDic["down"] = goDown; 

verbDic['help'] = help; 
verbDic['"help"'] = help;

verbDic['inv'] = openInventory; 
verbDic['inventory'] = openInventory;

verbDic['grab'] = take;
verbDic['take'] = take;  
verbDic['pick'] = take;

verbDic['drop'] = drop;
verbDic['put']= drop;
verbDic['place'] = drop;

verbDic['ex'] = examine;
verbDic['x'] = examine;
verbDic['examine'] = examine;

verbDic['look'] = look;
verbDic['l'] = look;

verbDic['talk'] = talk;
verbDic['speak']= talk;
verbDic['shout'] = talk;
       
verbDic['advanced_help'] = advancedHelp; 
verbDic["advanced help"] = advancedHelp;
verbDic['advanced'] = advancedHelp; 
        
verbDic['commands'] = commands;

verbDic['break'] = breakThing;
verbDic['punch'] = breakThing;
verbDic['hit'] = breakThing;
verbDic['push']= breakThing;


verbDic['use'] = use;
verbDic['extend'] = use;

verbDic['touch'] = poke;
verbDic['feel'] = poke;
verbDic['poke'] = poke;    

verbDic['open'] = openThing;
verbDic['unlock'] = openThing;


// ****************************************************************
// The verb selector function
function read(uIn) {
    /* parses the input by assuming that the first word will be the verb
    checks to see if the verb is known and then passes a list
     containing the space-separated words from the the user input,
     and the original input string, respectively, to the verb functions
     that it calls. Each verb has its own function abave. */
    // uses global vars: tips, sleepy
    var verbKeys = Object.keys(verbDic);
    if (searchArray(uIn.split(' ')[0],verbKeys)) {
        // double checking
        if (uIn.length>0) {
            ccmesssage = conditionCheck(uIn);
            if (ccmesssage === 'OK') {
                if (sleepy > 0) {
                    sleepy -= 1;
                }
                var lst = uIn.split(' ').slice(1);
                lst = defaultList(lst);
                uIn = defaultList(uIn);
                return( verbDic[uIn.split(' ')[0].lower()](lst,uIn) );
            }
            else { 
            	return ccmesssage; 
            }
        }
        if (tips) {
            return("I don't understand. [Verb \""+uIn.split(' ')[0]+"\" not recognized.] \n [TIP: You can type help for instructions and commands.]"+"\n [TIP: Tips are ON. Type tipsOFF to turn tips OFF.]");
        } else {
            return("I don't understand");
        }
    }
    return("I don't understand");
}

// ***************** UI *******************

var output;
var input;
function inputClicked() {
	document.getElementById("bounds").removeChild(document.getElementById("sticky"));
	input.removeEventListener("click", inputClicked);
}
function clearOnce() {
	input.value = ""; 
	//document.getElementById("bounds").removeChild(document.getElementById("sticky")); 
	input.removeEventListener("focus", clearOnce);
}
// converts "\n" to "<br>"
function translateLineBreaks(str) {
	for (i=0; i<str.length;i++) {
		if ( str.substring(i,i+1) === "\n") {
			return str.substring(0,i)+"<br>"+translateLineBreaks(str.substring(i+1,str.length));
		}
	}
	return str;
}

function handleInput(event) {
	// user presses enter in 
	if (event.keyCode === 13) {
		console.log(input.value);
		output.innerHTML = output.innerHTML +"<br>"+"<i>"+ input.value +"</i>"+"<br>"+translateLineBreaks(read(input.value));
		input.value="";
		var scrollWindow = document.getElementById("scroll");
		scrollWindow.scrollTop = scrollWindow.scrollHeight;
	}
}

function init() {

	output = document.getElementById("output");
	input = document.getElementById("uIn");

	input.addEventListener("click", inputClicked);
	
	input.value = "Enter commands here";
	input.addEventListener("focus", clearOnce);

	
	input.addEventListener('keypress', handleInput);

	// start the game
	output.innerHTML = translateLineBreaks(setUpMuseum());

}

window.addEventListener("load",init);