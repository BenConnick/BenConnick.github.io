/* 
 * this js file controls everything behind the scenes
 * "Future Gladiator" Kevin MacLeod (incompetech.com) 
    Licensed under Creative Commons: By Attribution 3.0
    http://creativecommons.org/licenses/by/3.0/
 */
// vars
var mode = "menu";
var attackIntervalMinutes;
var totalMinutes;
var player = {
    Lvl: 1,
    HP: 100,
    XP: 0
};
var monsterHealth;
var damage;
var monsterName;
var overtime = false;
var timeout;

// setup
changeMode("menu");
// onload
$(function() {
    // example demo values
    $("#name").val("Essay");
    $("#time").val(120);
    $("#interval").val(10);
});

// menu functions
$("#GO").click(function() { go(); } );

// waiting screen
// eyes blink every 4 sec
window.setInterval(function() { blink(); }, 4000); 

function go() {
    if (!parseInt($("#interval").val()) || !parseInt($("#time").val()) || !$("#name").val() || (parseInt($("#time").val()) < parseInt($("#interval").val()))) {
        alert("please fill all input fields with appropriate input");
    }
    else {
        monsterHealth = 100;
        player.HP = 100;
        attackIntervalMinutes = parseInt($("#interval").val());
        totalMinutes = parseInt($("#time").val());
        damage = attackIntervalMinutes/totalMinutes*100;
        monsterName = $("#name").val();
        changeMode("waiting");
        startTimer(); // start the player timer
        timeout = window.setTimeout(function() { timeUp();  }, 1000*60*attackIntervalMinutes); // alert after the interval
        //timeout =  window.setTimeout(function() { timeUp();  }, 3000); // insta mode
    }
}

var timer = {
    hours: 0,
    minutes: 0,
    seconds: 0
};

function startTimer() {
    timer.hours = Math.floor(totalMinutes/60);
    timer.minutes = totalMinutes%60;
    tickTimer();
}

function resumeTimer() {
    tickTimer();
}

function tickTimer() {
    if (mode !== "waiting") {
        return;
    }
    if (!overtime) {
        timer.seconds--;
        if (timer.seconds < 0) {
            timer.seconds = 59;
            timer.minutes--;
        }
        if (timer.minutes<0) {
            timer.minutes = 59;
            timer.hours--;
        }
        if (timer.hours<0) {
            timer.hours = 0;
            timer.minutes = 0;
            timer.seconds = 0;
            $("#timer").css("color", "red");
            overtime=true;
        }
    }
    else {
        timer.seconds++;
        if (timer.seconds > 59) {
            timer.seconds = 0;
            timer.minutes++;
        }
        if (timer.minutes > 59) {
            timer.minutes = 0;
            timer.hours++;
        }
    }
    setTimeout(function() { tickTimer(); },1000); // real time
    $("#timer").text(""+timer.hours+":"+doubleDigits(timer.minutes)+":"+doubleDigits(timer.seconds));
}

function doubleDigits(digit) {
    if (digit < 10) {
        return "0"+digit;
    }
    else {
        return digit;
    }
}

function blink(closeTime) {
    if (!closeTime) { closeTime = 50; }
    if (mode !== "waiting") {
        return;
    }
    $("#left_eye").animate({ top: "40%", height: "0%"},closeTime,"linear",
    function() {
        if (closeTime>1000 && monsterHealth > 0) { shake(10); }
        $("#left_eye").animate({height: "45%", top: "20%"},{duraction: 50});
    });
    $("#right_eye").animate({ top: "40%", height: "0%"},closeTime,"linear",
    function() {
        $("#right_eye").animate({height: "45%", top: "20%"},{duraction: 50});
    });
}

function changeMode(modeStr) {
    mode = modeStr;
    if (mode == "menu") {
        $("#menuBounds").css("display","block");
        $("#waitingBounds").css("display","none");
        $("#choiceBounds").css("display","none");
        $("#winBounds").css("display","none");
        $("#loseBounds").css("display","none");
    }
    if (mode == "waiting") {
        $("#menuBounds").css("display","none");
        $("#waitingBounds").css("display","block");
        $("#choiceBounds").css("display","none");
        $("#winBounds").css("display","none");
        $("#loseBounds").css("display","none");
    }
    if (mode == "choice") {
        $("#menuBounds").css("display","none");
        $("#waitingBounds").css("display","none");
        $("#choiceBounds").css("display","block");
        $("#winBounds").css("display","none");
        $("#loseBounds").css("display","none");
    }
}

function playSound(str) {
    var audio = document.createElement("audio");
    $("body").append(audio);
    audio.innerHTML = "<p>Your browser does not support the audio element.</p>";
    audio.src = str;
    audio.className = "herp";
    //console.log("audio classname: " + audio.className);
    audio.addEventListener("ended", function () {
         $(this).remove();
    }, false);
    audio.addEventListener("pause", function () {
        $(this).remove();
    }, false);
    audio.play();     
}
    
