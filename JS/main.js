/* global d3, crossfilter */
let reader = new FileReader();
var dateFmt = d3.timeParse("%Y-%m-%d");


function loadFile() {
    const file = document.querySelector('input[type=file]').files[0];
    reader.addEventListener("load", parseFile, false);
    if (file) {
        reader.readAsText(file);
        console.log(file)

    }
    fileName = file.name;
    
}

function parseFile(){
    let doesColumnExist = false;
    const data = d3.csv.parse(reader.result, function(d){
        doesColumnExist = d.hasOwnProperty("area");
        d.Timestamp = dateFmt(d.Timestamp);
        return d;
    },
        function (err, data) {
            if (err) throw err;
    
            var csData = crossfilter(data);
    
            // // We create dimensions for each attribute we want to filter by
            csData.dimDate = csData.dimension(function (d) { return d.Timestamp; });
            csData.dimJobTitle = csData.dimension(function (d) { return d["job_title"]; });

    
            // We bin each dimension
            csData.dateByYear = csData.dimDate.group(d3.timeYear)
            csData.jobTitle = csData.dimJobTitle.group();
            //     csData.timesByHour = csData.dimTime.group(d3.timeHour);
            //     csData.carTypes = csData.dimCarType.group();
            //     csData.gateNames = csData.dimGateName.group();

            heatmapGraph.onMouseOver(function (d) {
                csData.dimJobTitle.filter(d.key);
                update();
            }).onMouseOut(function () {
                // Clear the filter
                csData.dimJobTitle.filterAll();
                update();
            });
            
            function update() {
                d3.select("#LineGraph")
                    .datum()
                    .call(createLineGraph());
    
                d3.select("#Uniqueness")
                    // .datum()
                    .call(createAdjacency(csData.jobTitle));
    
                d3.select("#heatMap")
                    .datum()
                    .call(createHeatMap(csData.jobTitle));
    
                d3.select("#table")
                    .datum()
                    .call(createTable(parseFile().data));
            }

    });
    fileInfo(data)
    createTable(data);
    createHeatMap(data);
    createAdjacency(data);
    createLineGraph(data);
    // createPieGraph(data);
    
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
    var margin = {top: 80, right: 30, bottom: 80, left: 80},
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
    svg.append("g")
        .style("font-size", 10)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis).tickSize(10))
    .selectAll("text")
        .attr("transform", "translate(-10, 0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .style("fill", "#0163ac")
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top - 20)
        .text("From job title.");




    //This is to make the y- axis and to make the grid layout scalable But does not work
        var yAxis = d3.scaleBand()
            .range([ height, 0 ])
            .domain(toTitle)
            .padding(0.03);
        svg.append("g")
            .style("font-size", 15)
            .call(d3.axisLeft(yAxis).tickSize(10))
            .selectAll("text")
            .attr("transform", "translate(-5,-10)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 10)
            .style("fill", "#0163ac")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left+30)
            .attr("x", 0)
            .text("To job title.")


    //To colour in the heatmap, can someb
        var ColourHM = d3.scaleLinear()
            .range(["#0041ff", "#ffffff", "#ffbe00", "#ff0000"])
            .domain([-0.07, -0.03, 0.03, 0.07])

        var mouseGetOver = function(_){
            if (!arguments.length) return mouseGetOver;
            mouseGetOver = _;
            parseFile.update;
        }
        var mouseGetOut = function(_){
            if (!arguments.length) return mouseGetOut;
            mouseGetOut = _;
        }

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
                .html( "[" + d.fromJobtitle+" : "+ d.toJobtitle + "]  "+"  value: " + d.sentiment +  "  mean: "
                    + d3.mean(data.filter(d => d.fromJobtitle === d.fromJobtitle,
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
        .text("Sentiment Heatmap")
        .attr("y", -20)
        .attr("x", width/4);

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
            .on("mouseleave", mouseOffSquare)
            // .on("mouseover", mouseGetOver)
            // .on("mouseout", mouseGetOut);
}

/*
function createLineChart(data) {
    var parsedDates = Date.parse(data[0]);
    console.log(data[0]);

    var parsedDates = Date.parse(data[0]);
    console.log(data[0].match(\b\d{2}\b));

    var parseTime = d3.timeParse("%Y, %B, %d");
    console.log(parseTime);

    var sentimentAvg = d3.mean(data, function(d) { return d.sentiment; });
    console.log(sentimentAvg);

    var meanJan = d3.mean(data.filter(d => d.data === "01"), d => d.sentiment);
    console.log(meanJan);
}
*/

function createAdjacency(data) {


    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    //Printing the field, still using the margin set above.
    var svg = d3.select("#Uniqueness")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // There is an easier way to do this by using d.fromJobTitle and taking the keys, but then it has to be sorted to make sure they are in the same order.
    // So I believe this is faster.
    var fromTitle = d3.map(data, function(d){return d.fromEmail;}).keys()
    var toTitle = d3.map(data, function(d){return d.toEmail;}).keys()

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
        .range(["#d2d2d2", "#000aff", "#ff7400", "#ff0000"])
        .domain([0, 4, 5, 8])

    // For When the mouse goes on a square
    var mouseHover = d3.select("#Uniqueness")
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
            .html( "[" + d.fromEmail+" : "+ d.toEmail + "]  "+"  amount: " + Math.abs(Math.round(d.sentiment*100)));
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
        .text("Emails sent between adresses.")
        .attr("y", -20)
        .attr("x", width/8);


    //Adding the squares
    svg.selectAll()
        .data(data, function(d) {
            return d.fromEmail+':'+d.toEmail;
        })
        .enter()

        .append("rect")
        .attr("x", function(d) {
            return xAxis(d.fromEmail)
        })
        .attr("y", function(d) {
            return yAxis(d.toEmail)
        })

        .attr("rx", 1)
        .attr("ry", 1)


        .style("stroke-width", 1)
        .style("opacity", 0.9)

        .attr("width", xAxis.bandwidth() )
        .attr("height", yAxis.bandwidth() )

        //Using the colour heatmap function made earlier to give the squares "heat"
        .style("fill", function(d) {
            return ColourHM(Math.abs(Math.round(d.sentiment*100)))
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
            .text("The file: " + fileName + "  is in the correct format." + d3.keys(data[0]));
    } else {
        console.log(d3.keys(data[0]) )
        console.log(["date", "fromId", "fromEmail", "fromJobtitle", "toId", "toEmail", "toJobtitle", "messageType", "sentiment"])
        var svg = d3.select("#box3")
        svg.append("text")
            .text("ERROR!! The file: " + fileName +  " Is not the correct format, this might cause issues!.");
    }

}

function createLineGraph(data) {
    
        var input = document.getElementById( 'csvUploader' );
        var fileName = input.files[0].name;
        console.log(fileName)
        
        

    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    //Printing the field, still using the margin set above.
    var svg = d3.select("#LineGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        


    

    var parseDate = d3.timeParse("%Y-%m-%d");
    var formatMonth = d3.timeFormat("%B")
    d3.csv(fileName)    
        .row(function(d) {return {date:parseDate(d.date),sentiment:Number(d.sentiment)};})
        // When changed to 'date:formatMonth(d.date)', the graph shows just a vertical line

        /*
        .sort(function(a, b) {
            return d3.descending(a.date, b.date);
        })
        */
        //This sort function does not work, why?

        .get(function(error,data){
    
            data = data.slice().sort((a,b) => d3.ascending(a.date , b.date));
/*
            var allGroup = d3.map(data, function(d){return(d.date)}).keys()
            
            d3.select("#selectButton")
            .selectAll('myOptions')
               .data(allGroup)
            .enter()
              .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("sentiment", function (d) { return d; }) // corresponding value returned by the button


*/
            var jobTitles = ["Unknown", "Employee", "Trader", "In House Lawyer", "Manager", "Managing Director", "Director", "Vice President", "President", "CEO"]
            var maxDate = d3.max(data, function(d) { return d.date;});
            var minDate = d3.min(data, function(d) { return d.date;});
            //^ console prints <empty string> <empty string> so probably this does not work. When changed to parseDate(d.date), console prints undefined
            var maxSentiment = d3.max(data, function(d) { return d.sentiment;});
            var minSentiment = d3.min(data, function(d) { return d.sentiment;});


            d3.select("#selectButton")
                .selectAll('myOptions')
                .data(jobTitles)
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; }) // corresponding value returned by the button
            
            var y = d3.scaleLinear()
                    .domain([minSentiment,maxSentiment])
                    .range([height,0]);
            var x = d3.scaleTime()
                    .domain([minDate, maxDate])
                    .range([0, width]);
            var yAxis = d3.axisLeft(y);
            var xAxis = d3.axisBottom(x);

            //Getting the line no matter where the mouse
            var bisect = d3.bisector(function(d) { return d.date; }).left;

            // Indicator for where you selected data.
            var focus = svg
                .append('g')
                .append('circle')
                .style("fill", "red")
                .attr("stroke", "black")
                .attr('r', 8.5)
                .style("opacity", 0)

            // Text element maken
            var focusText = svg
                .append('g')
                .append('text')
                .style("opacity", 0)
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "middle")

            svg.append('svg')
                .attr('height','100%')
                .attr('width','100%');
            
            // Add a clipPath: everything out of this area won't be drawn.
            var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);

            //add brushing
            //var brush = d3.brushX()
            //.extent( [ [0,0], [width,height] ] )
            //.on("end", updateChart)

            
            var chartGroup = svg.append('g')
                .attr('transform','translate(50%,50%)');
            
            var line = d3.svg.line()
                .x(function(d){ return x(d.date);})
                .y(function(d){ return y(d.sentiment);});

            //hit box to activate mouse hover.
            svg
                .append('rect')
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('width', width)
                .attr('height', height)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);

            svg.append("text")
                .style("font-size", "24px")
                .style("font-family", "Verdana")
                .text("Line graph of sentiment over time.")
                .attr("y", -20)
                .attr("x", width/10);


            //alles zichtbaar maken.
            function mouseover() {
                focus.style("opacity", 1)
                focusText.style("opacity",1)
            }

            function mousemove() {
                // De values pakken
                var x0 = x.invert(d3.mouse(this)[0]);
                var i = bisect(data, x0, 1);
                xCord = data[i]
                focus
                    .attr("cx", x(xCord.date))
                    .attr("cy", y(xCord.sentiment))
                focusText
                    .html("Date: " + xCord.date + "  /  " + "Sent: " + Math.round(xCord.sentiment * 1000)/1000)
                    .attr("x", -35)
                    .attr("y", height - 10)
            }

            //onzichtbaar als muis het vierkant verlaat.
            function mouseout() {
                focus.style("opacity", 0)
                focusText.style("opacity", 0)
            }

            chartGroup.append('path').attr('d',line(data));

            // Add the brushing
            //chartGroup
            //.attr("clip-path", "url(#clip)")
            //.attr("class", "brush").call(brush);

            chartGroup.append('g').attr('class','x axis').attr('transform','translate(0,'+height+')').call(xAxis);
            chartGroup.append('g').attr('class','y axis').call(yAxis);
            svg.append("text")
                .style("font-size", "24px")
                .style("font-family", "Verdana")
                .text("Line chart");
    /* // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      extent = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      } */
            

        });}

