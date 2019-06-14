// globals
var content;
var timeLabel;
var cardsLabel;
var gameState = 0;
const START_MODE = 0;
const CHOOSE_CARD_MODE = 1;
const ROUND_ACTION_MODE = 2;
const ROUND_RESULT_MODE = 3;
const PASS_MODE = 4;
var startTime = Date.now();
const startingCards = [1,1,1,2];
const cardNames = [""," 🌹 "," 💀 "]
var cardsInHand = [];
var cardsInPlay = [];
var wins = 0;
window.onload = init;

// initializer
function init() {
  content = document.createElement("div");
  document.body.appendChild(content);
  cardsLabel = document.getElementById("numCards");
  timeLabel = document.getElementById("time");
  updateUI();
}

// util
function addButton(name, listener, fontSize) {
  var button = document.createElement("button");
  button.innerText = name;
  button.onclick = listener;
  if (fontSize != undefined) button.style.fontSize = fontSize;
  content.appendChild(button);
}

// clear the content and add new content
function updateUI() {
  // clear first
  content.innerHTML = "";
  // switch on mode
  switch(gameState) {
    case START_MODE:
      clearState();
      startScreen();
      break;
    case CHOOSE_CARD_MODE:
      chooseCardScreen();
      break;
    case ROUND_ACTION_MODE:
      roundActionScreen();
      break;
    case ROUND_RESULT_MODE:
      roundResultScreen();
      break;
    case PASS_MODE:
      passScreen();
      break;
  }
  // cross-screen ui
  numCards.innerHTML = "In Hand: " + cardsInHand.length + " <br>On Mat: " + cardsInPlay.length;
}

// clear the game state
function clearState() {
  wins = 0;
  cardsInHand = startingCards.slice();
  cardsInPlay = [];
  gameState = 1;
  startTime = Date.now();
}

function startNextRound() {
  for (var i = 0; i < cardsInPlay.length; i++) {
    cardsInHand.push(cardsInPlay[i]);
  }
  cardsInPlay = [];
  gameState = CHOOSE_CARD_MODE;
  updateUI();
}

// play a card
function playCard(handIndex) {
  var removed = cardsInHand.splice(handIndex,1);
  cardsInPlay.push(removed[0]);
}

function choosePlayCard() {
  gameState = CHOOSE_CARD_MODE;
  updateUI();
}

function chooseChallenge() {
  gameState = ROUND_RESULT_MODE;
  updateUI();
}

function choosePass() {
  gameState = PASS_MODE;
  updateUI();
}

function chooseWin() {
  wins++;
  if (wins > 1) {
    alert("YOU WIN!");
    gameState = START_MODE;
    updateUI();
  } else {
    startNextRound();
  }
}

function chooseLose() {
  for (var i = 0; i < cardsInPlay.length; i++) {
    cardsInHand.push(cardsInPlay[i]);
  }
  cardsInPlay = [];
  var removed = cardsInHand.splice(Math.floor(Math.random() * cardsInHand.length),1); // remove random
  if (cardsInHand.length <= 0) {
    alert("YOU LOST! GAME OVER");
    gameState = START_MODE;
    updateUI();
  } else {
    alert("YOU LOST: " +cardNames[removed[0]]);
    startNextRound();
  }
}

function reveal() {
  var popped = cardsInPlay.pop();
  cardsInHand.push(popped);
  alert(cardNames[popped]);
  updateUI();
}

function startScreen() {
  addButton("start", () => {
    clearState();
    updateUI();
  });
}

function chooseCardScreen() {
  for (var i = 0; i < cardsInHand.length; i++) {
    var localIndex = i;
    addButton(
      cardNames[cardsInHand[i]],
      () => {
        playCard(localIndex);
        gameState = ROUND_ACTION_MODE;
        updateUI();
      },
      "2em");
  }
}

function roundActionScreen() {
  if (cardsInHand.length > 0) addButton("Play Another Card", choosePlayCard);
  addButton("Challenge", chooseChallenge);
  addButton("Pass", choosePass);
}

function roundResultScreen() {
  if (cardsInPlay.length > 0) addButton("Reveal Top Card",reveal);
  addButton("Win",chooseWin);
  addButton("Lose",chooseLose);
  addButton("Pass",choosePass);
}

function passScreen() {
  if (cardsInPlay.length > 0) addButton("Reveal Top Card",reveal);
  addButton("Next Round", startNextRound);
}
