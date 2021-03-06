import * as xlsx from 'xlsx';

type StringKeyValue = {[key: string]: string};

/**
 * Considers the first row (by default) in a sheet as the header row for object properties.
 * Returns the remaining rows of the sheet as an array of objects.
 * Each objet corresponds to a row in the sheet with property names being the value from the header row.
 * Currently only supports string cell types.
 * @param filePath
 * @param sheetName 
 */
export default function parseSheet(filePath: string, sheetName: string, headerRow: number = 1) {
    const workbook = xlsx.readFile(filePath, {cellDates: true});
    const sheet = workbook.Sheets[sheetName];

    const colHeaders: StringKeyValue = {};
    const rows: StringKeyValue[]  = [];
    let currentRowNum = 0;
    let currentRow: StringKeyValue = {};

    Object.getOwnPropertyNames(sheet).forEach(address => {
        const match = address.match(/^([A-Z]+)(\d+)$/);
        if (match !== null) {
            let cellValue: string;
            const value = sheet[address].v;
            if (value instanceof Date) {
                cellValue = value.toISOString();
            }
            else if (['string', 'number'].includes(typeof value)) {
                cellValue = value.toString().trim();
            }
            else if (typeof value === 'boolean') {
                cellValue = value.toString();
            }
            else {
                console.error(sheet[address]);
                throw new Error(`Unexpected type ${sheet[address].t} at ${address}`);
            }

            const colLetter = match[1];
            const newRowNum = Number(match[2]);

            if (newRowNum <= headerRow) {
                cellValue = cellValue.replace(/^Field_/, '');
                if (Object.values(colHeaders).includes(cellValue)) {
                    let num = 1;
                    while (Object.values(colHeaders).includes(`cellValue$${num}`)) {
                        num++;
                    }
                    cellValue = `${cellValue}$${num}`;
                }
                colHeaders[colLetter] = cellValue;
            }
            else {
                // if (cellValue === undefined) {
                //     console.log({field:colHeaders[colLetter],cellValue});
                // }
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