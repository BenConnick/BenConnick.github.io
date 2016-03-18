var jsonString = '{"moves" : [{"Class": "Slayer","Name": "Reckless Charge","AP": "8","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move 5 spaces and Roll |Weapon + 2| attack dice.","Range": "Touch","Tags" : ["movement","utility","positioning","gap-closer"]},{"Class": "Slayer","Name": "Giant Killer","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "+2 attack dice against creatures larger than you.","Range": "","Tags" : ["passive"]},{"Class": "Defender","Name": "Take the Blow","AP": "1","Trigger": "An adjacent ally is attacked.","Special": "Reaction","Roll": "","Difficulty": "","Effect": "You may defend against an attack on an adjacent ally as if you were the intended recipient. You must decide this before damage is rolled.","Range": "","Tags" : ["bodyguard","utility","reaction"]},{"Class": "Defender","Name": "Lock Down","AP": "4","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "You get +4 Defense until the start of your next turn.","Range": "","Tags" : ["defense","utility"]},{"Class": "Scholar","Name": "Toadify","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Turn target into a toad. While target is a toad, they may not attack. Save Ends.","Range": "Touch","Tags" : ["buff","utility"]},{"Class": "Scholar","Name": "Tiger Aura","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "One character gets the Tiger Aura status, which has the effect of making all their attacks get +2 dice. This status lasts until the start of your third turn following this ability (this would be turn 0 for counting purposes). A character may only have 1 Aura status at a time.","Range": "Touch","Tags" : ["buff","damage"]},{"Class": "Battlemage","Name": "Fireball","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Shoot a burst of magical fire that explodes a medium area, dealing 8 damage dice to all inside. ","Range": "Medium, Medium area","Tags" : ["area","damage"]},{"Class": "Battlemage","Name": "Lightning Sigil","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Shoot lighting dealing 6 damage dice through a chain of Marked enemies that are short range from each other. The first enemy in the chain must be at most 4 spaces from you.","Range": "","Tags" : [""]},{"Class": "Assassin","Name": "Marked for Death","AP": "1","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "One target acquires the marked status, even if you can\'t see them.","Range": "Any","Tags" : ["teamwork","mark"]},{"Class": "Assassin","Name": "Contracted","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "If an enemy has the marked status, you have +2 attack and +2 damage","Range": "","Tags" : ["mark","damage","passive","teamwork"]},{"Class": "Assassin","Name": "Back Stab","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "When an enemy is between you an an ally, you gain +2 attack and +2 damage","Range": "","Tags" : ["passive","damage"]},{"Class": "Hunter","Name": "Snipe","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Inflict Ranged Weapon damage","Range": "Short: 5, Medium: 8, Long: 12","Tags" : ["damage","long-range"]},{"Class": "Hunter","Name": "Running Shot","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move two spaces while shooting an arrow","Range": "Long","Tags" : ["ranged","movement","damage"]}]}';
var glossaryString = '{"glossary" : [{"Term": "Marked Status","Tags": ["Mark", "Marked"],"Definition": "Someone has marked you as a target. This status has no other effect. Ends when the source is Incapacitated or no longer has line of sight."},{"Term": "Incapacitated Status","Tags": ["Incapacitated"],"Definition": "You are either dead or unconscious. Either way, you can’t do anything. "},{"Term": "Prone Status","Tags": ["Prone"],"Definition": "You cannot use the move ability. You take a -1 penalty to Defense while Prone. You can remove the prone status on your turn for the cost of 2 move actions (if you have heavy armor this will cost more than 2 AP). "},{"Term": "Immobilized Status","Tags": ["Immobilized"],"Definition": "You cannot use the Move ability. Save ends."},{"Term": "Save Ends","Tags": ["Save Ends"],"Definition": "Some statuses are labeled “Save Ends”. This means that you apply the effect of the status, then roll a d20. On a 10+ you remove the status. "},{"Term": "Test","Tags": ["Test","Check"],"Definition": "A Roll that is made using some Skill or Ability plus a d20 to see if you can equal or surpass a Difficulty number."},{"Term": "Frozen Status","Tags": ["Frozen"],"Definition": "You cannot take any action. Save Ends. "},{"Term": "Paralyzed Status","Tags": ["Paralyzed"],"Definition": "You cannot take any action. Save Ends."},{"Term": "Poisoned Status","Tags": ["Poisoned"],"Definition": "At the start of your turn, you lose X HP, where X is specified by the source of the status. If X is unspecified, X is 1. Save Ends."},{"Term": "Burning Status","Tags": ["Burning", "Burn"],"Definition": "At the start of your turn, you lose 2 HP. Save Ends."},{"Term": "HP / Hitpoints","Tags": ["HP", "Hitpoint", "Hit Point"],"Definition": "These are a unit to measure a character’s ability to keep fighting. For one character, they might be more accurately described as \'stamina\', for another \'wounds\', and yet another \'willpower\'. Player-characters have an average of 8."},{"Term": "Archetype","Tags": ["Archetype"],"Definition": "Archetypes are general character types. An archetype contains a set of possible abilities and starting attributes, as well as starting weapons."},{"Term": "Difficulty","Tags": ["Difficulty", "Difficulties"],"Definition": "This is a number that a roll (usually plus a Modifier) must equal or surpass in order to succeed."},{"Term": "Success","Tags": ["Success", "Successes", "Succeed"],"Definition": "A character accomplishes a goal that they were attempting to reach by making a Test"},{"Term": "Failure","Tags": ["Failure", "Failures"],"Definition": "A character does not Succeed at his goal because of a Test."},{"Term": "Standard Roll","Tags": ["Standard Roll"],"Definition": "Rolling a d20"},{"Term": "Damage","Tags": ["Damage", "Damage Roll"],"Definition": "Damage is the net amount of HP that a character loses as a result of a successful attack. Different abilities have different ways of calculating damage. For example, in a melee attack, the weapon has an associated die and Attribute, which are added together to determine damage."},{"Term": "Skill","Tags": ["Skill"],"Definition": "One of the numerical properties that a character has. Skills are (mostly) used outside of combat. When using a skill, a player makes a d20 roll and adds the value of the skill. The total is compared to a Difficulty to see if the player succeeds or not. "},{"Term": "Attribute","Tags": ["Attribute"],"Definition": "One of four numerical values representing your character’s natural power and training. The four Attributes are Strength, Agility, Intelligence, and Spirit."},{"Term": "Ability","Tags": ["Ability", "Abilities"],"Definition": "An action that a character can use during combat. Abilities fall into three main categories. Standard Abilities, or just Abilities, are used on a player\'s turn and require an amount of AP. Passive Abilities are not used, they are just always active and do not require AP. Reaction Abilities are used only in response to something and can be used on other players turns."},{"Term": "Stack","Tags": ["Stack"],"Definition": "When players use Reaction abilities, occasionally, an ability will react to the effect of another Reaction ability. Since reaction abilities are resolved instantly, the question arises of which one resolves first. The answer is that the last reaction to trigger resolves first, followed by every reaction that was triggered before it. This chain of reactions is called the stack. A single ability can NEVER be triggered more than once in the stack, and as such, reactions cannot be chained infinitely, even if the user had sufficient AP."},{"Term": "Range and Area","Tags": ["Range", "Area"],"Definition": "How far an Ability will work. There are two parts to this component of an Ability, the first is called Range, or Distance, and the second is called Area. Range / Distance measures the distance between the Ability\'s user and her target that it is possible use the ability. There are five possible ranges, Self - only the user, Touch - adjacent targets, Short - within the Short range template (usually three squares of the grid), Medium - Medium range template (two Short range templates), or Long - Long Range template (three Short range templates). The second measurement is Area. Area measures the diameter of an ability. There are four values. The first is assumed by default which is Single Target. Then Small, Medium, and Large. These correlate to their distance counterparts, and use the same templates."},{"Term": "Strength","Tags": ["Strength"],"Definition": "An Attribute measuring a character’s physical power, or brawn. Strength is tested to see if a character can hit hard, lift heavy things, or knock down gates. "},{"Term": "Agility","Tags": ["Agility"],"Definition": "An Attribute measuring a character’s finesse and speed. Agility is tested to see if a character can dodge traps, squirm out of ropes, walk quietly, or pick delicate locks."},{"Term": "Intelligence","Tags": ["Intelligence"],"Definition": "An Attribute measuring a character’s wit and experience. Intelligence is tested to see if a character can decipher historical texts, see through illusions, or navigate strange lands."},{"Term": "Spirit","Tags": ["Spirit"],"Definition": "An attribute measuring a character’s personality and heart. Spirit is tested to see if a character can resist temptation, intimidate a superior, negotiate for information, or get up and keep fighting."},{"Term": "Turn","Tags": ["Turn"],"Definition": "A time when one character can use abilities. Other characters can only use abilities marked Reaction during a turn that is not their own. Every character gets the same number of turns: one per round. Turn order is determined by Initiative Order and by players on a team."},{"Term": "Ally","Tags": ["Ally"],"Definition": "A character that is not attacking any player. The opposite of an Enemy"},{"Term": "Enemy","Tags": ["Enemy", "Opponent"],"Definition": "A character that is attacking a player. The opposite of an Ally."},{"Term": "Passive","Tags": ["Passive"],"Definition": "An Ability that is always active. "},{"Term": "Reaction","Tags": ["Reaction"],"Definition": "An Ability that a character can use when it is not his/her turn. Has a Trigger condition which must be true in order to be used. Commonly used as a type of defense. When a reaction is used in response to a reaction, it is called the Stack."},{"Term": "Trigger","Tags": ["Trigger", "Triggered"],"Definition": "A condition that allows the use of an Ability labeled Reaction"},{"Term": "Combat","Tags": ["Combat"],"Definition": "A period of time in which characters are fighting each other. During combat, actions are restricted by special rules. "},{"Term": "Lorem Ipsum","Tags": ["Lorem Ipsum"],"Definition": "Lorem ipsum dolor sit amet"},{"Term": "Defense","Tags": ["Defense"],"Definition": "This is a value that represents a character\'s capability to avoid being hit by melee attacks. Unlike other games, attack rolls are not always opposed by a character\'s defense. Rather, a defender must use a defensive ability (which costs AP) in order to avoid being hit. To repeat: unless opposed, melee attacks ALWAYS hit."},{"Term": "Protection","Tags": ["Protection"],"Definition": "This is a number that reduces the amount of HP lost whenever a character takes Damage. Not to be confused with Defense."},{"Term": "Attack","Tags": ["Attack"],"Definition": "This keyword represents how well a character can hit an opponent. Typically, an attack\'s value value is specified in the ability that calls it. Fallback: If unspecified, the attack is an Agility test. "},{"Term": "Effect","Tags": ["Effect"],"Definition": "The result of an Ability; the effect applied immediately after AP is spent to activate the ability."},{"Term": "Initiative","Tags": ["Initiative"],"Definition": "Initiative is the fancy name for which team goes first in combat. The first team to declare the intention to attack gains Initiative. If you declare an intention to attack, you must follow through with an attack."},{"Term": "AP Action Points","Tags": ["AP", "Action Point"],"Definition": "Action Points (AP for short) are the currency that characters use to activate Abilities in Combat. Characters (normally) gain 5 AP at the start of their turn and 5 AP at the end of their turn, with a maximum of 10 total AP. Characters can store AP between turns, but never more than 10."},{"Term": "Melee","Tags": ["Melee"],"Definition": "An attack made at touch range with a handheld weapon or fists."},{"Term": "Dice","Tags": ["d4", "d6", "d8", "d10", "d12", "d20", "die", "dice"],"Definition": "There are several kinds of polyhedral dice that this game is played with. They are described by their number of sides. For shorthand, we refer to these dice using the letter d. A die with six sides is a d6. A die with 20 sides is a d20. Etc. When you are asked to roll one of these dice, you use the number of the side that lands face-up as the value of your roll. (Note for if you are using physical dice: The d10 is a little unusual because the die commonly has a zero on one side. For the purposes of this game, that zero always has a value of 10. The d4 is also a little strange because it has no upward face. The way you tell what you rolled is by looking at the number that is right-side-up)"},{"Term": "Status","Tags": ["Status", "Statuses"],"Definition": "An indicator of some state that a character is experiencing. Generally, a character only has one instance of a given Status (e.g. a character that is Burning is not double Burning if someone applies the burning status to him again). A character can have any number of Statuses."},{"Term": "Roll","Tags": ["Roll"],"Definition": "A roll is when a person (or computer) rolls some dice. If not specified, it is assumed in this game that the word “roll” refers to a Standard Roll. Other common types of rolls include a Dodge Roll, Damage Roll, and a single die roll (rolling one six sided die)."}]}';
//var jsonString = '{"moves" : [{"Class": "Slayer","Name": "Reckless Charge","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move 10 spaces.","Range": "","Tags" : ["movement","utility","positioning","gap-closer"]},{"Class": "Slayer","Name": "Leaping Chop","AP": "8","Trigger": "","Special": "","Roll": "d20 + 6","Difficulty": "","Effect": "Melee weapon + 6 damage","Range": "Touch","Tags" : ["attack","damage", "melee"]},{"Class": "Slayer","Name": "Giant Killer","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "+2 damage against creatures larger than you.","Range": "","Tags" : ["passive"]},{"Class": "Slayer","Name": "Reptilian Expert","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "+2 damage against lizard, amphibian, and snake like creatures.","Range": "","Tags" : ["passive"]},{"Class": "Slayer","Name": "Corpse Slayer","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "+2 attack against undead.","Range": "","Tags" : ["passive","undead"]},{"Class": "Slayer","Name": "Enflame Weapon","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "On a successful hit, your weapon confers the burning status. Lasts until your next turn.","Range": "","Tags" : ["buff","equipment"]},{"Class": "Slayer","Name": "Freeze Weapon","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "On a successful hit, your weapon confers the frozen status. Lasts until your next turn.","Range": "","Tags" : ["buff","equipment"]},{"Class": "Slayer","Name": "Chink Shot","AP": "5","Trigger": "","Special": "","Roll": "d20 + 3","Difficulty": "","Effect": "Ranged weapon + 4 damage","Range": "Long","Tags" : ["ranged","damage"]},{"Class": "Defender","Name": "Reckless Charge","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move 10 spaces.","Range": "","Tags" : ["movement","utility","positioning","gap-closer"]},{"Class": "Defender","Name": "Take the Blow","AP": "3","Trigger": "An adjacent ally is attacked.","Special": "Reaction","Roll": "","Difficulty": "","Effect": "You may take the damage that they are about to, as if the attack were against you. You must decide this before damage is rolled.","Range": "","Tags" : ["bodyguard","utility","reaction"]},{"Class": "Defender","Name": "Rush to Aid","AP": "3","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move to an ally less than 6 spaces away from you.","Range": "","Tags" : ["positioning","utility","movement","teamwork"]},{"Class": "Defender","Name": "Tag out","AP": "1","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Swap places with an adjacent ally.","Range": "","Tags" : ["positioning","utility","teamwork"]},{"Class": "Defender","Name": "Protective Shove","AP": "1","Trigger": "When an adjacent ally is attacked","Special": "Reaction","Roll": "d20 + Agility","Difficulty": "Attacker agility roll","Effect": "Move the ally 3 spaces and the ally gets +2 Defense until the end of this attack. You must do this before damage is rolled. The ally\'s movement does not cancel the attack even if it puts them out of range.","Range": "Touch","Tags" : ["defense","positioning","utility","reaction"]},{"Class": "Defender","Name": "Lock Down","AP": "4","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "You get +4 Defense until the start of your next turn.","Range": "","Tags" : ["defense","utility"]},{"Class": "Defender","Name": "Team Tactics","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "All allies get +1 defense until the start of your next turn.","Range": "All","Tags" : ["defense","buff","teamwork"]},{"Class": "Defender","Name": "Rallying Cry","AP": "3","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "All allies deal +1 damage until the start of your next turn.","Range": "All","Tags" : ["damage","buff","teamwork"]},{"Class": "Scholar","Name": "Deflecting Blast","AP": "2","Trigger": "An ally is attacked","Special": "Reaction","Roll": "","Difficulty": "","Effect": "The ally gets +1 defense. Can be declared after attack roll.","Range": "Short","Tags" : ["defense","teamwork","reaction"]},{"Class": "Scholar","Name": "Shield","AP": "4","Trigger": "You are attacked.","Special": "Reaction","Roll": "d20 + Agility","Difficulty": "Attacker Agility roll.","Effect": "You get +4 defense until the end of this attack against you.","Range": "","Tags" : ["reaction","Agility","defense"]},{"Class": "Scholar","Name": "Mantis Aura","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "An ally gets a Mantis Aura status until the start of your third turn following this ability (this would be turn 0 for counting purposes). This status grants them +1 AP and +1 Max AP. A character can only have one \'Aura\' status at a time.","Range": "Touch","Tags" : ["buff","AP"]},{"Class": "Scholar","Name": "Cleanse","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Remove all slowed, marked, burning, frozen, immobilized, poisoned, blighted, weakened, or frightened statuses from yourself or an ally","Range": "Touch","Tags" : ["buff","utility"]},{"Class": "Scholar","Name": "Mirrorfield","AP": "3","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "In a small area around you, enemies must make an Intelligence roll with a difficulty of 7 in order to attack as normal. Lasts until the beginning of your next turn.","Range": "Self, Small area","Tags" : ["area","utility"]},{"Class": "Scholar","Name": "Ethereal Dart","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "You pierce a target\'s ethereal essence for 3 damage. Ignores protection from armor.","Range": "Sight","Tags" : ["long-range","damage","utility"]},{"Class": "Scholar","Name": "Transferral","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Transfer one slowed, marked, burning, frozen, immobilized, poisoned, blighted, weakened, or frightened statuses from yourself or an ally to an enemy.","Range": "Medium","Tags" : ["utility","buff"]},{"Class": "Scholar","Name": "Tiger Aura","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "One character gets the Tiger Aura status, which has the effect of making all their attacks get +2 attack and +2 damage. This status lasts until the start of your third turn following this ability (this would be turn 0 for counting purposes). A character may only have 1 Aura status at a time.","Range": "Touch","Tags" : ["buff","damage"]},{"Class": "Scholar","Name": "Ice Fire","AP": "9","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Target must make a difficulty 10 intelligence roll or gain the Burning and Frozen statuses","Range": "Medium","Tags" : ["ranged","status"]},{"Class": "Battlemage","Name": "Arcane Blast","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Shoot a burst of magical energy that explodes a medium area, dealing d6 + 4 damage to all inside. ","Range": "Medium, Medium area","Tags" : ["area","damage"]},{"Class": "Battlemage","Name": "Winter\'s Howl","AP": "8","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "A cyclone of arctic air swirls around, causing any inside to make a difficulty 15 Strength test or get the Frozen status","Range": "Medium, Medium area","Tags" : ["area","status"]},{"Class": "Battlemage","Name": "Firefield","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "A blast of fire engulfs a large area. Anyone inside makes a difficulty 15 Agility roll or gets the Burning status","Range": "Medium, Large area","Tags" : ["area","status"]},{"Class": "Battlemage","Name": "Mud Sigil","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Your fingers trace a mythic shape in the air. One target makes a difficulty 15 Intelligence roll or gets the Slowed status.","Range": "Short","Tags" : ["status","utility"]},{"Class": "Battlemage","Name": "Lightning Bolt","AP": "6","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Shoot lighting dealing d10 damage through a chain of Marked enemies that are short range from each other. The damage ignores Protection from armor. The first enemy in the chain must be short range from you.","Range": "Short","Tags" : [""]},{"Class": "Battlemage","Name": "Astral Missiles","AP": "3","Trigger": "","Special": "","Roll": "d20 + 8","Difficulty": "","Effect": "d4 damage. Ignores protection from armor.","Range": "Medium","Tags" : ["flexible","damage"]},{"Class": "Battlemage","Name": "Fount of Force","AP": "2","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Blasts target with water, knocking them back 3 spaces. Target must make a difficulty 15 Strength roll or be knocked Prone.","Range": "Touch","Tags" : ["utility","flexible"]},{"Class": "Battlemage","Name": "Befuddle","AP": "4","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Target must make a difficulty 20 Intelligence roll or lose 2 AP","Range": "short","Tags" : ["AP","intelligence"]},{"Class": "Assassin","Name": "Shadow Cloak","AP": "3","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "All enemies must make a difficulty 10 Intelligence roll in order to know where you are. In dim light, the difficulty is 15, in darkness the difficulty is 20. Lasts until the beginning of your next turn.","Range": "","Tags" : ["stealth","utility"]},{"Class": "Assassin","Name": "Marked for Death","AP": "1","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "One target acquires the marked status, even if you can\'t see them.","Range": "Any","Tags" : ["teamwork","mark"]},{"Class": "Assassin","Name": "Contracted","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "If an enemy has the marked status, you have +2 attack and +2 damage","Range": "","Tags" : ["mark","damage","passive","teamwork"]},{"Class": "Assassin","Name": "Shadow Walk","AP": "4","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move directly behind an enemy that is currently fighting an ally","Range": "Medium","Tags" : ["movement","utility","teamwork"]},{"Class": "Assassin","Name": "Feint","AP": "2","Trigger": "You are attacked at touch range","Special": "Reaction","Roll": "Agility vs. Intelligence","Difficulty": "","Effect": "The attack misses.","Range": "","Tags" : ["defense","reaction"]},{"Class": "Assassin","Name": "Back Stab","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "When an enemy is between you an an ally, you gain +2 attack and +2 damage","Range": "","Tags" : ["passive","damage"]},{"Class": "Assassin","Name": "Bag of Tricks","AP": "7","Trigger": "You are attacked at touch range","Special": "Reaction","Roll": "","Difficulty": "","Effect": "Roll a d6. On a 1-2: you are too slow and their attack hits you. On a 3-4: they are covered in a cloud of glitter and they miss. On a 5: they miss and are blinded by a puff of smoke, gaining the Stunned status. On a 6: they miss and they go up in flames, gaining the Burning status.","Range": "touch","Tags" : ["reaction","utility","status","defense"]},{"Class": "Hunter","Name": "Hawk\'s Prey","AP": "3","Trigger": "An ally is attacked","Special": "Reaction","Roll": "d20 + 5","Difficulty": "Short-range: 8 + target Defense, Medium-range: 12 + target Defense, Long-range: 16 + target Defense.","Effect": "Deal the target your Ranged Weapon\'s damage","Range": "Any","Tags" : ["reaction","damage","teamwork","trap"]},{"Class": "Hunter","Name": "Arrow Fragment Barrage","AP": "7","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "For each creature in the area, roll a d6, on anything other than a 1, you hit. For each hit, roll ranged weapon damage -1","Range": "Medium, Medium area","Tags" : ["area","damage"]},{"Class": "Hunter","Name": "Running Shot ","AP": "5","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "Move two spaces and make a standard ranged attack","Range": "Long","Tags" : ["ranged","movement","damage"]},{"Class": "Hunter","Name": "Tanglefoot Trap","AP": "4","Trigger": "One character who has the Marked status moved","Special": "Reaction","Roll": "","Difficulty": "","Effect": "You may trip the target, conferring the Prone status","Range": "Medium","Tags" : ["reaction","trap","mark","status"]},{"Class": "Hunter","Name": "Rolling Landing","AP": "1","Trigger": "","Special": "Reaction","Roll": "d20 + Agility","Difficulty": "10","Effect": "On success, when you would be knocked Prone, you are not","Range": "","Tags" : ["reaction","status","defence"]},{"Class": "Hunter","Name": "Smoke Arrow","AP": "3","Trigger": "","Special": "","Roll": "d20 + 6","Difficulty": "Short-range: 10, Medium-range: 15, Long-range: 20","Effect": "Target has -2 attack until the start of your next turn","Range": "long","Tags" : ["status","ranged","flexible"]},{"Class": "Hunter","Name": "Poison Trained","AP": "","Trigger": "","Special": "Passive","Roll": "","Difficulty": "","Effect": "You are immune to the Poisoned status","Range": "","Tags" : ["status","passive","poison"]},{"Class": "Hunter","Name": "Forest Spirit","AP": "1","Trigger": "","Special": "","Roll": "","Difficulty": "","Effect": "If you are near thick foliage or trees, you may dart into it and lose any marks on you (remove the Marked status)","Range": "","Tags" : ["status","utility","environment"]}]}';