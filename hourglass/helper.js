function $(s) {
    return document.querySelector(s);
}

class Color {
    constructor(r,g,b,a)
    {
        this.r = r === undefined ? 1 : r;
        this.g = g === undefined ? 1 : g;
        this.b = b === undefined ? 1 : b;
        this.a = a === undefined ? 1 : a;
    }

    // css
    toString() {
        function hex(c) {
            var hex = Math.floor(255 * c).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex(this.a)}`;
    }
}

class ColorGradient {
    constructor(keys) {
        this.keys = keys;
    }
    
    getColor(percent) {
        if (this.keys === undefined || this.keys.length === 0) {
            return new Color();
        }
        
        let keys = this.keys;

        // Handle out-of-bounds cases
        if (percent <= keys[0].position) {
            return keys[0].color;
        }
        if (percent >= keys[keys.length - 1].position) {
            return keys[keys.length - 1].color;
        }

        // Find the two keys that bound the `percent`
        for (let i = 0; i < keys.length - 1; i++) {
            const startKey = keys[i];
            const endKey = keys[i + 1];

            if (percent >= startKey.position && percent <= endKey.position) {
                // Normalize `percent` to the range [0, 1] between the two keys
                const normalizedPercent =
                    (percent - startKey.position) / (endKey.position - startKey.position);
                // Interpolate colors
                return lerpColors(startKey.color, endKey.color, normalizedPercent);
            }
        }

        // Should never reach here
        return new Color();
    }
}

class GradientKey {
    constructor(color, position) {
        this.color = color;
        this.position = position;
    }
}

function lerpColors(a, b, percent) {
    let x = 1 - percent;
    let y = percent;
    return new Color(
        a.r * x + b.r * y,
        a.g * x + b.g * y,
        a.b * y + b.b * y,
        a.a * x + b.a * y,
    );
}

function saveSession() {
    sessionState.lastSaveTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    localStorage.setItem(SAVE_KEY, getStateJsonString());
    let saveMessage = "saved " + sessionState.lastSaveTime;
    console.log(saveMessage);
}

function showSavedToast(durationMs) {
    let saveMessage = "saved " + sessionState.lastSaveTime;
    showToast(saveMessage, durationMs);
}


function getLocallySavedSession() {
    var sessionString = localStorage.getItem(SAVE_KEY);
    if (sessionString == undefined) sessionString = JSON.stringify(saveState);
    return JSON.parse(sessionString);
}

function migrateLegacySession(sessionObject) {
    let keys = Object.keys(saveState);
    for (let i = 0; i < keys.length; i++) {
        if (sessionObject[keys[i]] == undefined) {
            sessionObject[keys[i]] = saveState[keys[i]];
        }
    }
    return sessionObject;
}

function asymptote(x) {
    return 1 - 1 / (x+1);
}

function alertErrors() {
    window.onerror = function(msg, url, linenumber) {
        alert('Error: '+msg);
        return false;
    }
}

function getStateJsonString() {
    return JSON.stringify(saveState);
}

function showToast(message, durationMs) {
    ui.toast.classList.add("show");
    ui.toast.innerHTML = message;
    window.setTimeout(hideToast, durationMs || 1000);
}

function hideToast() {
    ui.toast.classList.remove("show");
}

var supportsTouch = false;
if ('ontouchstart' in window) {
    //iOS & android
    supportsTouch = true;

} else if(window.navigator.msPointerEnabled) {

    // Windows
    // To test for touch capable hardware 
    if(navigator.msMaxTouchPoints) {
        supportsTouch = true;
    }

}