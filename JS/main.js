var reader = new FileReader();

function loadFile() {
    var file = document.querySelector('input[type=file]').files[0];
    reader.addEventListener("load", parseFile, false);
    if (file) {
        reader.readAsText(file);
    }
}

function parseFile(){
    var doesColumnExist = false;
    var data = d3.csv.parse(reader.result, function(d){
        doesColumnExist = d.hasOwnProperty("area");
        return d;
    });
    console.log(data);
    createTable(data);
}

function createTable(data) {
    var keys = d3.keys(data[0]);

    var stats = d3.select("#stats")
        .html("")

    stats.append("div")
        .text("Columns: " + keys.length)

    stats.append("div")
        .text("Rows: " + data.length)

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
        .text(function(d) { return d; });
}

