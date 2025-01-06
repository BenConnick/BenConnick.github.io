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
}

// saved state
let state = {
    progress: 0,
    currentSelection: 0,
    passages:    {},
    lastSaveTime: '',
}

// values that are not saved
let sessionState = {
    history: [],
    lastSavedLink: undefined,
}

function onLoad() {
    alertErrors();
    overloadSaveKeyboardShortcut();
    linkUI();
    state = migrateLegacySession(loadSession());
    saveSession();
    rebuildUI();
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
    
    // special
    ui.toggleButton = $("#toggleButton input");
    ui.toggleButton.onclick = onEditModeToggled;
}

function onEditModeToggled() {
    updateUI();
}

function onPassageUIChanged() {
    let optionIndex = ui.passageDropdownButton.value;
    if (optionIndex == undefined || optionIndex == Number.NaN) return;
    state.currentSelection = optionIndex;
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
    state.lastSaveTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    let saveMessage = "saved " + state.lastSaveTime;
    console.log(saveMessage);
}

function showSavedToast(durationMs) {
    let saveMessage = "saved " + state.lastSaveTime;
    showToast(saveMessage, durationMs);
}

function loadSession() {
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
    state.currentSelection = getPassageIndex(nextSelection);
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

function togglePanels() {
    if (isEditMode()) {
        ui.viewPanel.classList.add("hidden");
        ui.editPanel.classList.remove("hidden");
    }
    else {
        ui.viewPanel.classList.remove("hidden");
        ui.editPanel.classList.add("hidden");
    }
}

function displayPassage(id) {
    togglePanels();
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
    state.currentSelection = getPassageIndex(id);
    ui.passageDropdownButton.value = state.currentSelection;
    automaticallyAddToHistory(id);
}

function automaticallyAddToHistory(id) {
    const maxHistoryLength = 10;
    let hist = sessionState.history;
    let historyLength = hist.length;
    for (let i = 0; i < historyLength; i++) {
        if (hist[i] == id) {
            hist.splice(i,1);
            break;
        }
    }
    historyLength = hist.length;
    if (historyLength >= maxHistoryLength) {
        hist.splice(0, historyLength-maxHistoryLength);
    }
    hist.push(id);
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

        // show the passage specified
        displayPassage(id);

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
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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

function showToast(message, durationMs) {
    ui.toast.classList.add("show");
    ui.toast.innerHTML = message;
    window.setTimeout(hideToast, durationMs || 1000);
}

function hideToast() {
    ui.toast.classList.remove("show");
}

window.onload = onLoad;