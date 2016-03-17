
var stickyNote = document.getElementById("sticky");
stickyNote.addEventListener("click", playMuseum);

function playMuseum() {
    document.getElementById("uIn").focus();
    stickyNote.parentNode.removeChild(stickyNote);
}