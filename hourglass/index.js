const SAVE_KEY = "serializedGameState"

class Hourglass {
    constructor(id, durationSeconds, renderer) {
        this.id = id;
        this.durationSeconds = durationSeconds;
        this.secondsRemaining = durationSeconds;
        this.renderer = renderer;
        this.clickCount = 0;
        this.fillReverse = false;
        this.refillStartSecondsRemaining = 1;
        
        this.renderer.outer.ontouchstart = () => {
            this.onClick()
        };this.renderer.outer.onmousedown = () => {
            this.onClick()
        };
    }
    
    getPercent() {
        return this.secondsRemaining / this.durationSeconds;
    }
    
    update(dt) {
        this.secondsRemaining += (this.fillReverse ? 1 : -1) * dt / 1000;
        
        // if refill reached max
        if (this.secondsRemaining > this.durationSeconds) {
            this.fillReverse = false;
            this.durationSeconds += this.durationSeconds - this.refillStartSecondsRemaining;
            this.secondsRemaining = this.durationSeconds - dt/1000;
            this.refillStartSecondsRemaining = this.secondsRemaining;
        }
    }
    
    draw() {
        if (this.prevDuration != this.durationSeconds) {
            this.renderer.setBarLength(this.durationSeconds);
            this.prevDuration = this.durationSeconds;
        }
        this.renderer.setPercentFill(this.getPercent(), this.durationSeconds, this.fillReverse);
    }
    
    restartTimer() {
        this.secondsRemaining = this.durationSeconds;
    }
    
    onClick() {
        if (this.fillReverse) {
            return;
        }
        this.clickCount++;
        this.fillReverse = true;
        this.refillStartSecondsRemaining = this.secondsRemaining;
        if (this.clickCount == 1) {
            createNextHourglass();
        }
    }
}

class HourglassRenderer {
    constructor(hourglassDOMElement) {
        this.outer = hourglassDOMElement; 
        this.inner = hourglassDOMElement.children[0];
    }
    setPercentFill(percentile, duration, isRefilling) {
        const countdownStart = 10;
        let secondsRemaining = percentile * duration;
        let colorGradientParam = (secondsRemaining / countdownStart);
        let color = hourglassGradient.getColor(colorGradientParam);
        if (isRefilling) color = lerpColors(color, new Color(1,1,1), 1-percentile);
        let colorString = `${color}`;
        // this.inner.style.backgroundColor = colorString;
        this.outer.removeChild(this.inner);
        this.inner = createSvgArc(50, percentile * 360, 50, 30, colorString);
        this.outer.appendChild(this.inner);
        // this.inner.style.width = `${percentile*100}%`;
    }
    
    setBarLength(barLength) {
        //this.outer.style.width = barLength + 'ex';
    }
    
    playFlipAnimation() {
        showToast("todo flip animation");
    }
    
    playShakeAnimation() {
        showToast("todo shake animation");
    }
}

// DOM page elements
let ui = {
    gameParent: undefined,
    toast: undefined,
    scoreLabel: undefined,
    gameOverPanel: undefined,
    gameOverScoreLabel: undefined,
    highScoreLabel: undefined,
}

// saved state
let saveState = {
    highScore: 0,
}

// game-specific values
let gameState = {
    hourglasses: [],
    score: 0,
}

// values that are not saved
let sessionState = {
    lastSaveTime: '',
    gameState: gameState,
}

const hourglassGradient = new ColorGradient([
    new GradientKey(new Color(1,0,0), 0.0),
    new GradientKey(new Color(1,1,0), 0.5),
    new GradientKey(new Color(0,1,0), 1.0),
]);

let prevTime = performance.now();
let lastSpawnHourglassTime = performance.now();

