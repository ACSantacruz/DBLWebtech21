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
    
    //createUniqueGraph(data); unfinished
}

function createUniqueGraph(data) {//https://observablehq.com/@d3/force-directed-graph
    
    // Using the standard Size thing from JS does anyone know how to convert this to scale to the size of the boxes>?
    var margin = {top: 80, right: 25, bottom: 30, left: 40},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;


    const links;
    links = d3.csv("enron-clean.csv", function(data) {
        
    });


    const nodes;

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

}