function createPieGraph(data) { //https://observablehq.com/@d3/donut-chart
    // dimensions

    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#PieGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var color = d3.scaleOrdinal()
        .domain(data.map(d => d.fromId))
        //using interpolateWarm rather than interpolateSpectral for aesthetic and visibility reasons
        .range(d3.quantize(t => d3.interpolateWarm(t * 0.8 + 0.1), data.length).reverse());

    const radius = Math.min(width, height) / 2;
    const arc =  d3.arc()
        .innerRadius(radius * 0.67)
        .outerRadius(radius - 1);

    var pie = d3.pie()
        .padAngle(0.005) //very slight angle for visibility, perhaps this is an issue when scaling?
        .sort(null)
        .value(d => d.sentiment);//this returns only the first sentiment (i expect), need to figure out how to return the mean

    const arcs = pie(data);
    
    //printing the field
    var svg = d3.select('#PieGraph')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("path")
    .data(arcs)
    .join("path")
        .attr("fill", d => color(d.data.fromId))//dont think this syntax checks out
        .attr("d", arc)
    .append("title")
        .text(d => `${d.data.fromId}: ${d.data.sentiment.toLocaleString()}`);//dont know how to make this the mean

    svg.append("g")
        .attr("font-family", "Verdana")
        .attr("font-size", "12")
        .attr("text-anchor", "middle")//this makes the text appear in center of arc
    .selectAll("text")
    .data(arcs)
    .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.fromId))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.sentiment.toLocaleString()));
        
}