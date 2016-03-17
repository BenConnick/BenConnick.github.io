#!/usr/local/bin/python3

__doc__="""
Museum
An Interactive Fiction Demo
Author: Ben Connick
Language: Python 3.3.2
(c) 2013
"""

import tkinter

#Museum IF

class Item(object):
    """things which can be picked up
    ID is the full name of the item and its key in the dictionary
    description is what is printed when the item is examined
    size is how many inventory spaces it takes up (one or two). If you want the item to be immovable, set size > 2
    location is where the item is within the room
    interaction is a dictionary of functions that can be called (often these functions will make use of the state
    property). Not every item is going to be interactive, it's there just in case.
    state is an optional value for a piece of scenery in case it changes
    Article is 'A' 'An' or 'The'
    """
    def __init__(self,ID = 'blank', description = 'looks pretty ordinary', size=1,location=' is on the floor. ',
                 announce = True, article='A ',interaction = {}, state = '',synonyms = []):
        self.ID = ID
        self.description = description
        self.size = size
        self.location = location
        self.interaction = interaction
        self.state = state
        self.article = article
        self.announce = announce
        self.synonyms = synonyms
    def brief(self):
        return (self.article+self.ID+self.location)
    def isIn(self,str):
        #checks if the word or any of its synonyms are mentioned
        if self.ID.lower() in str.lower():
            return True
        for syn in self.synonyms:
            if syn.lower() in str.lower():
                return True
        return False

class Room(object):
    """rooms are the places where players spend all of their time.
    Each room is a cell.
    ID is used to connect rooms and to title them. It is also the room's key in the dictionary
    description is what is printed when the player enters the room.
    north and the other directions hold the ID's of adjacent accessible rooms. If no other room is accessible from a
        direction, it is a description of why the player cannot move that direction.
    things is an object list of thing objects that are in the room
    """
    def __init__(self,ID = 'blank', description = '', north = 'There is a wall there',
                 east = 'There is a wall there', south = 'There is a wall there',
                 west = 'There is a wall there', up = "You can't go up", down = "You can't go down",
                 condition = 'normal', things = []):
        self.ID = ID
        self.description = description
        self.north = north
        self.east = east
        self.south = south
        self.west = west
        self.up = up
        self.down = down
        self.condition = condition
        self.things = things
    def describe(self):
        stuffDesc = ''
        if len(self.things) > 0 and 'An unnatural darkness makes it impossible to see in here. ' not in self.condition:
                for thing in self.things:
                     if itemDic[thing].announce:
                        stuffDesc += itemDic[thing].brief()
        if self.north in roomDic:
            if roomDic[self.north].condition == 'normal':
                stuffDesc+='\nThere is a light coming from the doorway to the north. '
        if self.east in roomDic:
            if roomDic[self.east].condition == 'normal':
                stuffDesc+='\nThere is a light coming from the doorway to the east. '
        if self.south in roomDic:
            if roomDic[self.south].condition == 'normal':
                stuffDesc+='\nThere is a light coming from the doorway to the south. '
        if self.west in roomDic:
            if roomDic[self.west].condition == 'normal':
                stuffDesc+='\nThere is a light coming from the doorway to the west. '
        if self.condition == 'normal':
            return (self.description+stuffDesc)
        else:
            return self.condition + stuffDesc

class Scenery(object):
    #scenery not implemented
    def __init__(self,IDs=['unnamed'],description='nondescript'):
        self.IDs = IDs
        self.description = description

#********* - global game conditions - ************
# the sleepiness of the player
sleepy = 0
# whether the player has the equipped flashlight on or not
tips = True
dreamcatcherTalk = 0
gameOver = False
"""
one time events
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
11 - entered house
"""
keyTaken = False
mirrorMirror = 0

#****************************************************
# list of all scenery
sceneryDic = {}

compass = Scenery(IDs=['compass','rose','star','engraving'],
                  description='An engraving of an eight pointed compass rose. The four primary cardinal '
                              'directions each point to an archway ')


#**************************************************
#                     ITEMS
#**************************************************
#list of all items
itemDic = {}

table = Item(ID = 'table', size = 9)
itemDic['table'] = table

chair = Item(ID = 'chair', size = 2)
itemDic['chair'] = chair

ladder = Item(ID='ladder', description='an ordinary collapsible ladder',size = 10,article='There is a ',
              location=' standing upright by the t-rex. ',announce=True)
itemDic['ladder'] = ladder

key = Item(ID='key', description='A worn brass skeleton key. ',size = 1,article = 'The ',
           location=' hangs from the tooth of the t-rex. ', announce=True)

dreamcatcher = Item(ID= 'dreamcatcher', description="You look me over carefully. You see that my body is "
                                                    "composed of a willow loop, with a string wrapped around so as to "
                                                    "create a web-like pattern in the center. Eight hide strips hang "
                                                    "down from me, and they have been threaded through many colorful "
                                                    "beads. At the end of each of the strips are small goose feathers. ",
                    size = 0, article = 'I (', location= ') am nearby on the floor. ')
itemDic['dreamcatcher'] = dreamcatcher
itemDic['dreamcatcher'].synonyms = ['you']

dancerDiorama = Item(ID = 'dancer', description="The masks of the dancers draw you in to their circle "
                                                        "and you can almost feel the heat of the fire. You feel a "
                                                        "sense of deja vu, like this has happened before. Your eye "
                                                        "falls on the placard that is hung on the wall by the diorama. "
                                                        "One part in particular catches your eye, \"The Ojibwa masks "
                                                        "are themselves spirits, with magical properties. Many Native "
                                                        "Americans believed that like the spirit world, \n\nthe "
                                                        "experiences of dreams are just as real as waking experiences."
                                                        "\"\n\nHmm. That's interesting.",
                     size = 10, article='The ',location=' is set into an alcove of the wall, behind some glass. ',
                     announce=False)
itemDic['dancer'] = dancerDiorama
itemDic['dancer'].synonyms = ['dancers','diorama','Indians']

artifacts = Item(ID = 'artifacts', description="Various bows, headdresses and painted animal skins. None of which "
                                               "hold any particular value or interest for you. ",size=10,
                 article='The ', location=' hang on hooks in the wall behind the glass. ',announce=False)
itemDic['artifacts'] = artifacts
itemDic['artifacts'].synonyms = ['artifact','wall']

shadow = Item(ID = 'tree shadow', description="It is an unnatural silhouette of an ominous, leafless tree. Never mind "
                                              "that there are no trees to be seen, I can tell that this shadow does not "
                                              "belong here. If you place me on it, I may be able to do something about "
                                              "it. ", article='A strange ', size=10)
itemDic['tree shadow'] = shadow
itemDic['tree shadow'].synonyms = ['tree','shadow','silhouette']

tyrannosaurus = Item(ID = 'tyrannosaurus',description="The massive bones are as awe inspiring now as you remember them "
                                                      "being when you were young. ", article="The ",announce=False,
                     size=10)
itemDic['tyrannosaurus'] = tyrannosaurus
itemDic['tyrannosaurus'].synonyms = ['trex','t-rex']

chest = Item(ID = 'chest', description="The chest is made of a red varnished wood with a swirling grain. The showy "
                                       "golden lock seems solid. It looks like a skeleton key would fit the keyhole. ",
             article='A large, ornate ',
             location = ' is lying on the floor, securely locked. ',size=10)
itemDic['chest'] = chest
chest.synonyms = ['lock']

mirror = Item(ID = 'mirror', description="The tiny, circular mirror, about two inches in diameter, reflects everything "
                                         "as it should, except when you point "
                                         "it at yourself. In the mirror you appear as a tall, dark haired woman in "
                                         "colonial-era servant's clothes. ",
              announce=True,location = ' is in the chest. ')
itemDic['mirror'] = mirror

skeletons = Item(ID = 'skeletons' ,
                 description='The carefully arranged skeletons fill you with a sort of sadness. They remind you how '
                             'lifeless this room is. ',announce=False)

