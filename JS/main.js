import tableMaker from "./tableMaker.js";

d3.select();
d3.selectAll();

d3.select('h1').style('color', 'blue');

const tableRoot = document.querySelector("#tableData");
const tableCsv = new tableMaker(tableRoot);

csvUploader.addEventListener("change", (e) => {
    Papa.parse(csvUploader.files[0], {
        delimiter: ",",
        skipEmptyLines: true,
        complete: (results) => {
            tableCsv.update(results.data.slice(1), results.data[0]);
        }
    });
});
