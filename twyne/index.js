const SAVE_KEY = "serializedGameState"

const linkRegex = /\[\[(.*?)\]\]/g;
const complexLinkRegex = /\[\[(.*?)\|(.*?)\]\]/g;
const linkRegexReplace = "<a href='' data-target='$1' onclick='handleLinkClick(event)'>$1</a>"
const complexLinkReplaceRegex = "<a href='' data-target='$2' onclick='handleLinkClick(event)'>$1</a>";

// DOM page elements
let ui = {
    outputTextField: undefined,
    inputTextField: undefined,
    passageInputField: undefined,
    passageDropdownButton: undefined,
    submitButton: undefined,
    deleteButton: undefined,
    toggleButton: undefined,
    viewPanel: undefined,
    editPanel: undefined,
    toast: undefined,
    historyPanel: undefined,
    downloadButton: undefined,
    uploadButton: undefined,
    shareButton: undefined,
    editingToolbar: undefined,
}

// saved state
let state = {
    currentSelection: 0,
    passages:    {},
}

// values that are not saved
let sessionState = {
    history: [],
    lastSavedLink: undefined,
    lastSaveTime: '',
    playtest: false
}

function onLoad() {
    alertErrors();
    overloadSaveKeyboardShortcut();
    linkUI();
    state = migrateLegacySession(getLocallySavedSession());
    tryLoadFromLink();
    rebuildUI();
}

function tryLoadFromLink() {
    // is this a share link 
    let loadResult = { decoded: undefined };
    if (tryGetShareLinkGame(loadResult) && loadResult.decoded != undefined) {
        state = migrateLegacySession(loadResult.decoded);
        ui.toggleButton.checked = false;
        changeSelectionInternal(0); // this is a playtest link, load the first passage
        sessionState.playtest = true;
    }
}

function tryGetShareLinkGame(loadResult) {
    if (window.location.href.indexOf("?") > -1) {
        let decoded = decodeUrl();
        if (decoded != undefined) {
            loadResult.decoded = decoded;
            return true;
        }
    }
    return false;
}

function decodeUrl() {
    let start = window.location.href.indexOf("?");
    let encoded = window.location.href.substring(start+1);
    if (encoded === undefined) {
        return undefined;
    }
    let json = decodeURI(encoded);
    return JSON.parse(json);
}

function overloadSaveKeyboardShortcut() {
    document.addEventListener('keydown', function(event) {
        // Check if Ctrl or Cmd is pressed along with the 'S' key
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault(); // Prevent the default save action
            saveSession();
            showSavedToast(1500);
        }

        if ((event.ctrlKey || event.metaKey) && event.keyCode === 13) {
            event.preventDefault(); // Prevent the default save action
            onPassageSubmit();
        } 
    });
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
    
    ui.outputTextField = $("#outputTextField");
    ui.passageDropdownButton.onchange = onPassageUIChanged;
    ui.submitButton.onclick = onPassageSubmit;
    ui.deleteButton.onclick = onDeletePressed;
    ui.uploadButton.onclick = onUploadPressed;
    ui.downloadButton.onclick = onDownloadPressed;
    ui.shareButton.onclick = onSharePressed;
    
    // special
    ui.toggleButton = $("#toggleButton input");
    ui.toggleButton.onclick = onEditModeToggled;
}

function onEditModeToggled() {
    sessionState.playtest = false;
    updateUI();
}

function onPassageUIChanged() {
    let optionIndex = ui.passageDropdownButton.value;
    if (optionIndex == undefined || optionIndex == Number.NaN) return;
    changeSelectionInternal(optionIndex);
    rebuildUI();
}

function rebuildUI() {
    ui.passageDropdownButton.innerHTML = "";
    if (state == undefined || state.passages == undefined) {
        console.error("cannot refresh ui, state is undefined")
    }
    let passageKeys = getPassageKeys();
    let numPassages = passageKeys.length;
    for (let i = 0; i < numPassages; i++) {
        let selectChild = `<option value='${[i]}'>${passageKeys[i]}</option>`;
        ui.passageDropdownButton.innerHTML += selectChild;
    }
    updateUI();
}