itemDic['skeletons'] = skeletons
skeletons.synonyms = ['bones','dinosaurs','skeletal']

gems = Item(ID='gems',description='The stones sparkle brightly in every conceivable color of the rainbow.'
                                  ' They are securely locked behind shatter-proof glass. ',
            announce=False,size=10)
itemDic['gems'] = gems
gems.synonyms = ['gem','diamond','ruby','saphire','emerald','cases','case','stones']

sarcophagus = Item(ID = 'sarcophagus',
                   description='A wooden sarcophagus. Its shape resembles a stylized man wearing pharoah\'s garb. '
                               'It looks heavy. ',
                   size = 10, announce=False)
itemDic['sarcophagus'] = sarcophagus
sarcophagus.synonyms = ['coffin','mummy']

slot = Item(ID= 'slot',
            description= 'A shallow, circular slot about two inches in diameter. ', size = 10, announce = False,
            location = ' is set into the forhead of the sarcophagus. ')
itemDic['slot'] = slot

coin = Item(ID = 'coin',
            description='A wide, golden coin about two inches in diameter. The coin sports a stylized eagle on one '
                        'side and fine concentric grooves on the other. The coin has a small hole in its center. ',
            article='A golden ', location=' is set into the slot in the forhead of the sarcophagus. ',size=0)
itemDic['coin'] = coin

finds = Item(ID = 'finds',description='These displays showcase brittle reminders of an age long past; dead memories'
                                      ' in wood, porcelain and gold. ')

instruments = Item(ID = 'instruments', article= 'The ', location=' are here. ', size = 10, announce = False,
                   description='A variety of instruments, some contemporary, others dating back to the prehistoric '
                               'age.')
itemDic['instruments'] = instruments
instruments.synonyms = ['piano','guitar','flute','drum']

gramophone = Item(ID='gramophone', size = 10, article= 'There is a ', location = ' here. ',
                   description = 'It is an early gramophone-turntable with no record on it. As you look at it, you '
                                 'unconsciously feel the coin in your pocket, and realize that the hole in it is the '
                                 'same size as the one that a record for the gramophone\'s would have. ')
itemDic['gramophone'] = gramophone
gramophone.synonyms = ['record player','phonograph']

mouseShadow = Item(ID = 'mouse shadow',
                   description='An unnatural mouse shadow that is similar to that of the tree from earlier. If you '
                               'place me on it, I may be able to do something about it. ', size = 10)
itemDic['mouse shadow'] = mouseShadow
mouseShadow.synonyms = ['shadow','mouse']

snakeShadow = Item(ID= 'snake shadow',
                   description='That infernal shadow! It looks sluggish and weak from earlier. If you place me on it, '
                               'we can finish this once and for all. ',size = 10,
                   location=' is curled up in a dark corner. ')

itemDic['snake shadow'] = snakeShadow
snakeShadow.synonyms = ['shadow','snake','corner']

tanks = Item(ID = 'tanks',
             description='There are tanks of various sizes. Mostly vapid and depressing. Containing drab fish that are '
                         'listless, lifeless or both. ', size=10,announce=False)
itemDic['tanks'] = tanks
tanks.synonyms = ['shelf','tank']

fish = Item(ID = 'fish', description='You stare into the eye sockets of a dead fish. The empty darkness stares back.'
                                     ' Other fish drift slowly around, seemingly aware of the pointlessness of '
                                     'their existence. ',size=10, announce=False)
itemDic['fish'] = fish

specimens = Item(ID='specimens',description='Some pickled creatures too strange and hideous for words. ',size=10,
                 announce = False)
itemDic['specimens'] = specimens
specimens.synonyms = ['specimen','pickled','deep','crustacean']

crib = Item(ID='crib',description='A plain and rudimentary crib, with no fancy ornamentation or paint, but made '
                                  'with the utmost care and affection. ',
            size = 5)
itemDic['crib'] = crib

baby = Item(ID='baby',description='Your son breathes softly, his face free of worry. ',size = 2,
            article='A ',location=' is in the crib. ')
itemDic['baby']=baby
baby.synonyms = ['son','baby','child']

armor = Item(ID='armor',description='Flickering images that you can only see when you don\'t look directly at them.',
             size=10,article='The ',location=' are glowing softly in your vision. ',announce=False)
itemDic['armor']=armor

#**************************************************
#                     ROOMS
#**************************************************

demoRoom = Room(ID = 'Demo Room', down = 'Demo Basement', description = 'This is a rather boring room. '
                                                                        'There is a staircase leading down. ',
                things=['table', 'chair'])

currentRoom = Room()

demoBasement = Room(ID = 'Demo Basement', up = 'Demo Room', description = "It's too dark to see down here")

atrium = Room(ID = 'Atrium',
              description = 'A large octagonal room, with huge, off-white and black, square stone tiles covering '
                            'the floor. The ceiling is an unornamented stone dome. '
                            'Four enormous banners are suspended over four corresponding archways, '
                            '\nthe north facing one reads\n  "Native American Exhibit"\n'
                            'the east facing one,\n  "Ancient Egypt Exhibit" \nthe south facing one,\n  "Marine Life '
                            'Room" \nand the west facing banner reads,\n  "Space and Aeronautics Exhibit".\n'
                            'The center tile has a small engraving in the shape of an eight pointed compass rose. ',
              north = 'Native American Exhibit',
              east = 'Ancient Egypt Exhibit',
              south = 'Marine Life Room',
              west = 'Space and Aeronautics Exhibit',
              things=['dreamcatcher'])

nativeAmerican = Room(ID = 'Native American Exhibit',
                      description = 'A dim room with glass-covered walls displaying artifacts. A diorama shows masked '
                                    'Indians dancing around a fire pit. ',
                      south = 'Atrium',
                      east = 'Minerology Exhibit',
                      west = 'Paleontology Exhibit',
                      things = ['dancer','artifacts','tree shadow'])

space = Room(ID = 'Space and Aeronautics Exhibit',
             description = 'A high ceilinged room with images of the progress of manned flight covering the walls. '
                          'Airplanes and space shuttles hang from the roof on powerful wires. ',
             north = 'Paleontology Exhibit',
             east = 'Atrium',
             south = 'Armor Exhibit',
             condition = "An unnatural darkness makes it impossible to see in here. ")

dinos = Room(ID = 'Paleontology Exhibit',
             description= 'A deep room that contains many prehistoric skeletons supported by metal bars. An enormous '
                          'tyrannosaurus skeleton dominates the room, and the lights have been positioned to illuminate '
                          'it from all angles. The lights glint off of something shiny in the tyrannosaur\'s mouth. ',
             east = 'Native American Exhibit',
             south = 'Space and Aeronautics Exhibit',
             condition = "An unnatural darkness makes it impossible to see in here. ",
             things=['ladder','tyrannosaurus'])

gemRoom = Room(ID = 'Minerology Exhibit',
               description= 'The room is a veritable maze of glass. Everywhere there are long cases, short cases, tall '
                            'cases, all displaying minerals and gem stones in varying sizes. ',
               west = 'Native American Exhibit',
               south = 'Ancient Egypt Exhibit',
               condition = "An unnatural darkness makes it impossible to see in here. ",
               things = ['chest','gems'])


mummies = Room(ID = 'Ancient Egypt Exhibit',
               description= 'A cozy, carpeted room with a few displays showcasing various tomb finds. The lights are '
                            'notably warm in color, and the displays part in the center of the room where a wooden '
                            'sarcophagus sits. ',
               north = 'Minerology Exhibit',
               south = 'History of Music Exhibit',
               west = 'Atrium',
               condition = "An unnatural darkness makes it impossible to see in here. ",
               things = ['sarcophagus','coin','slot'])

