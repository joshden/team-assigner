import * as path from 'path';
import parseSheet from './ExcelSheetObjectArrayParser';
import * as _ from 'lodash';

type StringKeyValue = {[key: string]: string};

const rows = parseSheet(__dirname + '/../conv reg 2017.xls', 'Sheet1');

const nameRegex = /^([a-z]+?[-a-z ]*[a-z]+)|[a-z]$/i;

const parentsFields = {
    'LastName': nameRegex,
    'FirstName': nameRegex,
    'SpouseLastName': nameRegex,
    'SpouseFirstName': nameRegex
};

const childFields = {
    'ChildName': nameRegex,
    'ChildGender': /^m|f|male|female|femail|boy|girl$/i,
    'ChildBirthday': /^(\d{1,2}\/\d{1,2}\/(\d{2}){1,2})|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/,
    'ChildShirtSize': /^ys|ym|yl|as|am|al|xl|adult large$/i,
};

const parentsList: StringKeyValue[] = [];
const children: StringKeyValue[] = [];

rows.forEach((row, index) => {
    row.ChildBirthday2 = row.ChildBirdthday2;
    delete row.ChildBirdthday2; 

    const parents: StringKeyValue = { $rowNum: row.$rowNum };
    Object.keys(parentsFields).forEach(field => parents[field] = row[field]);

    let anyChildren = false;
    _.range(1, 6).forEach(childNum => {
        const child: {[field: string]: any} = {};
        let isChild = false;
        Object.keys(childFields).forEach(field => {
            const fieldName = field + childNum.toString();
            // console.log(fieldName);
            if (row[fieldName].length > 0) {
                isChild = true;
                child[field] = row[fieldName];
            }
        });
        if (isChild) {
            anyChildren = true;
            child.$childNum = childNum;
            child.Notes = row.Notes;
            child.parents = parents;
            children.push(child);
        }
    });

    if (anyChildren) {
        parentsList.push(parents);
    }
});

function findMismatchedRecords(records: StringKeyValue[], fields: {[key: string]: RegExp}) {
    return records
        .filter(_.negate(record => Object.keys(fields).reduce((accum, fieldName) => {
            const pattern = fields[fieldName];
            const value = record[fieldName];
            if (! pattern.test(value)) {
                console.log(fieldName, value);
            }
            return accum && pattern.test(value);
        }, true)));
}


console.log(
    findMismatchedRecords(parentsList, parentsFields)
        .filter(parents => !(
            (parents.LastName === '' && parents.FirstName === '' && parents.SpouseLastName.length > 0 && parents.SpouseFirstName.length > 0)
            ||
            (parents.SpouseLastName === '' && parents.SpouseFirstName === '' && parents.LastName.length > 0 && parents.FirstName.length > 0)
        ))
);

console.log(
    findMismatchedRecords(children, childFields)
);
