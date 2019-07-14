// globals
var content;
var timeLabel;
var cardsLabel;
var gameState = 0;
const FLIP_CARD_MODE = 0;
const PLAY_CARD_MODE = 1;
const REMOVE_CARD_MODE = 2;
var startTime = Date.now();
const startingCards = [1,1,1,2];
const cardNames = ["INVALID"," 🌹 "," 💀 "]
var cards = [];
var cardStack = [];
var revealed = [];
var wins = 0;
window.onload = init;

class Card {
  constructor(uniqueId) {
    this.uniqueId = uniqueId;
    this.type = startingCards[uniqueId];
    this.played = false;
    this.flipped = false;
    this.removed = false;
  }

  getName() {
    return cardNames[this.type];
  }

  flip() {
    this.flipped = !this.flipped;
  }
}

// initializer
function init() {
  content = document.createElement("div");
  document.body.appendChild(content);
  cardsLabel = document.getElementById("numCards");
  timeLabel = document.getElementById("time");
  clearState();
  updateUI();
}

// util
// ---
function addRow() {
  content.appendChild(document.createElement("p"));
}

function addButton(name, listener, fontSize, className) {
  var button = document.createElement("button");
  button.innerText = name;
  button.onclick = listener;
  if (fontSize != undefined) button.style.fontSize = fontSize;
  if (className != undefined) button.className = className;
  content.appendChild(button);
}

function addCardButton(card, click) {
  var button = document.createElement("button");
  var cardName = card.getName();
  if (card.flipped) cardName = "❓";
  button.innerText = cardName;
  button.onclick = click;
  button.style.fontSize = "3em";
  var className = "card";
  if (card.removed) className += " removed";
  button.className = className;
  content.appendChild(button);
}

function addModeButton(name, mode) {
  addButton(name, () => { gameState = mode; updateUI(); }, "1em", gameState == mode ? "selected" : "");
}

// clear the content and add new content
function updateUI() {
  // clear first
  content.innerHTML = "";
  // mode buttons
  addModeButton("Flip", FLIP_CARD_MODE);
  addModeButton("Play", PLAY_CARD_MODE);
  addModeButton("Remove", REMOVE_CARD_MODE);
  addRow();

  // switch on state
  switch(gameState) {
    case FLIP_CARD_MODE:
      flipMode();
      break;
    case PLAY_CARD_MODE:
      playMode();
      break;
    case REMOVE_CARD_MODE:
      removeMode();
      break;
  }

  addRow();

  // show / hide button
  privatePublicButton();
}

// clear the game state
function clearState() {
  wins = 0;
  gameState = 0;
  getNewHand();
  startTime = Date.now();
}

function getNewHand() {
  cardsInHand = [];
  for (var i = 0; i < startingCards.length; i++) {
    cards.push(new Card(i)); // use int for type
  }
  console.log(cards);
  var indices = getShuffleArr(cards);

  console.log(indices);
  console.log("---");
  var temp = [];
  for (var i = 0; i < indices.length; i++) {
    temp.push(cards[indices[i]]);
  }
  cards = temp;
  console.log(cards);
}

function flip(card) {
  card.flip();
}

function toggleRemoved(card) {
  card.removed = !card.removed;
}

function play(card) {
  if (card.removed) return;
  cardStack.push(card);
  card.played = true;
  card.flipped = true;
}

function flipMode() {
  cardState(flip);
}

function removeMode() {
  cardState(toggleRemoved);
}

function playMode() {
  cardState(play);
}

function revealPlayedCard() {
  if (cardStack.length <= 0) return;
  var c = cardStack[cardStack.length-1];
  console.log(cardStack);
  cardStack.pop(); // splice(revealed.indexOf(c),1)
  console.log(cardStack);
  revealed.push(c);
  c.flipped = false;
  updateUI();
}

function returnPlayedCard(card) {
  revealed.splice(indexOfCard(revealed,card),1);
  card.played = false;
}

function indexOfCard(arr, card) {
  return indexOfCardWithId(arr,card.uniqueId)
}

function indexOfCardWithId(arr, id) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].uniqueId == id) return i;
  }
  return -1;
}

function cardState(cardAction) {
  function useCardLocal(action, c) {
    return function() {
      action(c);
      updateUI();
    }
  }
  addButton("Stack: " + cardStack.length, revealPlayedCard)
  for (var i = 0; i < revealed.length; i++) {
      addCardButton(revealed[i], useCardLocal(returnPlayedCard, revealed[i]));
  }
  addRow();
  for (var i = 0; i < cards.length; i++) {
    if (!cards[i].played)
      addCardButton(cards[i], useCardLocal(cardAction, cards[i]));
  }
}

function showHideAll(flipped) {
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].played) continue; // don't mess with played cardStack
    cards[i].flipped = flipped;
  }
  updateUI();
}

function privatePublicButton() {
  addButton("Hide All", () => { showHideAll(true); });
  addButton("Show All", () => { showHideAll(false); });
}

function getShuffleArr(arr) {
  var vals = [];
  var indices = [];
  for (var i = 0; i < arr.length; i++) {
    indices.push(i);
    vals.push(Math.random());
  }
  console.log(indices);
  console.log(vals);
  for (var i = 0; i < arr.length; i++) {
    var min = 100;
    var minIndex = -1;
    for (var j = i; j < arr.length; j++) {
      if (vals[j] < min) {
        min = vals[j];
        minIndex = j;
      }
    }
    var temp = vals[i];
    var temp2 = indices[i];
    vals[i] = min;
    indices[i] = indices[minIndex];
    vals[minIndex] = temp;
    indices[minIndex] = temp2;
  }
  return indices;
}
