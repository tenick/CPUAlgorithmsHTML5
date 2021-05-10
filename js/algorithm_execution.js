var chart = null;
var TI = {'HH': 3600, 'MM': 60, 'SS': 1};
function toSeconds(timeFormat, time) {
    var tf = timeFormat.split(':');
    var t = time.split(':');
    secs = 0
    for (var i = 0; i < t.length; i++) {
        secs += parseFloat(t[i]) * TI[tf[i]];
    }
    return parseInt(secs.toFixed(0));
}

function toTimeFormat(timeFormat, seconds, DP=-1) {
    var tf = timeFormat.split(':');
    var newTf = new Array(tf.length).fill(0);
    for (var i = 0; i < tf.length; i++) {
        if (i == tf.length - 1) {
            if (DP != -1)
                newTf[i] = (seconds / TI[tf[i]]).toFixed(DP);
            else
                newTf[i] = seconds / TI[tf[i]];
            newTf[i] = parseFloat(newTf[i]);
            break
        }
        newTf[i] = parseInt((seconds - seconds % TI[tf[i]]) / TI[tf[i]]);
        seconds -= newTf[i] * TI[tf[i]];
    }
    return newTf.join(':')
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function executeAlgorithm() {
    // validate inputs first
    // check if given table have at least 1 job
    var tbody = document.getElementsByTagName("tbody")[0];
    var jobCount = tbody.getElementsByTagName("tr").length;
    if (jobCount <= 0) {
        alert("Must have at least one (1) given job to proceed.");
        return;
    }

    // check if time quantum is in correct format (only if RR is selected)
    var chosenCPUAlgorithm = document.getElementById("CPUAlgorithm");
    if (chosenCPUAlgorithm.innerHTML == "Round Robin") {
        var timeQuantum = document.getElementsByName("timeQuantum")[0];
        var TQFormat = document.getElementById("timeQuantumFormat").innerHTML;
        if (!regexValidation(timeQuantum.value, TQFormat)) {
            alert("Please input a valid Time Quantum format.");
            return;
        }
    }

    // check if decimal places is greater than or equal to -1
    var dpElem = document.getElementsByName("decimalPlaces")[0];
    if (dpElem.value == "") {
        alert("Decimal Places input can't be empty");
        dpElem.value = -1;
        return;
    }

    // reaching here means the inputs are valid, so show the output div and proceed in generating the output
    var outputDiv = document.getElementsByClassName("output-container")[0];
    outputDiv.style.display = "block";
    generateOutput();
}