instrumentRoom = Room(ID = 'History of Music Exhibit',
                      description = 'A round, coolly lit room packed with exquisite musical instruments on pedestals '
                      'of varying heights. ',
                      north = 'Ancient Egypt Exhibit',
                      west = 'Marine Life Room',
                      condition = "An unnatural darkness makes it impossible to see in here. ",
                      things = ['instruments','gramophone','mouse shadow'])

marineLife = Room(ID = 'Marine Life Room',
                  description = 'A thin, hallway-like room with tanks on either side. Most appear empty, or contain '
                                'dull colored fish. One space is doused in blue light, and contains shelves with '
                                'tiny tanks, in which crustacean-like specimens float motionless. A titlecard informs'
                                ' you that the shelf contains creatures who lived in the parts of the ocean "Deeper '
                                'than Light". ',
                  west = 'Armor Exhibit',
                  north = 'Atrium',
                  east = 'History of Music Exhibit',
                  condition = "An unnatural darkness makes it impossible to see in here. ",
                  things=['tanks','fish','specimens','snake shadow'])


armorRoom = Room(ID = 'Armor Exhibit',
              description = 'You are in a small wooden cabin with only one room. Flashes of lightning cast blueish '
                            'luminescence. '
                            'onto the floor. There is a door on the north side of the house. As though the walls are '
                            'translucent, you can see through them to '
                            'ghostly images of suits of armor hanging on stands. Outside, the wind howls. ',
              north = 'Space and Aeronautics Exhibit',
              east = 'Marine Life Room',
              condition = "An unnatural darkness makes it impossible to see in here. ",
              things=['crib','baby','armor'])

ladderTop = Room(ID = 'Top of the Ladder', description= 'You stand on the top of the collapsible ladder. ',
                 things=['key','tyrannosaurus'],
                 north = 'Careful! Don\'t fall! ',
                 east = 'Careful! Don\'t fall! ',
                 south = 'Careful! Don\'t fall! ',
                 west = 'Careful! Don\'t fall! ')

outside = Room(ID='Outside',description='You are outside. ',condition='normal')

itemDic['key'] = key

"""************** - Some Player Variables - ******************"""
#player space
handsFull = 0

#player inventory
inventory = []

#list of rooms
roomDic = {'Demo Room' : demoRoom, 'Demo Basement' : demoBasement, 'Atrium' : atrium,
           'Native American Exhibit' : nativeAmerican, 'Space and Aeronautics Exhibit' : space,
           'Paleontology Exhibit' : dinos, 'Minerology Exhibit' : gemRoom, 'Ancient Egypt Exhibit' : mummies,
           'History of Music Exhibit' : instrumentRoom, 'Marine Life Room' : marineLife, 'Armor Exhibit' : armorRoom,
           'Top of the Ladder' : ladderTop, 'Outside' : outside}

#**************************************************
#                  Functions
#                (Alphabetical)
#**************************************************

def advancedHelp(*args):
    return 'Advanced Help Test'

def breakThing(*args):
    return getSleepy('You ought not do that... ')

def climb(lst=[], uIn=''):
    if 'ladder' in uIn and 'ladder' not in currentRoom.things:
        return 'You cannot see a ladder. '
    return goUp(lst,uIn)
    return 'You cannot climb'

def conditionCheck(uIn=''):
    """RETURNS TRUE OR FALSE!!!
    checks for conditions that should carry out exceptions before or instead of the
    normal response to a player action"""
    # the variable that says whether or not the program should carry on as it was
    global lightsOff
    global inventory
    global currentRoom
    global gameOver
    if gameOver:
        if 'yes' in uIn:
            exit()
        if 'q' in uIn:
            return 'OK'
        return 'Would you like to exit? '
    if currentRoom == outside:
        gameOver = True
        return 'Suddenly, you hear a snapping sound. \n\nYou turn around to see the trunk of an enormous, bent oak ' \
               'snap with a loud "crack!" and fall towards the house. \n\nYou suddenly feel alert. ' \
               'You can feel the rain on your face, all remnants of your dream (for surely it was) vanish, and your ' \
               'powerful legs propel you forward, just as the tree lands with a crash, tearing a hole through ' \
               'the cabin. \n\nYou look behind you at where you were standing moments ago, and see a great branch ' \
               'impaled into the ground. \n\nBut you are not there, you are here, with your son safe in your arms. ' \
               '\n\nThe rain begins to let up, and soon it stops altogether. The clouds part, and the moonlight ' \
               'falls on your son, who is wearing an odd dreamcatcher around his neck. You wonder where it ' \
               'came from, and for a moment, you almost remember. But then you push it from your mind and head back ' \
               'into what\'s left of your house to dry off before the morning comes. \n\nThe End\n\nThank you for ' \
               'playing.'
    if 'ladder' not in uIn and 'dream catcher' not in uIn and 'slot' not in uIn:
        return 'OK'
    if 'ladder' in uIn.lower() and 'ladder' in currentRoom.things:
        ladderTop.down = currentRoom.ID
        enter(ladderTop)
        return 'You climb up the ladder. '+'\n'+look()
    elif 'ladder' in uIn and currentRoom == ladderTop:
        enter(roomDic[ladderTop.down])
        return 'You climb down the ladder. '+'\n'+look()
    elif 'ladder' in uIn and 'ladder' not in currentRoom.things:
        return 'You cannot see a ladder. '
    if 'dream catcher' in uIn:
        return 'Dreamcatcher is a name. Please use one word (dreamcatcher), to refer to dreamcatcher.'
    if 'slot' in uIn and dreamcatcherTalk == 4:
        if 'x ' in uIn or ' ex' in uIn:
            if 'mirror' in inventory:
                return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ')[1:],uIn)+\
                       ' The slot is just the right size for the mirror. '
            else:
                return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ')[1:],uIn)+\
                    ' The slot is circular, shallow, and about two inches in diameter. '
    if 'coin' in uIn and dreamcatcherTalk == 4:
        if 'x ' in uIn or ' ex' in uIn:
            if 'mirror' in inventory:
                return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ')[1:],uIn)+\
                       ' The coin is almost exactly the same shape as the mirror... '
            else:
                return verbDic[uIn.split(' ')[0].lower()](uIn.split(' ')[1:],uIn)+\
                    ' The coin is almost exactly the same shape as the mirror... '
    return 'OK'

def commands(*args):
    str = ''
    for key in verbDic:
        str+=key+', '
    return(str)