function getPassageKeys() {
    let passageKeys = Object.keys(state.passages);
    return passageKeys;
}

function getPassageID(index) {
    return getPassageKeys()[index];
}

function getPassage(ID) {
    return state.passages[ID];
}

function getPassageIndex(passageID) {
    return getPassageKeys().indexOf(passageID);
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
    if (sessionString == undefined) sessionString = JSON.stringify(state);
    return JSON.parse(sessionString);
}

function migrateLegacySession(sessionObject) {
    let keys = Object.keys(state);
    for (let i = 0; i < keys.length; i++) {
        if (sessionObject[keys[i]] == undefined) {
            sessionObject[keys[i]] = state[keys[i]];
        }
    }
    return sessionObject;
}

function onPassageSubmit() {
    if (ui.passageInputField.value == undefined || passageInputField.value == "") {
        alert('Did not save, ID field must is required');
        return;
    }
    let idValue = ui.passageInputField.value;
    let contentValue = ui.inputTextField.value;
    addPassage(idValue, contentValue);
    
    // if there is are link in the passage that don't exist yet, create new passages
    let newPassageObject = { ID: undefined };
    createLinkedPassages(contentValue, newPassageObject);
    // auto select most recent new passage for ease of continuous editing
    let nextSelection = newPassageObject.ID ?? idValue;
    changeSelectionInternal(getPassageIndex(nextSelection));
    saveSession();
    showSavedToast(500);
    rebuildUI();
}

function createLinkedPassages(rawText, outObject) {
    let matches = rawText.match(linkRegex);
    if (matches == undefined || matches.length == 0) {
        return;
    }
    for (let i = 0; i < matches.length; i++) {
        let linkID = matches[i];
        linkID = linkID.replace(complexLinkRegex, '$2');
        linkID = linkID.replace(linkRegex, '$1');
        if (passageExists(linkID) == false) {
            addPassage(linkID, "");
            if (outObject) outObject.ID = linkID;
        }
    }
}

function getLastLink(rawText) {
    let matches = rawText.match(linkRegex);
    if (matches == undefined || matches.length == 0) {
        return undefined;
    }
    let linkID = matches.at(-1);
    linkID = linkID.replace(complexLinkRegex, '$2');
    linkID = linkID.replace(linkRegex, '$1');
    sessionState.lastSavedLink = linkID;
    console.log(linkID);
    return linkID;
}

function addPassage(id, content) {
    state.passages[id] = content;
}

function updateUI() {
    updatePassageUI();
    updateHistoryUI();
}

function updatePassageUI() {
    displayPassage(getPassageID(state.currentSelection));
}

function updateHistoryUI() {
    let historyHTML = "<summary>History</summary>"
    for (var i = sessionState.history.length-1; i >= 0; i--) {
        let linkTag = linkRegexReplace.replaceAll("$1", sessionState.history[i]);
        historyHTML += linkTag + "<br/>";
    }
    ui.historyPanel.innerHTML = historyHTML;
}

function isEditMode() {
    return ui.toggleButton.checked;
}

function updatePanelsVisibility() {
    if (isEditMode()) {
        ui.viewPanel.classList.add("hidden");
        ui.editPanel.classList.remove("hidden");
    }
    else {
        ui.viewPanel.classList.remove("hidden");
        ui.editPanel.classList.add("hidden");
    }
    if (sessionState.playtest) {
        ui.editingToolbar.classList.add("hidden");
    }
    else {
        ui.editingToolbar.classList.remove("hidden");
    }
}

function displayPassage(id) {
    updatePanelsVisibility();
    let passageContent = getPassage(id);
    if (passageContent == undefined) {
        ui.outputTextField.innerHTML = `Passage with id '${id}' not found.`;
    }
    else {
        displayPassageInner(id, passageContent);
    }
}

function displayPassageInner(id, content) {
    ui.outputTextField.innerHTML = reformatLinksInString(content);
    ui.passageInputField.value = id;
    ui.inputTextField.value = content;
    changeSelectionInternal(getPassageIndex(id));
    ui.passageDropdownButton.value = state.currentSelection;
    automaticallyAddToHistory(id);
}

