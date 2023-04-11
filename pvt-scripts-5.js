pvt_member_functions = function () {

    var PVTFlag = false;
    var PVT_active = false;
    var terminatePVTFlag = false;
    var shouldHandleKeyDown = true;
    var resolvePVT = false;
    var elapsedTime;
    var timerUpdater;
    var pvt_start_time;
    var pvt_elapsed_time;
    var pvtDurationMinutes = 5;
    var pvtBlockDuration = pvtDurationMinutes * 60 * 1000;

    function PVT_instance() {
        console.log('pvt-instance');
        PVT_active = true;

        var instanceStartTime = Date.now();
        pvt_elapsed_time = instanceStartTime - pvt_start_time;

        if (pvt_elapsed_time > pvtBlockDuration) {
            terminatePVTFlag = true;
            // console.log('terminate-PVT');
        }

        document.getElementById("timer").style.display = "none";
		document.getElementById("circle").style.display = "block";
        // console.log('pvt-instance');

        // alert pvt start w/countdown
        timerUpdater = setInterval(function () {
            elapsedTime = Date.now() - instanceStartTime;
            document.getElementById("timer").innerHTML = elapsedTime;
        }, 1);
    }

    document.body.onkeyup = function () {
        shouldHandleKeyDown = true;
    }

    document.body.onkeypress = function (e) {

        if (shouldHandleKeyDown) {
            shouldHandleKeyDown = false;

            if (e.key === ' ' && PVT_active === true) {
                if (terminatePVTFlag) {
                    console.log('terminating-PVT');
                    clearInterval(timerUpdater);
                    // save data from participantData to csv
                    save_csv();


                    setTimeout(function () {
						document.getElementById("circle").style.display = "none";
                        document.getElementById("timer").style.display = "none";
                        send_data_to_server(Date().toLocaleString(), '1', elapsedTime);
                        elapsedTime = 0;
                        PVTFlag = false;
                        PVT_active = false;
                        timeVal = 4;
                        terminatePVTFlag = false;
                        resolvePVT = true;
                    });

                    // reset your flags and variables

                } else if (PVT_active === true && !terminatePVTFlag) {
                    PVT_active = false;
                    console.log('keypress-pvt');
                    clearInterval(timerUpdater);
                    setTimeout(function () {
						document.getElementById("circle").style.display = "none";
                        document.getElementById("timer").style.display = "none";
                        send_data_to_server(Date().toLocaleString(), '1', elapsedTime);
                        elapsedTime = 0;
                        PVTRandomizer();
                    });

                } else {
                    console.log('pvt-patience!');
                    send_data_to_server(Date().toLocaleString(), '0', 'NA');
                }


            };
        }
    }

    function PVT_terminate_condition_check() {
        console.log('pvt-terminate-condition-check');
        var d2 = $.Deferred();
        PVTBlock();
        pvtEndTracker = setInterval(function () {
            if (resolvePVT) {
                d2.resolve();
                resolvePVT = false;
                clearInterval(pvtEndTracker);
                return d2.promise();
            }
        }, 1);
        return d2.promise();

    }

    function PVTRandomizer() {
        console.log('pvt-randomizer');
        if (!PVT_active) {
            // console.log('pvt-randomizer')
            var max = 5;
            var min = 2;
            var rand = Math.floor(Math.random() * (max - min + 1) + min); //Generate Random number between 5 - 10
            // console.log('Wait for ' + rand + ' seconds');
            setTimeout(PVT_instance, rand * 1000);
        }
    }

    function PVTBlock() {
        console.log('pvt-block');
        var timeVal = 4;
        document.getElementById("input_form").style.display = "none";
        document.getElementById("subjectiveForm").style.display = "none";
        document.getElementById("theHead").style.display = "none";
        // console.log('pvt-block')
        PVTFlag = true;

        // PVT intro blurb goes here
        var pvt_intro = setInterval(function () {

            document.getElementById("block-intro").style.display = "block";
            timeVal = timeVal - 1;
            document.getElementById("block-intro").innerHTML = "< PVT begins in " + timeVal + ' >';
            if (timeVal == 0) {

                pvt_start_time = Date.now();
                document.getElementById("block-intro").style.display = "none";
				document.getElementById("circle").style.display = "none";
                // console.log('clear-PVT-intro')
                PVTRandomizer();
                clearInterval(pvt_intro);
                // return;

            }
        }, 1000);

    }

    function save_csv() {
        console.log('save-csv');
        // save data from participantData to csv
        const csvData = Object.values(participantData).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'pvt_' + document.getElementById('inp').value + '_' + Date.now() + '.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }


    // Global variable to store the CSV data for each participant ID
    const participantData = {};
    function send_data_to_server(rtime, rstate, rdelay) {

        try {
            var act = document.getElementById('standard-select').value;
        } catch {
            act = "demo";
        }

        // Construct form elements into Application/JSON template
        const data = {
            participantId: document.getElementById('inp').value,
            activity: act,
            responseTimeStamp: rtime,
            responseState: rstate,
            responseDelay: rdelay
        };

        // Check if the CSV data for the current participant ID already exists
        if (data.participantId in participantData) {
            // Append the new data to the existing CSV data
            participantData[data.participantId] += '\n' + Object.values(data).join(',');
        } else {
            // Create a new CSV data for the current participant ID
            participantData[data.participantId] = Object.keys(data).join(',') + '\n' + Object.values(data).join(',');
        }

        return;
        }

      
    return {
        init: PVTBlock,
        setup: PVT_terminate_condition_check
    }
}();