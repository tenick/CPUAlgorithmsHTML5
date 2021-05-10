function regexValidation(value, format) {
    var vals = value.split(":");
    var formatSplit = format.split(":");
    if (formatSplit.length != vals.length)
        return false; 
    var isValid = true;
    var validRegex = "^\\d+$|^\\d+.\\d+$|^\\d*.\\d+$";
    for (var i = 0; i < vals.length; i++) {
        isValid &&= vals[i].search(new RegExp(validRegex)) == 0;
    }
    return isValid;
}

function removeRow(element) {
    element.parentElement.remove();
    var removedJobNumber = parseInt(element.parentElement.firstElementChild.innerHTML);
    
    // re-order the jobs
    var tbody = document.getElementsByTagName('tbody')[0];
    var TRs = tbody.getElementsByTagName("tr");
    for (var i = 0; i < TRs.length; i++) {
        var jobNumber = parseInt(TRs[i].firstElementChild.innerHTML);
        if (jobNumber > removedJobNumber) 
            TRs[i].firstElementChild.innerHTML = jobNumber-1;
    }
}

function addRow() {
    // get necessary data
    var tbody = document.getElementsByTagName("tbody")[0];
    var jobCount = tbody.getElementsByTagName("tr").length;

    var arrivalTime = document.getElementsByName("arrivalTime")[0];
    var runTime = document.getElementsByName("runTime")[0];
    
    var ATFormat = document.getElementById("arrivalTimeFormat").innerHTML;
    var RTFormat = document.getElementById("runTimeFormat").innerHTML;

    // validate arrivalTime and runTime
    if (regexValidation(arrivalTime.value, ATFormat)
        && regexValidation(runTime.value, RTFormat)) {
        // create the newRow to append to table
        var newRow = document.createElement("tr");
        newRow.innerHTML = '<td>'+ (jobCount+1) +'</td>\
                            <td>'+ arrivalTime.value +'</td>\
                            <td>'+ runTime.value +'</td>\
                            <td onclick="removeRow(this);" class="remove-row"></td>';

        // append newRow
        tbody.appendChild(newRow);
    }
    else {
        alert("Please input a valid Arrival Time and Run Time format");
    }
    
}