def drop(lst=[],uIn=''):
    global handsFull
    global currentRoom
    global inventory
    global dreamcatcherTalk
    global mirrorMirror
    if len(lst) == 0:
        return 'What do you want to drop? '
    target = ''
    itemToDrop = ''
    dreamcatcherYES = False
    shadowYES = False
    if 'dreamcatcher' in uIn or 'you' in uIn:
        dreamcatcherYES = True
    if dreamcatcherYES:
        if 'dreamcatcher' in inventory and 'tree shadow' in currentRoom.things:
            currentRoom.things.remove('tree shadow')
            inventory.remove('dreamcatcher')
            currentRoom.things.append('dreamcatcher')
            itemDic['dreamcatcher'].location = (') am on the floor. ')
            gemRoom.condition = 'normal'
            dinos.condition = 'normal'
            dreamcatcherTalk = 1
            return 'You take me out of your pocket and set me on the shadow. At first nothing happens, ' \
                   'then, like a vacuum, the shadow begins moving towards me, shrinking until it is smaller than ' \
                   'a dog. Suddenly, it darts off to the west. Be careful when picking me up. Light appears in the ' \
                   'doorways to the east and west.'
        elif 'dreamcatcher' in inventory and 'mouse shadow' in currentRoom.things:
            instrumentRoom.things.remove('mouse shadow')
            inventory.remove('dreamcatcher')
            dreamcatcherTalk = 6
            if 'coin' in inventory or 'coin' in currentRoom.things:
                return 'You set me down on the mouse shadow, but it darts out of the way. It turns into a snake shadow ' \
                   'and wraps around me, cloaking me in darkness until you can\'t see me. Then it slithers under the ' \
                   'gramophone. '
            else:
                for room in roomDic:
                    if 'coin' in roomDic[room].things:
                        roomDic[room].things.remove('coin')
                inventory.append('coin')
                return 'You set me down on the mouse shadow, but it darts out of the way. It turns into a snake shadow ' \
                   'and wraps around me, cloaking me in darkness until you can\'t see me. Then it slithers under the ' \
                   'gramophone. Hmm you\'re missing something. Ah! There it is. You feel something fall into your ' \
                   'pocket. '
        elif 'dreamcatcher' in inventory and 'snake shadow' in currentRoom.things:
            currentRoom.things.remove('snake shadow')
            inventory.remove('dreamcatcher')
            currentRoom.things.append('dreamcatcher')
            armorRoom.condition='normal'
            armorRoom.north = 'Outside'
            armorRoom.east = 'There is a hazy wall there. '
            dreamcatcherTalk = 9
            for room in roomDic:
                roomDic[room].description  = roomDic[room].description + 'You hear the pounding of heavy rain above you. '
            return 'You set me down on the snake shadow. It flicks and writhes, distorting into strange shapes and ' \
                   'spasming across the walls and floor. But eventually it gets smaller, and smaller, and smaller ' \
                   'until it dissapears altogether. You notice the sound of rain hitting wood coming from above you. ' \
                   'You look up, and to your surprise the ceiling is comprised of wooden planks. When you look back ' \
                   'down, you see that I no longer take the form of a dreamcatcher, but instead resemble a familiar ' \
                   'man, with brown eyes and short, curly hair. Take my hand Awa. We\'re almost done here. The ' \
                   'darkness is gone now, but the storm has just begun. '
    if baby.isIn(uIn) and dreamcatcherTalk > 10:
        return('You decide against setting your son down. ')
    if 'coin' in uIn and gramophone.isIn(uIn) and 'gramophone' in currentRoom.things:
        if 'coin' in inventory:
            if dreamcatcherTalk == 6:
                dreamcatcherTalk = 7
                instrumentRoom.things.append('dreamcatcher')
                return 'You place the coin on the turntable, with the grooved side up. As you let go, the needle falls ' \
                       'onto the coin, and turntable begins spinning of its own volition. The gramophone starts playing a ' \
                       'scratchy, indistinct sound. Soon, you can make out distinct drumbeats. The drums become clearer, '\
                       'and as they do, you start to think of the diorama you saw earlier. A scratchy ' \
                       'voice whispers indistinctly, "*chhhhzzzkt* of dreams *cccczsszsz* just as real *chhhhszzzsst* ' \
                       '..." a popping sound interrupts the whispers, and the entire gramophone explodes open. I ' \
                       'come flying out of ' \
                       'the gramophone and land at your feet. The coin flies off of the turntable right into your hands. '
            elif dreamcatcherTalk < 6:
                return 'As you are distracted with the gramophone, the mouse shadow climbs up your leg, and starts ' \
                       'spreading like a puddle, but against gravity. You are somehow able to kick it off of you. '
            else:
                return 'The turntable is broken. '
        else:
            return 'You don\'t have a coin. '
    if 'coin' in uIn and 'slot' in uIn:
        if 'coin' in inventory:
            return 'The coin won\'t fit back into the slot. '
        else:
            return 'You don\'t have a coin. '
    if 'coin' in uIn and 'back' in uIn:
        if 'coin' in inventory:
            return 'The coin won\'t fit back into the slot. '
        else:
            return 'You don\'t have a coin. '
    if 'mirror' in uIn and 'slot' in uIn and dreamcatcherTalk == 4:
        if 'mirror' in inventory:
            inventory.remove('mirror')
            dreamcatcherTalk = 5
            mummies.north = 'Minerology Exhibit'
            mummies.south = 'History of Music Exhibit'
            mummies.west = 'Atrium'
            mummies.things.append('mirror')
            instrumentRoom.condition = 'normal'
            mirrorMirror = 1
            mirror.size = 10
            mirror.location = ' is embedded in the forehead of the sarcophagus. '
            mirror.description = 'You look into the mirror and see a wooden platform. Sobbing men and women are ' \
                                 'in shackles nearby. Large angry men are separating them by force. The image ' \
                                 'fades into another scene, but you look away with an aching in your chest. '
            return 'You put the mirror into the slot in the forehead of the sarcophagus. It clicks into place. ' \
                   'You hear the stones move aside, and suddenly the whole room is flooded with blinding light. ' \
                   'Memories flash before your eyes like photo negatives: a picnic with peanut butter on your nose, ' \
                   'making sugar cookies, scraping your knee when you tried to rollerblade,' \
                   ' and a visit to a museum. As soon as you see them, they fade away with the light. Try as you ' \
                   'might, you can\'t remember anything. As your eyes adjust, you can see that the reflection in the ' \
                   ' mirror has changed. It no longer reflects the room, but instead looks like a window into a ' \
                   'strange scene. '
        else:
            return 'You don\'t have a mirror. '
    if 'put on' in uIn.lower():
        return putOn(lst)
    if ' up' in uIn.lower():
        return use(lst,uIn)
    elif ' on' in uIn.lower():
        for word in lst:
            if word == 'on':
                splitIndex = lst.index(word)
                beforeOn = lst[:splitIndex]
                afterOn = lst[splitIndex+1:]
                break
        BOStr = ''
        for word in beforeOn:
            BOStr+=(' '+word)
        AOStr = ''
        for word in afterOn:
            AOStr+=(' '+word)
        for item in inventory:
            if itemDic[item].isIn(BOStr.lower()) and item != '':
                itemToDrop = item
        for potentialTarget in currentRoom.things:
            if itemDic[potentialTarget].isIn(AOStr.lower()) and potentialTarget != '':
                target = potentialTarget
        if target != '' and itemToDrop == 'dreamcatcher':
            inventory.remove(itemToDrop)
            currentRoom.things.append(itemToDrop)
            itemDic[itemToDrop].location = (' am resting on the ' + target)
            return("You place me on "+itemDic[target].article.lower()+target)
        elif target != '' and itemToDrop != '':
            handsFull -= itemDic[itemToDrop].size
            inventory.remove(itemToDrop)
            currentRoom.things.append(itemToDrop)
            itemDic[itemToDrop].location = ('on the ' + target)
            return(itemToDrop+" placed on the "+target)
        else:
            return "I don't understand how you could do that. "
    elif ' in' in uIn.lower():
        if 'key' in uIn.lower():
            if 'lock' or 'chest' in uIn.lower():
                return openThing(lst,uIn)
        else:
            return 'You can\'t put that in there.'
    elif 'on' not in uIn:
        for item in inventory:
            if itemDic[item].isIn(uIn.lower()):
                itemToDrop = item
        if itemToDrop in inventory:
            handsFull -= itemDic[itemToDrop].size
            inventory.remove(itemToDrop)
            if currentRoom == ladderTop:
                roomDic[ladderTop.down].things.append(itemToDrop)
            else:
                currentRoom.things.append(itemToDrop)
            itemDic[itemToDrop].location = ' is on the floor'
            return(itemToDrop + " dropped")
        else:
            return "You can't drop that. "
    return ('ERROR')

