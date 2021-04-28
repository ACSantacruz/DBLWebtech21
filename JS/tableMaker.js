export default class {
    /**
     * These type of comments are useful for setting the types(It shows what type of input is required next to it.
     *@param {HTML TableElement} root
     */
     constructor(root) {
         this.root = root;
    }

    /**
     *@param {string []} headerColumns
     */
    setHeader(headerColumns) {
        this.root.insertAdjacentHTML(
            "afterbegin",
            `
            <thead> <tr> ${headerColumns.map((text) => `<th>${text}</th>`).join("")} </tr> </thead>
        `
        );
    }

    /**
     *@param {string [][]} data
     */
    setBody(data) {

        const rows = data.map((row) => {
            return `
                <tr> ${row.map((text) => `<td>${text}</td>`).join("")} </tr>
            `;
        });

        this.root.insertAdjacentHTML(
            "beforeend",
            `
            <tbody> ${rows.join("")} </tbody>
        `
        );
    }

    /**
     *
     * @param {string[][]} data
     * @param {string[]} headerColumns
     *
     */
    update(data, headerColumns = []) {
        this.clear();
        this.setHeader(headerColumns);
        this.setBody(data);
    }

    /** removes previous tables as to not to stack it */
    clear() {
        this.root.innerHTML = "";
    }
}
