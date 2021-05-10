function generateOutput() {
    // get chosen CPU algorithm, ganttChart format, and decimal places
    var chosenCPUAlgorithm = document.getElementById("CPUAlgorithm").innerHTML;
    var ganttChartFormat = document.getElementById("ganttChartFormat").innerHTML;
    document.getElementById("outUsedAlgo").innerHTML = chosenCPUAlgorithm;
    document.getElementById("outFormat").innerHTML = ganttChartFormat;
    var DP = parseInt(document.getElementsByName("decimalPlaces")[0].value);

    // get jobCount
    var tbody = document.getElementsByTagName("tbody")[0];
    var jobCount = tbody.getElementsByTagName("tr").length;
    
    // get given table (2d array)
    var given = [];
    var ATFormat = document.getElementById("arrivalTimeFormat").innerHTML;
    var RTFormat = document.getElementById("runTimeFormat").innerHTML;
    var tbody = document.getElementsByTagName("tbody")[0];
    var TRs = tbody.getElementsByTagName("tr");
    for (var i = 0; i < TRs.length; i++) {
        var cells = TRs[i].children;
        given.push([parseInt(cells.item(0).innerHTML), 
                    toSeconds(ATFormat, cells.item(1).innerHTML),
                    toSeconds(RTFormat, cells.item(2).innerHTML)]);
    }
    
    // sort function handle for multiple keys
    // to use this, the key must be a string so just add
    // ONE (1) random character at the beginning then the index afterwards
    // because the Object.keys() returns sorted keys if the keys
    // are integers, even if it's a number string, meaning it will not sort
    // in the order you want it to
    const sortCols  = (a, b, attrs) => Object.keys(attrs)
    .reduce((diff, k) =>  diff == 0 ? attrs[k](a[parseInt(k[k.length-1])], b[parseInt(k[k.length-1])]) : diff, 0);


    // initial state
    given.sort((a, b) => sortCols(a, b, { 
        '_1': (a, b) => b - a, // means reverse sort
        '_0': (a, b) => b - a // means reverse sort
    }));
    var givenCopy = given.map(function(arr) {
        return arr.slice();
    });

    var j1 = given.pop();
    var queue = [j1];
    var StartFinal = {};
    var fullTime = j1[1];
    var ganttChartList = [];

    // actual algorithm execution
    if (chosenCPUAlgorithm == "First Come First Serve") {
        while (queue.length != 0) {
            // get next job to execute
            var currJob = queue.pop();

            // get start time of that job
            var start = fullTime;
            
            // execute the job
            fullTime += currJob[2]; // add run time to full time
            
            // get final time of that job
            var end = fullTime;

            // add next job
            if (given.length != 0) {
                queue.push(given.pop());
                // check if new job doesn't start immediately (there's IDLE time), then add IDLE time to fullTime
                if (queue[queue.length-1][1] > fullTime)
                    fullTime = queue[queue.length-1][1];
            }

            // add start time and final time information of the job
            if (StartFinal.hasOwnProperty(currJob[0]))
                StartFinal[currJob[0]].push([start, end]);
            else
                StartFinal[currJob[0]] = [[start, end]];
            
            // for building the gantt chart
            ganttChartList.push([currJob[0], start, end]);
        }
    }
    else if (chosenCPUAlgorithm == "Shortest Job First") {
        while (queue.length != 0) {
            // check maybe there's same early arrival time
            // in which case you didn't queue all of arrived jobs at the beginning
            if (given.length != 0) {
                while (given.length != 0) {
                    if (fullTime >= given[given.length-1][1])
                        queue.push(given.pop());
                    else
                        break
                }
                // sort queue by Run Time
                queue.sort((a, b) => sortCols(a, b, { 
                    '_2': (a, b) => b - a, // means reverse sort
                    '_0': (a, b) => b - a // means reverse sort
                }));
            }

            // get next job to execute
            var currJob = queue.pop();

            // get start time of that job
            var start = fullTime;
            
            // execute the job
            fullTime += currJob[2]; // add run time to full time
            
            // get final time of that job
            var end = fullTime;

            // add jobs that arrived while job is executing to queue
            if (given.length != 0) { // check if given contains job(s)
                var aJobArrived = false;
                while (given.length != 0) {
                    if (fullTime >= given[given.length-1][1]) {
                        queue.push(given.pop());
                        aJobArrived = true;
                    }
                    else
                        break
                }
                if (!aJobArrived && queue.length == 0) { // if there wasn't any job that arrived AND queue is empty, append closest job
                    queue.push(given.pop());
                    fullTime = queue[queue.length-1][1];
                }
                // sort queue by Run Time
                queue.sort((a, b) => sortCols(a, b, { 
                    '_2': (a, b) => b - a, // means reverse sort
                    '_0': (a, b) => b - a // means reverse sort
                }));
            }

            // add start time and final time information of the job
            if (StartFinal.hasOwnProperty(currJob[0]))
                StartFinal[currJob[0]].push([start, end]);
            else
                StartFinal[currJob[0]] = [[start, end]];
            
            // for building the gantt chart
            ganttChartList.push([currJob[0], start, end]);
        }
    }
    else if (chosenCPUAlgorithm == "Shortest Remaining Time") {
        while (queue.length != 0) {
            // get next job to execute
            var currJob = queue.pop();
            
            // get start time of that job
            var start = fullTime;
            
            // if fullTime (the overall time elapsed since the beginning until now) is more than the current job's start time, then make fullTime the starting time of the current job
            if (fullTime > currJob[1])
                start = fullTime;
            else // if fullTime is less (or equal) than current job's start time (meaning that there's an IDLE time), then add the IDLE time to fullTime
                fullTime += currJob[1] - fullTime;
                start = fullTime;

            // how much time of the current job is executed
            executedTime = currJob[2];

            // execute the job, BUT change job if found a job in queue with a shorter run time
            while (given.length != 0) {
                if (start + currJob[2] >= given[given.length-1][1]) {
                    queue.push(given.pop());
                    // sort so that shortest run time is at the end
                    queue.sort((a, b) => sortCols(a, b, { 
                        '_2': (a, b) => b - a, // means reverse sort
                        '_0': (a, b) => b - a // means reverse sort
                    }));
                    // update executed time
                    executedTime = queue[queue.length-1][1] - start;
                    // now we have to check the job with the shortest run time in queue, if it's shorter than current job then we change to that job
                    if (queue[queue.length-1][2] < currJob[2] - executedTime) {
                        currJob[2] -= executedTime;
                        // add pre-empted job to the queue again for later executing
                        queue.push(currJob);
                        // sort so that shortest run time is at the end
                        queue.sort((a, b) => sortCols(a, b, { 
                            '_2': (a, b) => b - a, // means reverse sort
                            '_0': (a, b) => b - a // means reverse sort
                        }));
                        break;
                    }
                    else // turns out the current job still has the lowest run time, so just execute the current job fully
                        executedTime = currJob[2];
                }
                else { // the next job arrives AFTER the current job is done, meaning no job arrives while executing the current job, so just execute the job fully
                    executedTime = currJob[2];
                    if (queue.length == 0) {
                        queue.push(given.pop());
                        // sort so that shortest run time is at the end
                        queue.sort((a, b) => sortCols(a, b, { 
                            '_2': (a, b) => b - a, // means reverse sort
                            '_0': (a, b) => b - a // means reverse sort
                        }));
                    }
                    break;
                }
            }

            fullTime += executedTime; // add run time to full time

            // get final time of that job
            var end = fullTime;

            // add start time and final time information of the job
            if (StartFinal.hasOwnProperty(currJob[0]))
                StartFinal[currJob[0]].push([start, end]);
            else
                StartFinal[currJob[0]] = [[start, end]];
            
            // for building the gantt chart
            ganttChartList.push([currJob[0], start, end]);
        }
    }
    else if (chosenCPUAlgorithm == "Round Robin") {
        var timeQuantum = document.getElementsByName("timeQuantum")[0].value;
        var TQFormat = document.getElementById("timeQuantumFormat").innerHTML;

        while (queue.length != 0) {
            // get next job to execute
            var currJob = queue.pop();

            // check if there's idle time
            if (fullTime < currJob[1])
                fullTime = currJob[1];
                
            // get start time of that job
            var start = fullTime;
            
            // if queue isn't empty, do normal TQ execution
            var isCompleted = false;
            var tq = toSeconds(TQFormat, timeQuantum);
            var end = 0;
            if (queue.length != 0) {
                // execute for TQ and get end time
                end = start + tq;
                if (currJob[2] - tq <= 0) {
                    end = start + currJob[2];
                    isCompleted = true;
                }
            }
            else { // run until it reaches the nearest Job or current job finishes, or just finish current job if given is also empty
                var totalTQ = tq;
                isCompleted = true;
                end = start + currJob[2];
                while (given.length != 0) {
                    // job finished
                    if (currJob[2] - totalTQ <= 0) {
                        end = start + currJob[2];
                        break;
                    }
                    else if (start + totalTQ >= given[given.length-1][1]) { // job didn't finish and a job arrived while executing time quantum
                        end = start + totalTQ;
                        isCompleted = false;
                        break;
                    }

                    totalTQ += tq;
                }
                tq = totalTQ;
            }

            // update fullTime
            fullTime = end;

            // queue remaining jobs that didn't arrive
            if (given.length != 0) {
                var aJobArrived = false;
                // queue jobs that arrived after TQ executes
                while (given.length != 0) {
                    if (end >= given[given.length-1][1]) {// if end time after executing time quantum is >= the nearest AT, then add that Job to the queue
                        queue.unshift(given.pop());
                        aJobArrived = true;
                    }
                    else
                        break;
                }
                
                // if no job arrived meaning there's idle time AND if queue is empty, add next job
                if (!aJobArrived && !queue.length != 0)
                    queue.unshift(given.pop());
            }

            // add the current job to queue again if it didn't finish
            if (!isCompleted) {
                currJob[2] -= tq;
                queue.unshift(currJob);
            }

            // add start time and final time information of the job
            if (StartFinal.hasOwnProperty(currJob[0]))
                StartFinal[currJob[0]].push([start, end]);
            else
                StartFinal[currJob[0]] = [[start, end]];
            
            // for building the gantt chart
            ganttChartList.push([currJob[0], start, end]);
        }
    }


    // generate schedule table
    var AWT = 0;
    var ATAT = 0;
    var schedTable = [];
    for (var i = 0; i < givenCopy.length; i++) {
        var g = givenCopy[i];
        var row = [...g, ...[StartFinal[g[0]][0][0], StartFinal[g[0]][StartFinal[g[0]].length-1][1]]];
        var TAT = row[4] - row[1];  // Turn Around Time = Final Time or Completion Time - Arrival Time
        var WT = TAT - row[2];      // Wating Time = Turn Around Time - Run Time
        row = [...row, ...[WT, TAT]];
        schedTable.push(row);

        // update AWT and ATAT
        AWT += WT;
        ATAT += TAT;
    }

    // calculate Average Waiting Time and Average Turn Around Time
    AWT /= jobCount
    ATAT /= jobCount
    document.getElementById("outAWT").innerHTML = toTimeFormat(ganttChartFormat, AWT);
    document.getElementById("outATAT").innerHTML = toTimeFormat(ganttChartFormat, ATAT);

    // then sort table by job# and add table header
    schedTable.sort((a, b) => sortCols(a, b, { 
        '_0': (a, b) => a - b
    }));

    // create tbody with resulting sched table then replace the output table's tbody
    var newTbody = document.createElement('tbody');
    for (var i = 0; i < schedTable.length; i++) {
        var newRow = document.createElement('tr');
        newRow.innerHTML = '<td>'+ (schedTable[i][0]) +'</td>\
                            <td>'+ toTimeFormat(ganttChartFormat, schedTable[i][1], DP) +'</td>\
                            <td>'+ toTimeFormat(ganttChartFormat, schedTable[i][2], DP) +'</td>\
                            <td>'+ toTimeFormat(ganttChartFormat, schedTable[i][3], DP) +'</td>\
                            <td>'+ toTimeFormat(ganttChartFormat, schedTable[i][4], DP) +'</td>\
                            <td>'+ toTimeFormat(ganttChartFormat, schedTable[i][5], DP) +'</td>\
                            <td>'+ toTimeFormat(ganttChartFormat, schedTable[i][6], DP) +'</td>';
        newTbody.appendChild(newRow);
    }
    var outTbody = document.getElementsByTagName('tbody')[1];
    outTbody.parentNode.replaceChild(newTbody, outTbody);

    // Create gantt chart
    var ctx = document.getElementById('ganttChart').getContext('2d');
    if (chart != null) // to be able to redraw the chart
        chart.destroy();

    // get IDLE times
    var timePassed = 0;
    var idleTimes = [];
    for (var i = 0; i < ganttChartList.length; i++) {
        if (timePassed != ganttChartList[i][1])
            idleTimes.push([timePassed, timePassed + (ganttChartList[i][1] - timePassed)]);
        else
            idleTimes.push(0);
        timePassed = ganttChartList[i][2];
    }
    StartFinal['IDLE'] = idleTimes;

    // get gantt chart data
    var jobLabels = [];
    var bgColors = [];
    for (var i = 0; i < jobCount; i++) {
        jobLabels.push("Job " + (i+1));
        bgColors.push(getRandomColor());
    }
    jobLabels.push("IDLE");
    bgColors.push("#ccc");
    
    // build gantt chart datasets
    var showStartingIdleTime = document.getElementById("outGCShowIdleTimetype").checked;
    var datas = [];
    var maxData = 0;
    var SFKeys = Object.keys(StartFinal);
    for (var i = 0; i < SFKeys.length; i++) {
        if (StartFinal[SFKeys[i]].length > maxData)
            maxData = StartFinal[SFKeys[i]].length;
    }
    for (var i = 0; i < maxData; i++) {
        var data = [];
        for (var j = 0; j < SFKeys.length; j++) {
            if (i < StartFinal[SFKeys[j]].length)
                data.push(StartFinal[SFKeys[j]][i]);
            else
                data.push([]);
        }
        datas.push({
            data: data,
            backgroundColor: bgColors
        });
    }

    // get minimum x-axis value
    var min = 0;
    if (!showStartingIdleTime) {
        min = ganttChartList[0][1];
    }

    // actually build chart using chart.js
    chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: jobLabels,
        datasets: datas
    },
    options: {
        responsive: true,
        indexAxis: 'y',
        scales: {
            x: {
                min: min,
                ticks: {
                    callback: function(v) {
                        return toTimeFormat(ganttChartFormat, v, DP);
                    }
                }
            },
            y: {
                stacked: true
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.parsed._custom.barStart == 0 &&
                            context.parsed._custom.barEnd == 0)
                            return '';
                        var label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        return label += '[' + toTimeFormat(ganttChartFormat, context.parsed._custom.barStart, DP) 
                        + ', ' + toTimeFormat(ganttChartFormat, context.parsed._custom.barEnd, DP) + ']';
                    }
                }
            }
        }
    }
    });
}