import * as path from 'path';
import parseSheet from './ExcelSheetObjectArrayParser';
import * as _ from 'lodash';
import Logger from '../Logger';
import Parents from '../Parents';
import { Child, BaseChild, Gender, ShirtSize } from '../Child';
import AgeOnDate from '../AgeOnDate';

export type StringKeyValue = {[key: string]: string};
type FullNameFirstLast = {[key: string]: [string, string]};
export type RawValueChanges = { [cartId: string]: { [key: string]: [string, string] } };

const nameRegex = /^([a-z]+?[-a-z ]*[a-z]+)|[a-z]$/i;
const dateRegex = /^(\d{1,2}\/\d{1,2}\/(\d{2}){1,2})|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;

const genderMapping: {[key: string]: Gender} = {
    m: Gender.Male,
    male: Gender.Male,
    maile: Gender.Male,
    boy: Gender.Male,
    f: Gender.Female,
    female: Gender.Female,
    femail: Gender.Female,
    femal: Gender.Female,
    girl: Gender.Female
};

const shirtSizeMapping: {[key: string]: ShirtSize} = {
    ys: ShirtSize.YS,
    ym: ShirtSize.YM,
    yl: ShirtSize.YL,
    as: ShirtSize.AS,
    am: ShirtSize.AM,
    'adult large': ShirtSize.AL,
    al: ShirtSize.AL,
    xl: ShirtSize.XL
}

const parentsFields = [
    'LastName',
    'FirstName',
    'SpouseLastName',
    'SpouseFirstName'
];

const childFields = [
    'ChildName',
    'ChildGender',
    'ChildBirthday',
    'ChildShirtSize',
];

const maxChildCount = 6;

const fieldsOfInterest = ['$rowNum', 'CartID']
    .concat(parentsFields)
    .concat(_.flatten(_.range(1, maxChildCount+1).map(num => childFields.map(field => `${field}${num}`))));

export default function parseChildrenAndParents(filePath: string, fullNameFirstLast: FullNameFirstLast, ageOnDate: AgeOnDate, ignoreAgeLessThan: number, ignoreAgeGreaterThan: number, rawValueChanges: RawValueChanges, logger: Logger) {
    const rows = parseSheet(filePath, 'Sheet1');

    const parentsList: StringKeyValue[] = [];
    const children: Child[] = [];

    rows.forEach((row, index) => {
        // row.ChildBirthday2 = row.ChildBirdthday2;
        // delete row.ChildBirdthday2;

        const changes = rawValueChanges[row.CartID];
        if (changes) {
            const mismatches = Object.keys(changes).filter(key => changes[key][0] !== row[key]);
            if (mismatches.length) {
                logger.warning("rawValueChanges orig and incoming values don't match, skipping", mismatches, row.CartID, changes, row);
            }
            else {
                Object.keys(changes).forEach(key => row[key] = changes[key][1]);
            }
        }
    
        const rawValues: StringKeyValue = {};
        fieldsOfInterest.forEach(field => rawValues[field] = row[field]);

        const parents: StringKeyValue = { $rowNum: row.$rowNum };
        parentsFields.forEach(field => parents[field] = row[field]);

        let parentsObj: Parents;
        _.range(1, maxChildCount+1).forEach(childNum => {
            const child: {[field: string]: any} = {};
            let isChild = false;
            childFields.forEach(field => {
                const fieldName = field + childNum.toString();
                if (row.hasOwnProperty(fieldName)) {
                    // console.log(row); 
                    if (row[fieldName].length > 0) {
                        isChild = true;
                        child[field] = row[fieldName];
                    }
                }
            });
            if (isChild) {
                if (! parentsObj) {
                    parentsObj = createParents(parents, rawValues, logger);
                }
                child.$childNum = childNum;
                child.$parents = parents;
                child.Notes = row.Notes;
                children.push(createChild(parentsObj, child, rawValues, fullNameFirstLast, ageOnDate, ignoreAgeLessThan, ignoreAgeGreaterThan, logger));
            }
        });
    });

    return children;
}