def enter(room):
    """the function that moves the player between cells when it
    is called, and also retrieves cell description and displays it"""
    global currentRoom
    global inventory
    global dreamcatcherTalk
    if room == outside and 'baby' not in inventory:
        return 'Wait! Please don\'t leave our son to his fate. Take him with you. '
    if dreamcatcherTalk == 9 or dreamcatcherTalk == 10:
        if room == armorRoom:
            dreamcatcherTalk = 11
            currentRoom = room
            return('\n\n~     ~     ~\n\n\n~     ~     ~\n\n\n'
                   'Here our son sleeps. You have seen what will happen if you do not save him now. The storm is '
                   'upon us, and so my time with you is at an end, for now. Take care, Awa. You see me '
                   'put my hand on the baby\'s chest and as you watch, I become a dreamcatcher once more, this time '
                   'hanging loosely around his neck on a thin string. '+'\n\n'+room.ID+'\n'+room.describe())
    if dreamcatcherTalk < 9:
        if 'dreamcatcher' in inventory:
            currentRoom = room
            return(room.ID+'\n'+room.describe())
        else:
            if currentRoom == atrium:
                return getSleepy(str='You start to leave, but you stop yourself. You should pick up the dreamcatcher first. ')
            else:
                return getSleepy(str='You start to leave, but you stop yourself. You get the sense that you were about to step '
                                 'off of the edge of a dark cliff. You should not go too far without me, you may need my '
                                 'protection. ')
    else:
        currentRoom = room
        return(room.ID+'\n'+room.describe())

def examine(lst=[],uIn=''):
    """the function that controls what happens when the player
    examines something"""
    global tips
    global dreamcatcherTalk
    global mirrorMirror
    #dreamcatcher exception
    if dreamcatcher.isIn(uIn):
        if 11 > dreamcatcherTalk > 8:
            return 'You see me as a familiar man, with brown eyes and short, curly hair. '
        elif dreamcatcherTalk > 10:
            return 'A familiar dreamcatcher. '
    if len(lst) == 0:
        if tips and 'examine' in uIn:
            return 'What do you want to examine? \n [TIP: You can abbreviate \'examine\' by using \'x\' instead]'
        else:
            return 'What do you want to examine? '
    #mirror exceptions
    elif 'mirror' in uIn:
        if mirrorMirror == 1:
            mirrorMirror = 2
        elif mirrorMirror == 2:
            mirror.description = 'You look into the mirror and see a small brown shed next to a big white house. In ' \
                                 'the distance some people or creatures are working in a green field. The image fades. '
            mirrorMirror = 3
        elif mirrorMirror == 3:
            mirror.description = 'You look into a mirror and see a man. He is tall and his face looks kind. The' \
                                 ' man reaches towards the mirror. The image moves as though it is viewed through ' \
                                 'someone\'s eyes. The image tilts down, following his hand, and you can see that it ' \
                                 'touches a bare midriff. Another hand reaches in from outside the image and clasps ' \
                                 'his slowly. The image fades. '
            mirrorMirror = 4
        elif mirrorMirror == 4:
            mirror.description = 'You look into the mirror and see a woman staring out of a window. Early autumn ' \
                                 'light drifts through it and streams through the dust in the room she is in. ' \
                                 'She whips around to face the mirror, as though you startled her. Before you ' \
                                 'can say anything a figure blocks the image and starts walking toward the woman ' \
                                 'menacingly. You can feel your heartbeat increasing. As the figure reaches her, it ' \
                                 'grabs her roughly by the hand. The image fades. '
            mirrorMirror = 5
        elif mirrorMirror == 5:
            mirror.description = 'You look into the mirror and see a fight. Three men in plaid clothes are trying to ' \
                                 'restrain a man in chains and rags. The chained man is on top of another man in ' \
                                 'a collared jacket, and is punching him savagely. A crowd has started to gather, ' \
                                 'someone in the crowd hands one of the plaid shirts a rifle. He takes it and aims it' \
                                 ' at the man in chains. You feel your stomach drop as the chained man flies back in ' \
                                 'a spray of blood and light. The image fades. '
            mirrorMirror = 6
        elif mirrorMirror == 6:
            mirror.description = 'You look into the mirror and see the inside of a ship. Chained men and women lie ' \
                                 'together in the damp darkness. A woman suddenly springs to life and grabs a passing' \
                                 ' rat, and beings to devour it. An old man nearby begins shaking as tears roll down ' \
                                 'his face. The image fades. '
            mirrorMirror = 7
        elif mirrorMirror > 6:
            mirror.description = 'The mirror is like a window to pain. You don\'t want to look anymore. '
    #normal stuff
    for item in inventory:
        if itemDic[item].isIn(uIn):
            return(itemDic[item].description)
    for item in currentRoom.things:
        if itemDic[item].isIn(uIn):
            return(itemDic[item].description)
    for item in itemDic:
        if itemDic[item].isIn(uIn):
            return 'You can\'t see that. '
    for room in roomDic:
        if room.lower() in uIn.lower():
            if room == currentRoom.ID:
                return(currentRoom.describe())
            else:
                return("You can't examine the "+room+" from here.")
    if 'room' in uIn and 'marine' not in uIn:
        return(currentRoom.describe())
    #self exception
    if 'self' in uIn:
        if dreamcatcherTalk < 4:
            return("A perfectly average boy in every respect. The doctor said so. ")
        elif dreamcatcherTalk == 5:
            return("I... I don't remember...")
        elif dreamcatcherTalk == 6:
            return("My name is Awa. ")
    return("I do not know how to examine that")

def getSleepy(placeholder=[],str=''):
    global sleepy
    global currentRoom
    if sleepy == 0:
        sleepy +=2
        return str+"You feel drowsy. Your mind becomes foggy. "
    elif sleepy == 1:
        sleepy +=2
        return str+"Your tiredness is compounded, you can barely... stay... awake... "
    elif sleepy >1:
        if 'dreamcatcher' not in inventory:
            currentRoom.things.remove('dreamcatcher')
            atrium.things.append('dreamcatcher')
        sleepy = 0
        currentRoom = atrium
        return "You... so... sleepy... \n\n ~ ~ ~ ~ ~ ~ ~ \n\nYou wake up on the floor of the atrium. "

def Go(lst=[],uIn=''):
    global currentRoom
    moveDic = {'north' : goNorth, 'east' : goEast, 'south' : goSouth, 'west' : goWest,  'up' : goUp, 'down' : goDown}
    if len(lst)>0:
        for verb in moveDic:
            if verb in uIn:
                return verbDic[verb](lst[1:],uIn)
        for room in roomDic:
            if room in uIn:
                if currentRoom.north == room:
                    return enter(roomDic[room])
                elif currentRoom.east == room:
                    return enter(roomDic[room])
                elif currentRoom.south == room:
                    return enter(roomDic[room])
                elif currentRoom.west == room:
                    return enter(roomDic[room])
        return "That is not a recognized direction to go"
    else:
        return("Where do you want to go?")

def goNorth(lst=[],uIn=''):
    if len(lst) > 0:
        if verbDic[lst[0]] == goEast or verbDic[lst[0]] == goWest:
            return 'You may only move in the four main cardinal directions'
    return move('N')

def goEast(lst=[],uIn=''):
    return move('E')

def goSouth(lst=[],uIn=''):
    if len(lst) > 0:
        if verbDic[lst[0]] == goEast or verbDic[lst[0]] == goWest:
            return 'You may only move in the four main cardinal directions'
    return move('S')

def goWest(lst=[],uIn=''):
    return move('W')

def goUp(lst=[],uIn=''):
    return move('U')

def goDown(lst=[],uIn=''):
    return move('D')

def help(lst=[],uIn=''):
    return '\nThis game is a work of interactive fiction. You control a character by typing commands into the box ' \
           'at the top of the window, and your choices affect the story. To get you started, here are some basic ' \
           'commands:\n**************************************\ngo, look, examine, pick up, put down. ' \
           '\n**************************************\n"Go" lets you go places. For example you can say ' \
           '"go north", or you can say "go to the ' \
           '[name of place you want to go]". You cannot always go where you want to, but you should be able to go ' \
           'where you need to. \n"Look" lets you look at your surroundings. Look before you leap! \n"Examine" lets ' \
           'you scrutinize the details of an object. Not everything can be examined, but you can feel free to try! ' \
           'You never know what might give you a hint to the puzzle you are stuck on. \n"Pick up" or "take", lets ' \
           'you take an object and put it in your inventory, which you can check by typing the command "inventory". ' \
           '\n"Put down" or "drop" lets you remove an item from your inventory and place it in the space you are in. ' \
           '\nIf you would like additional help with playing this game, type "Advanced_Help".\nIf you want to see ' \
           'the list of shortcuts type "shortcuts"\nIf you want to see all the functional verbs, type "commands. \n\n'

