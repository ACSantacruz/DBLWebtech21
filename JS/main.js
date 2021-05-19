let reader = new FileReader();

function loadFile() {
    const file = document.querySelector('input[type=file]').files[0];
    reader.addEventListener("load", parseFile, false);
    if (file) {
        reader.readAsText(file);
    }
}

function parseFile(){
    let doesColumnExist = false;
    const data = d3.csv.parse(reader.result, function(d){
        doesColumnExist = d.hasOwnProperty("area");

        return d;
    });
    fileInfo(data)
    createTable(data);
    createHeatMap(data);
    //createUniqueGraph(data); unfinished
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
}


function createHeatMap(data) {

    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    //Printing the field, still using the margin set above.
    var svg = d3.select("#heatMap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // There is an easier way to do this by using d.fromJobTitle and taking the keys, but then it has to be sorted to make sure they are in the same order.
        // So I believe this is faster.
        var fromTitle = ["Unknown", "Employee", "Trader", "In House Lawyer", "Manager", "Managing Director", "Director", "Vice President", "President", "CEO"]
        var toTitle = ["Unknown", "Employee", "Trader", "In House Lawyer", "Manager", "Managing Director", "Director", "Vice President", "President", "CEO"]

    //This is to make the x- axis and to make the grid layout scalable But does not work
    var xAxis = d3.scaleBand()
        .range([ 0, width ])
        .domain(fromTitle)
        .padding(0.03);

    //This is to make the y- axis and to make the grid layout scalable But does not work
        var yAxis = d3.scaleBand()
            .range([ height, 0 ])
            .domain(toTitle)
            .padding(0.03);


        //To colour in the heatmap, can someb
        var ColourHM = d3.scaleLinear()
            .range(["#0041ff", "#ffffff", "#ffbe00", "#ff0000"])
            .domain([-0.07, -0.03, 0.03, 0.07])

        // For When the mouse goes on a square
        var mouseHover = d3.select("#heatMap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")

            .style("background-color", "#b6b6b6")
            .style("border", "solid")
            .style("border-width", "3px")
            .style("border-radius", "20px")
            .style("padding", "10px")
            .style("width", "300px")


        //When the mouse is over the square.
        var mouseOnSquare = function(d) {
            mouseHover
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }


        //Putting the text down
        var textDisplay = function(d) {
            mouseHover
                //d3.mean(data.filter(d => d.fromJobtitle === "Employee"), (d => d.toJobtitle === "Employee"),d => d.sentiment)
                .html("value: " + d.sentiment + " mean: " + d3.mean(data.filter(d => d.fromJobtitle === d.fromJobtitle,
                    d.toJobtitle === d.toJobtitle),
                        d => d.sentiment))
        }


        //Return it to the original form what it was before mouse hover
        var mouseOffSquare = function(d) {
            mouseHover
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

// A title for the visualization, maybe do this for all vis?
    svg.append("text")
        .style("font-size", "24px")
        .style("font-family", "Verdana")
        .text("Sentiment Heatmap");

        //Adding the squares
        svg.selectAll()
            .data(data, function(d) {
                return d.fromJobtitle+':'+d.toJobtitle;
            })
            .enter()

            .append("rect")
            .attr("x", function(d) {
                return xAxis(d.fromJobtitle)
            })
            .attr("y", function(d) {
                return yAxis(d.toJobtitle)
            })

            .attr("rx", 8)
            .attr("ry", 8)

            .style("stroke-width", 3)
            .style("opacity", 0.9)

            .attr("width", xAxis.bandwidth() )
            .attr("height", yAxis.bandwidth() )

            //Using the colour heatmap function made earlier to give the squares "heat"
            .style("fill", function(d) {
                return ColourHM(d.sentiment)
            })

            //d3 built in mouse interactivity stuff
            .on("mouseover", mouseOnSquare)
            .on("mousemove", textDisplay)
            .on("mouseleave", mouseOffSquare);
}

function createUniqueGraph(data) {//https://observablehq.com/@d3/force-directed-graph
    
    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    //const links = data.links.map(d => Object.create(d));
    /*
    All examples I found use a json where the "links" is formatted like:
    {"source": "Name", "target": "Name2", "value" : n}
    In our case this would be
    {"fromId": "n", "toId": m, "sentiment": "o"}. Idk how to do the d3.csv.parse stuff tho
    */
    //const nodes = data.nodes.map(d => Object.create(d));
    /*
    Same as above, in this case
    {"id": "Name", "group": n}
    For us
    {"fromId": "n", "jobTitle": "fromJobtitle"}
    The group given here is used for the coloring
    */

    const simulation = d3.forceSimulation(nodes)
        /*.force("link", d3.forceLink(links).id(d => d.id))
        this force pushes linked elements a fixed distance apart, but it requires an *array*
        of links with a source and a target element (see above).

        It is *necessary* for the force-link diagram.
        */
        .force("charge", d3.forceManyBody()) //creates a repelling force between nodes
        .force("center", d3.forceCenter(width / 2, height / 2)); //sets the center of the forces to the center of the visualization
    
    var svg = d3.select("#heatMap")
        .attr("viewBox", [0,0, width, height]);

    const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)//links, see above
        .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value))/* in the example this value is already set in the json,
                but in our case could be absolute value of sentiment, or freq. of interactions (calculating this
                second one seems complicated)
                */

    const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)//romId, see fabove
        .join("circle")
            .attr("r", 5)
            .attr("fill", color)

    node.append("title")
        .text(d => d.fromId);

    simulation.on("tick", () => {//the simulation refreshes every tick, same principle as clock circuits from 2IC30
        link
            .attr("x1", d => d.source.x)//fromId
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)//toId
            .attr("y2", d => d.target.y);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    invalidation.then(() => simulation.stop());

    var scale = d3.scaleOrdinal(d3.schemeTableau10);
    var color = scale(d.fromJobtitle);//job title isn't a number tho so this would raise an error
    

// A title for the visualization, maybe do this for all vis?
    svg.append("text")
        .style("font-size", "24px")
        .style("font-family", "Verdana")
        .text("Sentiment Heatmap");

        //Adding the squares
        svg.selectAll()
            .data(data, function(d) {
                return d.fromJobtitle+':'+d.toJobtitle;
            })
            .enter()

            .append("rect")
            .attr("x", function(d) {
                return xAxis(d.fromJobtitle)
            })
            .attr("y", function(d) {
                return yAxis(d.toJobtitle)
            })

            .attr("rx", 8)
            .attr("ry", 8)

            .style("stroke-width", 3)
            .style("opacity", 0.9)

            .attr("width", xAxis.bandwidth() )
            .attr("height", yAxis.bandwidth() )

            //Using the colour heatmap function made earlier to give the squares "heat"
            .style("fill", function(d) {
                return ColourHM(d.sentiment)
            })

            //d3 built in mouse interactivity stuff
            .on("mouseover", mouseOnSquare)
            .on("mousemove", textDisplay)
            .on("mouseleave", mouseOffSquare);
}

function fileInfo(data){
//Does not work for some reason?
    if (d3.keys(data[0]) == ["date", "fromId", "fromEmail", "fromJobtitle", "toId", "toEmail", "toJobtitle", "messageType", "sentiment"] ) {

        var svg = d3.select("#box3")
        svg.append("text")
            .text("The file is in the correct format."+ + d3.keys(data[0]));
    } else {
        console.log(d3.keys(data[0]) )
        console.log(["date", "fromId", "fromEmail", "fromJobtitle", "toId", "toEmail", "toJobtitle", "messageType", "sentiment"])
        var svg = d3.select("#box3")
        svg.append("text")
            .text("ERROR!! The file is not the correct format, this might cause issues!.");
    }

}