function onTick(timeSinceStart) {
    if (timeSinceStart === undefined) timeSinceStart = 0;
    let dt = timeSinceStart - prevTime;
    prevTime = timeSinceStart;
    
    /* game logic */
    
    if (gameState.gameOver) {
        ui.gameOverPanel.classList.remove("hidden");
        if (gameState.score > saveState.highScore) {
            saveState.highScore = gameState.score;
            ui.gameOverScoreLabel.innerText = "New High Score!"
            saveSession();
        }
        else {
            ui.gameOverScoreLabel.innerText = "Score: " + gameState.score;
        }
        ui.highScoreLabel.innerText = "High Score: " + saveState.highScore
        return;
    }
    
    // decrement bars
    for (var i=0; i<gameState.hourglasses.length; i++) {
        let hourglass = gameState.hourglasses[i];
        
        // update hourglass state
        hourglass.update(dt);
        
        // check lose condition
        if (hourglass.secondsRemaining < 0) {
            hourglass.renderer.outer.classList.add("empty");
            gameState.gameOver = true;
        }
        
        hourglass.draw();
    }
    
    // check add hourglass condition
    if (gameState.score == 0) {
        createNextHourglass();
    }
    // if (timeSinceStart - lastSpawnHourglassTime > gameState.score * 1000) {
    //     lastSpawnHourglassTime = timeSinceStart;
    //     gameState.score++;
    //     createNextHourglass();
    // }
    
    /* update ui */
    ui.scoreLabel.innerText = gameState.score;
    
    window.requestAnimationFrame(onTick);
}

function onLoad() {
    alertErrors();
    linkUI();
    saveState = migrateLegacySession(getLocallySavedSession());
    rebuildUI();
    showToast("Click the timers!");

    onTick(performance.now());
}

let initialDuration = 5;
let randomComponentRange = 0;
let rateChange = 0.51;

function getNextHourglassDuration() {
    let minMin = .1;
    let maxMin = 1;
    let maxMax = 10;
    let minMax = 1;
    function lerp(a, b, t) {
        t = Math.min(Math.max(t,0),1);
        return a * (1-t) + b * t;
    } 
    let min = lerp(maxMin, minMin, randomComponentRange);
    let max = lerp(minMax, maxMax, randomComponentRange);
    let factor = lerp(min, max, Math.random());
    console.log(`t:${randomComponentRange} min:${min} max:${max} factor:${factor}`);
    
    randomComponentRange += rateChange;
    return initialDuration + initialDuration * factor;
}

function createNextHourglass() {
    // visuals
    let domElement = createHourglassGraphic();
    let renderer = new  HourglassRenderer(domElement);

    // model
    let durationSeconds = getNextHourglassDuration();
    let hourglass = new Hourglass(gameState.hourglasses.length, durationSeconds, renderer);
    gameState.score++;
    
    // show
    gameState.hourglasses.push(hourglass);
    addHourglassGraphic(domElement);
}

function addHourglassGraphic(hourglassDOMElement) {
    ui.gameParent.appendChild(hourglassDOMElement);
}

function createHourglassGraphic() {
    var outerElement = document.createElement("div");
    outerElement.classList.add("hourglass");
    var fill = document.createElement("div");
    fill.classList.add("fill");
    outerElement.appendChild(fill);
    return outerElement;
}

function linkUI() {
    var uiElementNames = Object.keys(ui);
    for (var i = 0; i < uiElementNames.length; i++) {
        var uiElementName = uiElementNames[i];
        ui[uiElementName] = $("#" + uiElementName);
        if (ui[uiElementName] == undefined) {
            console.error("Expected html tag with id='" + uiElementName + "'");
        }
    }
}

function rebuildUI() {
    updateUI();
}


function updateUI() {

}


function restart() {
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.hourglasses.length = 0;
    ui.gameOverPanel.classList.add("hidden");
    clearDOM(ui.gameParent);
    onTick(performance.now());
}

function clearDOM(myNode) {
    while (myNode.lastChild) {
        myNode.removeChild(myNode.lastChild);
    }
}

window.onload = onLoad;