function pauseAllAudio() {
    var audioElements = document.getElementsByClassName('herp');
    console.log("audioElements.length = "+audioElements.length);
    for (i = 0; i < audioElements.length; i++) {
            audioElements[i].pause();
    }
}

function adjustHealthBars() {
    $("#monsterHealthBar").animate({height: ""+monsterHealth/100*98+"%"},100,"swing",function() {checkWinCondition();});
    $("#playerHealthBar").animate({height: ""+player.HP/100*98+"%"},100,"swing",function() {checkLoseCondition();});
    
}

function checkWinCondition() {
    if (monsterHealth < 1) {
        window.clearTimeout(timeout);
        $("#winBounds").css({opacity: 0, display: "inline-block"});
        $("#winText").text("You have vanquished the "+monsterName);
        $("#winBounds").animate({opacity: 1},2000);
    }
}

function checkLoseCondition() {
    if (player.HP < 1) {
        window.clearTimeout(timeout);
        $("#loseBounds").css({opacity: 0, display: "inline-block"});
        var r = Math.floor(Math.random()*(quotes.length));
        $("#loseText").text(quotes[r]);
        $("#source").text(sources[r]);
        console.log(quotes[r]);
        console.log($("#loseText").text());
        $("#loseBounds").animate({opacity: 1},2000);
    }
}

function timeUp() {
    playSound("battle-music.mp3");
    changeMode("choice");
    var rand = Math.floor(Math.random()*(yesChoices.length));
    console.log(rand);
    $("#yesText").text("\n"+yesChoices[rand]);
    $("#noText").text("\n"+noChoices[rand]);
}

function resize() {
    var preferredWidth = 800;  
    var currentWidth = $("#waitingBounds").width();
    var ratio = currentWidth / preferredWidth;
    var newFontSize = (2.6 * ratio);
    $("#timer").css("font-size",""+newFontSize+"em");
    $("#yes").css("font-size",""+1.5*newFontSize+"em");
    $("#no").css("font-size",""+1.5*newFontSize+"em");
    $("#timer").css("top",""+(-10*ratio + 5)+"%");
    $("#winText").css("font-size",""+newFontSize+"em");
    $("#loseText").css("font-size",""+0.8*newFontSize+"em");
    $("#source").css("font-size",""+0.4*newFontSize+"em");
    $(".clickPrompt").css("font-size",""+0.4*newFontSize+"em");
}
resize();

window.onresize = function() {resize();}; 

var yesChoices = ["Working Hard", "Getting it Done","Taking Care of Business","Kicking Butt","In the Zone"];
var noChoices = ["Hardly Working", "Getting Distracted",'"Taking a Break"',"Kicking Back","In the Clouds"];

$("#yes").click(function() {resolve(true);});
$("#no").click(function() {resolve(false);});

function resolve(isWorking) {
    pauseAllAudio();
    changeMode("waiting");
    if (isWorking) {
        blink(2000);
        $("#waitingBounds").css("background-color","white");
        monsterHealth-=damage;
        playSound("bells.wav");
        window.setTimeout(function() {$("#waitingBounds").css("background-color","black");},2000);
    }
    else {
        playSound("evil-laugh.wav");
        overtime ? console.log("overtime") : console.log("not overtime");
        overtime ? player.HP-=(2*damage) : player.HP-=damage;
        $("#waitingBounds").css("background-color","red");
        overtime ? bigShake(30) : shake(20);
    }   
    adjustHealthBars();
    resumeTimer(); // resume the player timer
    timeout = window.setTimeout(function() { timeUp();  }, 1000*60*attackIntervalMinutes); // alert after the interval
    //timeout = window.setTimeout(function() { timeUp();  }, 3000); // insta mode
}

function shake(count) {
    // count is the number of up and down cycles
    if (count < 0) { $("#waitingBounds").css("background-color","black"); return; }  
    window.setTimeout(function() {shake(count-1);},50);
    $("#waitingBounds").css("top","-5%");
    window.setTimeout(function() {$("#waitingBounds").css("top","0%");},25);   
}

function bigShake(count) {
    // count is the number of up and down cycles
    if (count < 0) { $("#waitingBounds").css("background-color","black"); return; }  
    window.setTimeout(function() {bigShake(count-1);},50);
    $("#waitingBounds").css({top: "-15%", left: "20%"});
    window.setTimeout(function() {$("#waitingBounds").css({top: "0%", left: "0%"});},25);   
}

$("#winBounds").click(function() { resetGameStates(); changeMode("menu"); });

$("#loseBounds").click(function() { resetGameStates(); changeMode("menu"); });

function resetGameStates() {
    mode = "menu";
    timer.hours = 0;
    timer.minutes = 0;
    timer.seconds = 0;
    player.HP = 100;
    monsterHealth = 100;
    overtime = false;
    timeout = null;
    $("#monsterHealthBar").css("height","98%");
    $("#playerHealthBar").css("height","98%");
}