function automaticallyAddToHistory(id) {
    const maxHistoryLength = 10;
    let h = sessionState.history;
    let len = h.length;
    
    // remove old entry, will add back later
    for (let i = 0; i < len; i++) {
        if (h[i] == id) {
            h.splice(i,1);
            break;
        }
    }
    len = h.length; // length may have changed
    
    // limit history length
    if (len >= maxHistoryLength) {
        h.splice(0, len-maxHistoryLength);
    }
    h.push(id);
}

function changeSelectionInternal(index) {
    // note: does not update UI
    state.currentSelection = index;
}

function reformatLinksInString(source) {
    // check for complex links first
    let formatted = source.replace(complexLinkRegex, complexLinkReplaceRegex);
    // then treat all [[]] syntax as simple links
    formatted = formatted.replace(linkRegex, linkRegexReplace);
    return formatted
}

function alertErrors() {
    window.onerror = function(msg, url, linenumber) {
        alert('Error: '+msg);
        return false;
    }
}

function onDeletePressed() {
    let confirmMessage = `Delete passage '${getPassageID(state.currentSelection)}'?`;
    if (confirm(confirmMessage)) {
        Reflect.deleteProperty(state.passages, getPassageID(state.currentSelection));
        if (state.currentSelection >= getPassageKeys().length) {
            state.currentSelection--;
        }
        saveSession();
        showSavedToast(500);
        rebuildUI();
    }
}

function passageExists(id) {
    return getPassage(id) != undefined;
}

function handleLinkClick(event) {
    
    try {
        // Get the href attribute of the clicked <a> tag
        const id = event.srcElement.dataset.target;
        
        if (!passageExists(id)) {
            showToast(`Passage with id '${id}' not found.`);
        }
        else {
            // add to history
            automaticallyAddToHistory(id);
            
            // show the passage specified
            changeSelectionInternal(getPassageIndex(id));
            updateUI();
        }

        // Print the href value to the console
        console.log("Link href:", id);
    }
    catch(exception) {
        throw exception;
    }
    finally {
        // Prevent the default behavior of the <a> tag
        event.preventDefault();
    }
}

function onDownloadPressed() {
    let exportName = "story"
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(getStateJsonString());
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function onHelpPressed() {
    saveSession();
}

function getStateJsonString() {
    return JSON.stringify(state);
}

function onUploadPressed() {
    let input = document.createElement('input');
    document.body.appendChild(input); // required for firefox
    input.type = 'file';
    input.onchange = onFileUploaded;
    input.click();
    input.remove();
}

function onFileUploaded(event) {
    let file = event.target.files[0];
    console.log(file);
    let reader = new FileReader();
    reader.onload = onUploadedFileRead;
    reader.filename = file.name;
    reader.readAsText(file,'UTF-8');
}

function onUploadedFileRead(e) {
    let fileText = e.target.result;
    console.log(fileText);
    let stateProxy = JSON.parse(fileText);
    if (stateProxy == undefined) {
        console.error("Could not read this file")
        showToast("Could not read the uploaded file, run the file through a json parser to check it is valid json");
        return;
    }
    stateProxy = migrateLegacySession(stateProxy);
    if (stateProxy == undefined) {
        console.error("Could not read this file")
        showToast("old save file incompatible, this should never happen");
        return;
    }
    state = stateProxy;
    rebuildUI();
    console.log(e);
    showToast(`File read '${e.target.filename}'`)
}

function onSharePressed() {
    let url = window.location.href;
    let length = url.indexOf("?");
    if (length < 0) length = url.length;
    let prefix = url.substring(0,length) + "?";
    navigator.clipboard.writeText(prefix + encodeURI(getStateJsonString()));
    showToast("Copied to clipboard");
}

function showToast(message, durationMs) {
    ui.toast.classList.add("show");
    ui.toast.innerHTML = message;
    window.setTimeout(hideToast, durationMs || 1000);
}

function hideToast() {
    ui.toast.classList.remove("show");
}

window.onload = onLoad;