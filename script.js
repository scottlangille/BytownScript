(function() {
    'use strict';
    console.log("---------------SCRIPT STARTED---------------");

    // LOAD CSV FILE
    try {
    var csv = GM_getResourceText("csv");

    var allTextLines = csv.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }
    // END

    var rows = 0;
    while (document.getElementById("partRow_" + rows)) {
        rows++;
    }

    function calculate(rowNum) {
        let row = document.getElementById("partRow_" + rowNum);

        let C = Number(document.getElementById("yourcost_" + rowNum).innerText.slice(1)); // Cost
        let J = Number(row.cells[6].innerText.slice(1)); // Jobber (MSC List price)
        let lineCode = row.cells[0].children[1].value; // Line Code

        let usingMisc = false; // if using Miscellaneous pricing

        // FIND WHICH LINE THIS PART IS ON IN CSV FILE
        let csvRow;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i][0] == lineCode) {
                csvRow = i;
            }
        }
        // IF NOT FOUND, USE MISC PRICING
        if (!csvRow) {
            usingMisc = true;
            lineCode = "MSC";
            for (let i = 0; i < lines.length; i++) { // Sloppy but it works
                if (lines[i][0] == lineCode) {
                    csvRow = i;
                }
            }
        }

        let prices = [];
        for (let i = 1; i <= 6; i++) {
            prices.push(lines[csvRow][i]);
        }
        for (let i = 0; i <= 5; i++) {
            //             console.log(prices[i].split("*"));
            if (prices[i] == "BASE") {
                prices[i] = J;
            } else if (prices[i]) {
                if (i > 0 && prices[i].split("*")[1] == "L") { // Multiply by L (recently calculated in for-loop as prices[0]) (PR1,PR2,PR3,PR4,PR5 ONLY)
//                    console.log("TEST");
                    prices[i] = prices[i].split("*")[0] * prices[0];
                } else if (prices[i].split("*")[1] == "C") { // Multiply by C
                    prices[i] = prices[i].split("*")[0] * C;
                } else if (prices[i].split("*")[1] == "J") { // Multiply by J
                    prices[i] = prices[i].split("*")[0] * J;
                }
            }
        }
        // ROUND TO 2 DECIMAL PLACES (after all previous calculations)
        let blank = true;
        for (let i = 0; i <= 5; i++) {
            if (prices[i]) {
                prices[i] = prices[i].toFixed(2);
                blank = false;
            } else {
                prices[i] = "--"
            }
        }

        // ADD TITLE TO ROW IN MSC
        let newTitle;
        let newText;
        if (blank) {
            newTitle = "PRICE N/A";
            newText = "PRICE N/A";
        } else {
            newTitle = "LIST = $" + prices[0] + "\n" +
                        "PR1 = $" + prices[1] + "\n" +
                        "PR2 = $" + prices[2] + "\n" +
                        "PR3 = $" + prices[3] + "\n" +
                        "PR4 = $" + prices[4] + "\n" +
                        "PR5 = $" + prices[5];
            newText = "LIST: <strong>$" + prices[0] + "</strong><br>"
                        + "PR1: &nbsp;<strong>$" + prices[1] + "</strong><br>"
                        + "PR2: &nbsp;<strong>$" + prices[2] + "</strong><br>"
                        + "PR3: &nbsp;<strong>$" + prices[3] + "</strong><br>"
                        + "PR4: &nbsp;<strong>$" + prices[4] + "</strong><br>"
                        + "PR5: &nbsp;<strong>$" + prices[5] + "</strong><br>";
            if (usingMisc) {
                newTitle += "\n\n(Using miscellaneous pricing)"
                newText += "<br>(MISC. PRICE)"
            }
        }

        // Set text under price column
        let elem = document.getElementById("yourcost_" + rowNum);
        elem.innerHTML += "<br><br><div style=\"background: rgba(255, 255, 255, 0.3); font-family: Consolas, Courier, Courier New, monospace; font-size: 13px; color: #000000; font-style: normal; font-weight: normal; line-height: 15px; text-align: center; \">"
                        + "<div style=\"display: inline-block; text-align: left; min-width: max-content;\">"
                        + newText
                        + "</div></div>";

        // Set title
        row.setAttribute("title", newTitle);

    }



    for (let i = 0; i < rows; i++) {
        //         console.log("----CALCULATING ROW " + i + "----");
        calculate(i);
    }

    console.log("CSV LOADED.");
    } catch (e) {
        console.log("Script failed.");
        console.log(e.message);
    }
})();