def jump(lst=[],uIn=''):
    return('You hop. Nothing happens.')

def kill(lst=[],uIn=''):
    if len(lst) == 0:
        return 'What do you want to kill?'
    elif 'self' in uIn.lower() or ' me' in uIn.lower():
        return 'It may sound strange, but you cannot do that here. '
    elif 'you' in uIn.lower() or 'dreamcatcher' in uIn.lower():
        return 'You cannot kill me. '
    elif baby.isIn(uIn):
        return 'Haha you must think you\'re so funny. But seriously, come on. '
    else:
        for item in itemDic:
            if itemDic[item].isIn(uIn):
                return 'You cannot kill that which is not alive. '
    return 'I do not know how you would kill that'

def lift(lst=[],uIn=''):
    for item in inventory:
        if itemDic[item].isIn(uIn):
            if itemDic[item].size < 3:
                return 'You lift the '+item+' but nothing happens. '
            else:
                return 'You can\'t lift that. '
    for item in currentRoom.things:
        if itemDic[item].isIn(uIn):
            if itemDic[item].size < 3:
                return 'You lift the '+item+' but nothing happens. '
            else:
                return 'You can\'t lift that. '

def load(*args):
    global currentRoom
    global inventory
    global dreamcatcherTalk
    global keyTaken
    global mirrorMirror
    try:
        roomFile = open('roomsSave.txt','r').readlines()
    except:
        return 'error: could not find save destination "roomsSave.txt"'
    try:
        itemFile = open('itemsSave.txt','r').readlines()
    except:
        return 'error: could not find save destination "itemsSave.txt"'
    try:
        inventoryFile = open('invSave.txt','r')
    except:
        return 'error: could not find save destination "invSave.txt"'
    try:
        eventFile = open('eventSave.txt','r')
    except:
        return 'error: could not find save destination "eventSave.txt"'
    currentRoom = roomDic[eventFile.readline().strip('\n')]
    dreamcatcherTalk = int(eventFile.readline().strip('\n'))
    if dreamcatcherTalk == 1:
        nativeAmerican.things.append('dreamcatcher')
    if dreamcatcherTalk >= 3:
        chest.location = ' is lying open on the floor. '
    if dreamcatcherTalk == 4:
        mummies.west = 'An enormous stone blocks the way. '
        mummies.north = 'An enormous stone blocks the way. '
        mummies.south = 'An enormous stone blocks the way. '
    if dreamcatcherTalk > 8:
        armorRoom.north = 'Outside'
        armorRoom.east = 'There is a hazy wall there. '

    if bool(eventFile.readline().strip('\n')):
        keyTaken = True
        dinos.description = 'A deep room that contains many skeletal structures supported by metal ' \
                            'bars. An enormous tyrannosaurus skeleton dominates the room, and the ' \
                            'lights have been positioned to illuminate it from all angles. '
    inventory = []
    mirrorMirror = int(eventFile.readline().strip('\n'))
    for item in inventoryFile:
        item = item.strip('\n')
        inventory.append(item)
    for i in range(len(roomFile)-1):
        room = roomFile[i].strip('\n')
        if room in roomDic:
            roomDic[room].condition = roomFile[i+1].strip('\n')
            roomDic[room].things = []
            attribute = i+2
            while attribute<=len(roomFile)-1 and roomFile[attribute].strip('\n') not in roomDic:
                if roomFile[attribute].strip('\n') in itemDic:
                    roomDic[room].things.append(roomFile[attribute].strip('\n'))
                attribute += 1
    for i in range(len(itemFile)-1):
        item = itemFile[i].strip('\n')
        if item in itemDic:
            itemDic[item].description = itemFile[i+1].strip('\n')
            itemDic[item].location = itemFile[i+2].strip('\n')
    dancerDiorama.description="The masks of the dancers draw you in to their circle " \
                              "and you can almost feel the heat of the fire. You feel a " \
                              "sense of deja vu, like this has happened before. Your eye " \
                              "falls on the placard that is hung on the wall by the diorama. " \
                              "One part in particular catches your eye, \"The Ojibwa masks " \
                              "are themselves spirits, with magical properties. Many Native " \
                              "Americans believed that like the spirit world, \n\nthe " \
                              "experiences of dreams are just as real as waking experiences.\
                              \n\nHmm. That's interesting.",
    gameOver = bool(eventFile.readline().strip('/n'))
    return 'load successful. \n\n'+look()

def look(lst=[],uIn=''):
    global currentRoom
    if len(lst) == 0 or lst[0] == 'around':
        return(currentRoom.ID+'\n'+currentRoom.describe())
    else:
        return examine(lst,uIn)

def move(direction):
    """the function that controls the player's movement"""
    if direction == 'N':
        if currentRoom.north in roomDic:
            return enter(roomDic[currentRoom.north])
        else:
            return(currentRoom.north)
    elif direction == 'E':
        if currentRoom.east in roomDic:
            return enter(roomDic[currentRoom.east])
        else:
            return(currentRoom.east)
    elif direction == 'S':
        if currentRoom.south in roomDic:
            return enter(roomDic[currentRoom.south])
        else:
            return(currentRoom.south)
    elif direction == 'W':
        if currentRoom.west in roomDic:
            return enter(roomDic[currentRoom.west])
        else:
            return(currentRoom.west)
    elif direction == 'U':
        if currentRoom.up in roomDic:
            return enter(roomDic[currentRoom.up])
        elif 'ladder' in currentRoom.things:
            ladderTop.down = currentRoom.ID
            return enter(ladderTop)
        else:
            return(currentRoom.up)
    elif direction == 'D':
        if currentRoom.down in roomDic:
            return enter(roomDic[currentRoom.down])
        else:
            return(currentRoom.down)

def openThing(lst=[],uIn=''):
    global currentRoom
    global inventory
    global dreamcatcherTalk
    if len(lst) == 0:
        return 'What do you want to open? '
    if 'chest' or 'lock' in uIn:
        if currentRoom == gemRoom and 'key' in inventory and chest.location == ' is lying on the floor, ' \
                                                                               'securely locked. ':
            chest.location = ' is lying open on the floor. '
            mummies.condition = 'normal'
            inventory.remove('key')
            currentRoom.things.append('mirror')
            dreamcatcherTalk = 3
            return 'You open the chest. A shadow slithers out of it and darts off through the doorway to the south.' \
                   'At the bottom of the chest there is a small mirror. '
        elif currentRoom == gemRoom and chest.location == ' is lying open on the floor. ':
            return 'The chest is already open. '
        elif currentRoom == gemRoom and 'key' not in inventory:
            return 'You can\'t open the chest without a key. '
    return "I don't see how you could open that. "

def openInventory(lst=[],uIn=''):
    outputStr = ''
    if len(inventory) > 0:
        outputStr+=('inventory:')
        for thing in inventory:
            outputStr+=('\n'+thing)
    else:
        return("empty")
    return outputStr

def playtest(*args):
    global inventory
    global dreamcatcherTalk
    dreamcatcherTalk = 3
    nativeAmerican.things.remove('tree shadow')
    atrium.things.remove('dreamcatcher')
    inventory = ['dreamcatcher','mirror']
    chest.location = ' is lying open on the floor. '
    dinos.condition = 'normal'
    dinos.description = 'A deep room that contains many skeletal structures supported by metal ' \
                            'bars. An enormous tyrannosaurus skeleton dominates the room, and the ' \
                            'lights have been positioned to illuminate it from all angles. '
    ladderTop.things.remove('key')
    gemRoom.condition = 'normal'
    mummies.condition = 'normal'
    return 'PLAYTEST SETUP COMPLETE'

