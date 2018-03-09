import * as path from 'path';
import parseSheet from './ExcelSheetObjectArrayParser';
import * as _ from 'lodash';

const rows = parseSheet(__dirname + '/../conv reg 2017.xls', 'Sheet1');

const parentFields = ['LastName', 'FirstName', 'SpouseLastName', 'SpouseFirstName'];
const childFields = ['ChildName', 'ChildGender', 'ChildBirthday', 'ChildShirtSize'];
const children = [];

rows.forEach((row, index) => {
    row.ChildBirthday2 = row.ChildBirdthday2;
    delete row.ChildBirdthday2; 

    const parents = { $rowNum: row.$rowNum };
    parentFields.forEach(field => parents[field] = row[field]);

    _.range(1, 6).forEach(childNum => {
        const child: {[field: string]: any} = {};
        let isChild = false;
        childFields.forEach(field => {
            const fieldName = field + childNum.toString();
            // console.log(fieldName);
            if (row[fieldName].length > 0) {
                isChild = true;
                child[field] = row[fieldName];
            }
        });
        if (isChild) {
            child.$childNum = childNum;
            child.Notes = row.Notes;
            child.parents = parents;
            children.push(child);
        }
    });
});

children.forEach(child => {
    // if (child.ChildName.match(/^[a-zA-Z]+$/)) {
    if (typeof child.ChildName !== 'string') {
        console.log(child);
    }
});