function createParents(parents: StringKeyValue, rawValues: StringKeyValue, logger: Logger) {
    const names: {firstName: string, lastName: string}[] = [];

    [['FirstName', 'LastName'], ['SpouseFirstName', 'SpouseLastName']].forEach(fields => {
        const [fField, lField] = fields;
        if (parents[fField] !== '' || parents[lField] !== '') {
            if (! nameRegex.test(parents[fField])) {
                logger.parseWarning(rawValues, 'Unexpected FirstName value', parents);
            }
            if (! nameRegex.test(parents[lField])) {
                logger.parseWarning(rawValues, 'Unexpected LastName value', parents);
            }
            names.push({firstName: parents[fField], lastName: parents[lField]});
        }
    });

    if (names.length < 1) {
        logger.parseWarning(rawValues, 'No parent names were found', parents);
    }

    return new Parents(...names);
}

function createChild(parents: Parents, child: {[field: string]: any}, rawValues: StringKeyValue, fullNameFirstLast: FullNameFirstLast, ageOnDate: AgeOnDate, ignoreAgeLessThan: number, ignoreAgeGreaterThan: number, logger: Logger) {
    const [firstName, lastName] = getChildFirstAndLastName(child, parents, rawValues, fullNameFirstLast, logger);
    let dob: Date | null = null;
    if (dateRegex.test(child.ChildBirthday)) {
        dob = new Date(child.ChildBirthday);
    }
    else if (typeof child.ChildBirthday === 'string' && dateRegex.test(child.ChildBirthday.replace(/\-/g, '/'))) {
        dob = new Date(child.ChildBirthday.replace(/\-/g, '/'));
    }
    
    if (dob instanceof Date) {
        const age = ageOnDate.getYears(dob);
        if (age < ignoreAgeLessThan || age > ignoreAgeGreaterThan) {
            logger.parseWarning(rawValues, `Ignoring child age that is outside of the expected range. Expected: ${ignoreAgeLessThan} < age < ${ignoreAgeGreaterThan}. Actual: ${age}`, child);
            dob = null;
        }
    }
    else {
        logger.parseWarning(rawValues, `Unexpected DOB ${child.ChildBirthday}`, child);
    }

    const gender = child.hasOwnProperty('ChildGender') && genderMapping.hasOwnProperty(child.ChildGender.toLowerCase()) ? genderMapping[child.ChildGender.toLowerCase()] : Gender.Unknown;
    const shirtSize = child.hasOwnProperty('ChildShirtSize') && shirtSizeMapping.hasOwnProperty(child.ChildShirtSize.toLowerCase()) ? shirtSizeMapping[child.ChildShirtSize.toLowerCase()] : null;

    if (gender === Gender.Unknown) {
        logger.parseWarning(rawValues, `Unknown gender ${child.ChildGender}`, child);
    }

    if (shirtSize === null) {
        // logger.warning(`Unknown shirt size ${child.ShirtSize}`, child);
    }

    return new BaseChild(parents, child.Notes, firstName, lastName, dob, gender, shirtSize);
}

function getChildFirstAndLastName(child: {[field: string]: any}, parents: Parents, rawValues: StringKeyValue, fullNameFirstLast: FullNameFirstLast, logger: Logger): [string, string] {
    let name = child.ChildName as string;
    if (! nameRegex.test(name)) {
        logger.parseWarning(rawValues, `Unexpected child name ${name}`, child);
    }
    if (typeof name !== 'string') {
        name = '';
    }
    const namePieces = name.split(/ +/);
    const parentLastNames = parents.names.map(name => name.lastName);

    if (namePieces.length > 1) {
        if (parentLastNames.length > 0) {
            if (fullNameFirstLast.hasOwnProperty(name)) {
                return fullNameFirstLast[name];
            }

            for (const parentLastName of parentLastNames) {
                if (name.toLowerCase().endsWith(parentLastName.toLowerCase())) {
                    const firstName = name.substring(0, name.length - parentLastName.length).trim();
                    const lastName = parentLastName;
                    return [firstName, lastName];
                }
            }

            logger.parseWarning(rawValues, `Assuming child name first/middle=${name} and last=${parentLastNames[0]} and not a different last name from parents`, child);
            return [name, parentLastNames[0]];
        }
        else {
            const last = namePieces.pop() as string;
            const first = namePieces.join(' ');
            logger.parseWarning(rawValues, `Assuming child name is first=${first} last=${last} because no parent last names were found`, child);
            return [first, last];
        }
    }

    else if (parentLastNames.length > 0) {
        return [name, parentLastNames[0]];
    }

    else {
        logger.parseWarning(rawValues, 'No last name found for child or parents', child);
        return [name, ''];
    }
}