def poke(lst=[],uIn=''):
    if len(lst)>0:
        return 'You accomplish nothing useful by this. '
    else:
        return 'Poke what? '

def pull(lst=[],uIn=''):
    global currentRoom
    if len(lst) == 0:
        return 'What do you want to pull? '
    if 'dreamcatcher' in uIn or 'you' in uIn:
        if 'dreamcatcher' in currentRoom.things:
            return 'You pull me towards you. '
    for item in currentRoom.things:
        if itemDic[item].isIn(uIn):
            if itemDic[item].size<3:
                return 'You pull the '+itemDic[item].ID+' towards you. '
            else:
                return 'It won\'t budge. '
    return 'You cannot pull that. '

def push(lst=[],uIn=''):
    global currentRoom
    if len(lst) == 0:
        return 'What do you want to push? '
    if 'dreamcatcher' in uIn or 'you' in uIn:
        if 'dreamcatcher' in currentRoom.things:
            return 'You push me. '
        for item in currentRoom.things:
            if itemDic[item].isIn(uIn):
                if itemDic[item].size<3:
                    return 'You give the '+itemDic[item].ID+' a shove. '
                else:
                    return 'It won\'t budge. '
    return 'You cannot push that. '

def putOn(lst=[],uIn=''):
    if len(lst) == 0:
        return "You can't put on nothing."
    else:
        return getSleepy("You try to put on "+lst[0])

def quitGame(lst=[],uIn=''):
    exit()

def roomTest(lst=[],uIn=''):
    global currentRoom
    str = ('This is the Room Test')
    currentRoom = 'Demo Room'
    test_room = roomDic[currentRoom]
    str += (test_room.describe())
    return str

def save(*args):
    global dreamcatcherTalk
    global inventory
    global keyTaken
    try:
        roomFile = open('roomsSave.txt','w')
    except:
        return 'error: could not find save destination "roomsSave.txt"'
    try:
        itemsFile = open('itemsSave.txt','w')
    except:
        return 'error: could not find save destination "itemsSave.txt"'
    try:
        inventoryFile = open('invSave.txt','w')
    except:
        return 'error: could not find save destination "invSave.txt"'
    try:
        eventFile = open('eventSave.txt','w')
    except:
        return 'error: could not find save destination "eventSave.txt"'
    for room in roomDic:
        roomFile.write(room+'\n'+roomDic[room].condition+'\n')
        for thing in roomDic[room].things:
            roomFile.write(thing+'\n')
    for item in itemDic:
        itemsFile.write(item+'\n'+itemDic[item].description+'\n'+itemDic[item].location+'\n')
    for item in inventory:
        inventoryFile.write(item+'\n')
    eventFile.write(currentRoom.ID+'\n')
    eventFile.write(str(dreamcatcherTalk)+'\n')
    eventFile.write(str(keyTaken)+'\n')
    eventFile.write(str(mirrorMirror)+'\n')
    eventFile.write(str(gameOver)+'\n')
    return 'Save sucessful'

def setUpMuseum():
    global currentRoom
    currentRoom = atrium
    return currentRoom.ID+'\n'+'Wake up. You are on the floor. You must hurry. The storm approaches. I will assist ' \
                               'you in any way I can. On the floor you can see a dreamcatcher. Pick it up.' \
                               '\n [TIP: You can type "help" for instructions and commands.]' \
                               '\n [TIP: Tips are ON. Type tipsOFF to turn tips OFF.]'

def shortcuts(*args):
    return 'n - go north\ne - go east\nw - go west\ns - go south\nu - go up\nd - go down\ni or inv - show inventory\n' \
           'q - quit game\nl - look\nx or ex - examine'

def take(lst=[],uIn=''):
    global keyTaken
    global handsFull
    global currentRoom
    global inventory
    global dreamcatcherTalk
    if len(lst) == 0:
        return 'What do you want to take? '
    # if the player tries to take something off
    if ' off' in uIn.lower():
        return takeOff(lst[1:],uIn)
    # if the player is triggering the 'take my hand' event
    elif baby.isIn(uIn):
        inventory += ['baby']
        currentRoom.things.remove('baby')
        return 'You pick the baby up gently and cradle him in your arms. '
    elif 'hand' in uIn.lower():
        if dreamcatcherTalk > 8:
            if 'dreamcatcher' in currentRoom.things:
                currentRoom.things.remove('dreamcatcher')
            dreamcatcherTalk = 10
            return 'You reach out your hand and slide your fingers through mine. As you do, the image of a tree ' \
                   'falling seeps into your mind. You then see a small brown cabin, and a baby asleep in a crib. ' \
                   'A woman sleeps nearby. While you watch, a tree crashes through the roof of the house. The woman ' \
                   'is instantly awake, but as the dust settles it is clear that the tree lands right on the crib. ' \
                   'Come now. You know why we are here. We haven\'t got much more time. I walk out through the ' \
                   'doorway to the west. '
    # if the player is triggering dreamcatcher events or just taking the dreamcatcher
    elif 'dreamcatcher' in uIn.lower()  or 'you' in uIn.lower():
        if 'dreamcatcher' in currentRoom.things:
            if dreamcatcherTalk == 9:
                return take(lst,uIn+' hand')
            inventory += ['dreamcatcher']
            currentRoom.things.remove('dreamcatcher')
            if dreamcatcherTalk == 0:
                return "You pick me up gently, and place me in your pocket. Let's get going, we haven't got much " \
                       "time to bring light before the storm. "
            elif dreamcatcherTalk == 1:
                dreamcatcherTalk = 2
                return "************\nLightning... Rain on face... The tree! The tree in the field is falling..." \
                       "\n************\n\n Hey, are you okay? Oh good. I couldn't see your thoughts for a second."
            elif dreamcatcherTalk == 2:
                return  "You've got me now. Let's get going. "
            elif dreamcatcherTalk == 7:
                dreamcatcherTalk = 8
                marineLife.condition = 'normal'
                return '\n*************************\n...before the angry men took... he couldn\'t protect... Awa, ' \
                       'take care of our baby... Awa... Awa... \n*************************\n\nAwa! Oh thank God ' \
                       'you\'re alright. I felt you were almost gone there. \nA light appears in the western doorway. '
        else:
            if 'dreamcatcher' in inventory:
                return "You already have me. "
            else:
                return "I am not here. "
    #normal take operation
    else:
        str = ''
        for thing in currentRoom.things:
            if itemDic[thing].isIn(uIn.lower()):
                if itemDic[thing].size<=(2-handsFull):
                    handsFull += itemDic[thing].size
                    inventory += [thing]
                    currentRoom.things.remove(thing)
                    #key event
                    if thing == 'key':
                        keyTaken = True
                        dinos.description = 'A deep room that contains many skeletal structures supported by metal ' \
                                            'bars. An enormous tyrannosaurus skeleton dominates the room, and the ' \
                                            'lights have been positioned to illuminate it from all angles. '
                    #coin event
                    if thing == 'coin' and dreamcatcherTalk == 3:
                        dreamcatcherTalk = 4
                        slot.announce = True
                        mummies.west = 'An enormous stone blocks the way. '
                        mummies.north = 'An enormous stone blocks the way. '
                        mummies.south = 'An enormous stone blocks the way. '
                        if 'mirror' in inventory or 'mirror' in currentRoom.things:
                            return 'You pry the coin out of the coffin, and it lands in your hand with a "pop". ' \
                                   'Suddenly, enormous stones slide in front of all of the exits, trapping you inside. '
                        else:
                            for room in roomDic:
                                if 'mirror' in roomDic[room].things:
                                    roomDic[room].things.remove('mirror')
                            inventory.append('mirror')
                            return 'You pry the coin out of the coffin, and it lands in your hand with a "pop". ' \
                                   'Suddenly, enormous stones slide in front of all of the exits, trapping you ' \
                                   'inside. Hmm. You\'re missing something. I\'ll just get it for you. You feel ' \
                                   'something fall into your pocket. '
                    str = (thing+" taken.")
                else:
                    str = ('You cannot take the '+thing)
                    if handsFull > 0 and itemDic[thing].size < 3:
                        str = ('You will have to drop something if you want to take something else')
            elif thing in inventory:
                str = ('You already have that. ')
        if len(str) == 0:
            str = ("I cannot see how you could take that. ")
        return str

