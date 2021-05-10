let reader = new FileReader();

function loadFile() {
    const file = document.querySelector('input[type=file]').files[0];
    reader.addEventListener("load", parseFile, false);
    if (file) {
        reader.readAsText(file);
    }
    console.log("loading file.")
}

function parseFile(){
    let doesColumnExist = false;
    const data = d3.csv.parse(reader.result, function(d){
        doesColumnExist = d.hasOwnProperty("area");

        return d;
    });
    createTable(data);
}

function createTable(data) {

    //The columns, say "keys" to display them
    const keys = d3.keys(data[0]);

    //The rows,
    const stats = d3.select("#stats")
        .html("")

    let sortAscending = true;

    stats.append("div")
        .text("Columns: " + keys.length)

    stats.append("div")
        .text("Rows: " + data.length)

    //the making of the table.
    d3.select("#table")
        .html("")
        .append("tr")
        .attr("class","fixed")
        .selectAll("th")
        .data(keys)
        .enter().append("th")
        .text(function(d) { return d; });


    d3.select("#table")
        .selectAll("tr.row")
        .data(data)
        .enter().append("tr")
        .attr("class", "row")
        .selectAll("td")
        .data(function(d) { return keys.map(function(key) { return d[key] }) ; })
        .enter().append("td")
        .text(function(d) { return d; })


    //Sorting the table
    d3.selectAll("#table")
        .selectAll("tr.row")
        .data(data)
        .sort(function(a, b) {
                // CHANGE date TO WHAT YOU WANT TO BE SORTED!!!!!
                //Works both with alphabet and numbers
                return d3.descending(a.date, b.date);
        })
        .enter().append("tr")
        .attr("class", "row")
        .selectAll("td")
        .data(function(d) { return keys.map(function(key) { return d[key] }) ; })
        .enter().append("td")
        .text(function(d) { return d; })




    //Showing the columns in
    console.log(keys)
}

