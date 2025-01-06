const SAVE_KEY = "serializedGameState"

const linkRegex = /\[\[(.*?)\]\]/g;
const complexLinkRegex = /\[\[(.*?)\|(.*?)\]\]/g;
const linkRegexReplace = "<a href='' data-target='$1' onclick='handleLinkClick(event)'>$1</a>"
const complexLinkReplaceRegex = "<a href='' data-target='$2' onclick='handleLinkClick(event)'>$1</a>";

// DOM page elements
let ui = {
    outputTextField: undefined,
    inputTextField: undefined,
    chapterInputField: undefined,
    chapterDropdownButton: undefined,
    saveButton: undefined,
    deleteButton: undefined,
    toggleButton: undefined,
    viewPanel: undefined,
    editPanel: undefined,
    toast: undefined,
    historyPanel: undefined,
}

// saved state
let state = {
    progress: 0,
    currentSelection: 0,
    chapters: {},
    lastSaveTime: '',
}

// values that are not saved
let sessionState = {
    history: []
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
    ui.chapterDropdownButton.onchange = onChapterUIChanged;
    ui.saveButton.onclick = onSaveEditedChapterPressed;
    ui.deleteButton.onclick = onDeletePressed;
    
    // special
    ui.toggleButton = $("#toggleButton input");
    ui.toggleButton.onclick = onEditModeToggled;
}

function onEditModeToggled() {
    updateUI();
}

function onChapterUIChanged() {
    let optionIndex = ui.chapterDropdownButton.value;
    if (optionIndex == undefined || optionIndex == Number.NaN) return;
    state.currentSelection = optionIndex;
    rebuildUI();
}

function rebuildUI() {
    ui.chapterDropdownButton.innerHTML = "";
    if (state == undefined || state.chapters == undefined) {
        console.error("cannot refresh ui, state is undefined")
    }
    let chapterKeys = getChapterKeys();
    let numChapters = chapterKeys.length;
    for (let i = 0; i < numChapters; i++) {
        let selectChild = `<option value='${[i]}'>${chapterKeys[i]}</option>`;
        ui.chapterDropdownButton.innerHTML += selectChild;
    }
    updateUI();
}

function getChapterKeys() {
    let chapterKeys = Object.keys(state.chapters);
    return chapterKeys;
}

function getChapterID(index) {
    return getChapterKeys()[index];
}

function getChapter(index) {
    return state.chapters[getChapterID(index)];
}

function getChapterIndex(chapterID) {
    return getChapterKeys().indexOf(chapterID);
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

function onSaveEditedChapterPressed() {
    if (ui.chapterInputField.value == undefined || chapterInputField.value == "") {
        alert('Did not save, ID field must is required');
        return;
    }
    let idValue = ui.chapterInputField.value;
    let contentValue = ui.inputTextField.value;
    addChapter(idValue, contentValue);
    state.currentSelection = getChapterIndex(idValue);
    saveSession();
    showSavedToast(500);
    rebuildUI();
}

function addChapter(id, content) {
    state.chapters[id] = content;
}

function updateUI() {
    updatePassageUI();
    updateHistoryUI();
}

function updatePassageUI() {
    displayChapter(getChapterID(state.currentSelection));
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

function displayChapter(id) {
    togglePanels();
    let chapterContent = state.chapters[id];
    if (chapterContent == undefined) {
        ui.outputTextField.innerHTML = `Chapter with id '${id}' not found`;
    }
    else {
        displayChapterInner(id, chapterContent);
    }
}

function displayChapterInner(id, content) {
    ui.outputTextField.innerHTML = reformatLinksInString(content);
    ui.chapterInputField.value = id;
    ui.inputTextField.value = content;
    state.currentSelection = getChapterIndex(id);
    ui.chapterDropdownButton.value = state.currentSelection;
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
    let confirmMessage = `Delete chapter '${getChapterID(state.currentSelection)}'?`;
    if (confirm(confirmMessage)) {
        let prevSelection = state.currentSelection;
        Reflect.deleteProperty(state.chapters, getChapterID(state.currentSelection));
        saveSession();
        showSavedToast(500);
        rebuildUI();
    }
}

function handleLinkClick(event) {
    
    try {
        // Get the href attribute of the clicked <a> tag
        const id = event.srcElement.dataset.target;

        // show the chapter specified
        displayChapter(id);

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

function showToast(message, durationMs) {
    ui.toast.classList.add("show");
    ui.toast.innerHTML = message;
    window.setTimeout(hideToast, durationMs || 1000);
}

function hideToast() {
    ui.toast.classList.remove("show");
}

window.onload = onLoad;