def takeOff(lst=[],uIn=''):
    if lst[0].lower() == 'clothes':
        return getSleepy("You attempt to take off your clothes. ")
    else:
        return "You can't take off something you're not wearing"

def talk(lst=[],uIn=''):
    if len(lst) == 0:
        return "There is no one here besides me and you. Would you like to talk about me (dreamcatcher), you, the light, or the " \
               "storm?"
    elif 'you' in uIn.lower() or 'dreamcatcher' in uIn.lower():
        if dreamcatcherTalk < 8:
            return "My name is dreamcatcher. I am a part of the whole, as are you. I believe that I was created to guide you. " \
                   "I can see everything you think, and you can hear me even though I do not speak. "
        else:
            return "My name is known to you. We were once one, before I had to leave your world. But we will meet again " \
                   "in another life. "
    elif 'me' in uIn.lower():
        if dreamcatcherTalk < 5:
            return 'You appear like an ordinary boy of fourteen years of age. However, your spirit has known many ' \
               'lifetimes besides this one, and will yet know many more. '
        else:
            return 'You are Awa. '
    elif 'light' in uIn.lower():
        return 'I do not know much about the light, only that darkness has taken its place, and you must restore ' \
               'the light before we can return to the whole. And you must return to the whole before the storm, ' \
               'or we will be trapped in darkness forever. '
    elif 'storm' in uIn.lower():

        return 'When I was created, I was instilled with the knowledge of the storm which will bring the void to consume ' \
               'us if you are not able to restore the light. '
    else:
        return "There is no one here besides me and you. Would you like to talk about me (dreamcatcher), you, the light, or the " \
               "storm?"

def tipsOn(herp=[],derp=''):
    global tips
    tips = True
    return 'Tips are now on.'

def tipsOff(herp=[],derp=''):
    global tips
    tips = False
    return'Tips are now off.'

def use(lst=[],uIn=''):
    global tips
    if gramophone.isIn(uIn):
        if 'gramophone' in currentRoom.things:
            if dreamcatcherTalk == 6:
                if 'coin' in inventory:
                    return drop(lst,uIn+' coin')
                else:
                    return 'Nothing you try brings the gramophone to life. The absence of any sort of record irks you. '
            elif dreamcatcherTalk < 6:
                return 'As you are distracted with the gramophone, the mouse shadow climbs up your leg, and starts ' \
                       'spreading like a puddle, but against gravity. You are somehow able to kick it off of you. '
            else:
                return 'The gramophone is broken. '
        else:
            return 'You don\'t see a gramophone'

    if 'key' in uIn:
            return openThing(lst[2:],uIn)
    if tips:
        return 'I do not understand [item\'s function is unspecified]'
    else:
        return 'I do not understand'

def wakeUp(herp=[],derp=''):
    return "You are already awake. "

def yes(*args):
    return ''

# Dictionary of usable verbs

verbDic = {'rt' : roomTest, 'exit' : quitGame, 'quit' : quitGame, 'q' : quitGame, 'go' : Go, 'walk' : Go, 'n' : goNorth,
           'north' : goNorth,'e' : goEast, 'east' : goEast, 's' : goSouth, 'south' : goSouth, 'w' : goWest,
           'west' : goWest, 'u' : goUp, 'up' : goUp, 'd' : goDown, 'down' : goDown, 'help' : help, '"help"' : help,
           'inv' : openInventory, 'i' : openInventory, 'inventory' : openInventory, 'grab' : take, 'take' : take,
           'pick' : take, 'drop' : drop, 'put': drop, 'place' : drop, 'ex' : examine, 'x' : examine, 'examine' : examine
           , 'look' : look, 'l' : look, 'tipsOFF' : tipsOff, 'wake' : wakeUp, 'kill' : kill, 'shortcuts' : shortcuts,
           'jump' :jump, 'get' : take, 'talk' : talk, 'speak': talk, 'shout' : talk, 'enter' : Go, 'tipsON': tipsOn,
           'advanced_help' : advancedHelp, "advanced_help" : advancedHelp, 'advanced' : advancedHelp,
           'commands' : commands, 'break' : breakThing, 'punch' : breakThing, 'hit' : breakThing, 'climb' : climb,
           'push': breakThing, 'set' : drop, 'use' : use, 'extend' : use, 'touch' : poke, 'feel' : poke, 'poke' : poke,
           'pull' : pull, 'open' : openThing, 'unlock' : openThing, 'load' : load, 'playtest' : playtest, 'save' : save,
           'lift' : lift, 'push' : push, 'yes' : yes
           }

# The verb selector function
def read(uIn):
    """parses the input by assuming that the first word will be the verb
    checks to see if the verb is known and then passes a list
     containing the space-separated words from the the user input,
     and the original input string, respectively, to the verb functions
     that it calls. Each verb has its own function abave."""
    global tips
    global sleepy
    if uIn.split(' ')[0].lower() in verbDic:
        if len(uIn) > 0:
            ccmesssage = conditionCheck(uIn)
            if ccmesssage == 'OK':
                if sleepy > 0:
                    sleepy -= 1
                return( verbDic[uIn.split(' ')[0].lower()](uIn.split(' ')[1:],uIn) )
            else:
                return ccmesssage
    else:
        if tips:
            return("I don't understand. [Verb not recognized.] \n [TIP: You can type help for instructions and commands.]"
                   "\n [TIP: Tips are ON. Type tipsOFF to turn tips OFF.]")
        else:
            return("I don't understand")


##############################################################
#     Graphical User Interface
##############################################################

class simpleapp_tk(tkinter.Tk):
    def __init__(self,parent):
        tkinter.Tk.__init__(self,parent)
        self.parent = parent
        self.initialize()

    def initialize(self):
        self.grid()

        self.txt = tkinter.Text(self, wrap=tkinter.WORD) # wrap=CHAR, wrap=NONE
        #self.txt.pack(expand=1, fill=tkinter.BOTH)
        self.txt.grid(column=0,row=1)
        self.scrollbar = tkinter.Scrollbar(self)

        self.txt.config(yscrollcommand=self.scrollbar.set)
        self.scrollbar.config(command=self.txt.yview)

        self.entryVariable = tkinter.StringVar()
        self.entry = tkinter.Entry(self,textvariable=self.entryVariable)
        self.entry.grid(column=0,row=0,sticky='EW')
        self.entry.bind("<Return>", self.OnPressEnter)
        self.entryVariable.set(u"Enter text here.")
        self.entry.bind("<FocusIn>", self.OnHasFocus)

        self.grid_columnconfigure(0,weight=1)
        self.resizable(False,False)

    def OnPressEnter(self,event):
        self.txt.config(state = tkinter.NORMAL)
        self.txt.insert(tkinter.END, '\n> '+self.entryVariable.get())
        #test
        #print(read(self.entryVariable.get()))
        self.txt.insert(tkinter.END, '\n'+read(self.entryVariable.get()))
        self.txt.config(state = tkinter.DISABLED)
        self.entryVariable.set('')
        self.txt.yview(tkinter.END)

    def OnHasFocus(self,event):
        if self.entryVariable.get()=='Enter text here.':
            self.entryVariable.set('')

if __name__ == "__main__":
    app = simpleapp_tk(None)
    app.title('Interactive Fiction')
    app.txt.config(state = tkinter.NORMAL)
    app.txt.insert(tkinter.END, setUpMuseum())
    app.txt.config(state = tkinter.DISABLED)
    app.mainloop()
