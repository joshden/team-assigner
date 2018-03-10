import * as xlsx from 'xlsx';

/**
 * Considers the first row in a sheet as the header row for object properties.
 * Returns the remaining rows of the sheet as an array of objects.
 * Each objet corresponds to a row in the sheet with property names being the value from the first row.
 * Currently only supports string cell types.
 * @param filePath
 * @param sheetName 
 */
export default function parseSheet(filePath: string, sheetName: string) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];

    const colHeaders = {};
    const rows : {[key: string]: string}[]  = [];
    let currentRowNum = 0;
    let currentRow : {[key: string]: string} = {};

    Object.getOwnPropertyNames(sheet).forEach(address => {
        const match = address.match(/^([A-Z]+)(\d+)$/);
        if (match !== null) {
            if (sheet[address].t !== 's') {
                throw new Error(`Unexpected type ${sheet[address].t} at ${address}`);
            }
            const colLetter = match[1];
            const newRowNum = Number(match[2]);
            const cellValue = sheet[address].v.trim() as string;

            if (newRowNum === 1) {
                colHeaders[colLetter] = cellValue;
            }
            else {
                if (currentRowNum !== newRowNum) {
                    currentRowNum = newRowNum;
                    currentRow = { $rowNum: newRowNum.toFixed() };
                    rows.push(currentRow)
                }
                currentRow[colHeaders[colLetter]] = cellValue;
            }

        }
    });

    return rows;
}