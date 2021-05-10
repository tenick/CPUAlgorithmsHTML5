
function dropdownTrigger(element) {
    var dropdownContents = element.parentElement.children.item(1);
    var displayValue = window.getComputedStyle(dropdownContents, null).display;
    if (displayValue == "none")
        dropdownContents.style.display = "flex";
    else
        dropdownContents.style.display = "none";
}

function select(element) {
    var btnParent = element.parentElement.parentElement.firstElementChild;
    btnParent.innerHTML = element.innerHTML;

    // if round robin is selected:
    // show the time quantum dropdown and input
    if (element.innerHTML == "Round Robin") {
        var TQContainer = document.getElementsByClassName("time-quantum-container")[0];
        TQContainer.style.display = "block";
    }
    else {
        var algos = ["First Come First Serve",
                     "Shortest Job Time",
                     "Shortest Remaining Time"];
        // this makes sure that Round Robin is actually unselected
        if (algos.includes(element.innerHTML)) {
            var TQContainer = document.getElementsByClassName("time-quantum-container")[0];
            TQContainer.style.display = "none";
        }
    }
}