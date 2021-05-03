import tableMaker from "./tableMaker.js";

const tableRoot = document.querySelector("#tableData");
const tableCsv = new tableMaker(tableRoot);

csvUploader.addEventListener("change", (e) => {
    async function getData() {
        const response = await fetch('csvUploader')
        const data = await response.text();
        console.log(data)
    }
});

csvUploader.addEventListener("change", (e) => {
    Papa.parse(csvUploader.files[0], {
        delimiter: ",",
        skipEmptyLines: true,
        complete: (results) => {
            tableCsv.update(results.data.slice(1), results.data[0]);
        }
    });
});
