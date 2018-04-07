import * as path from 'path';
import parseSheet from './ExcelSheetObjectArrayParser';
import * as _ from 'lodash';
import Logger from '../Logger';
import Parents from '../Parents';
import { Child, BaseChild, Gender, ShirtSize } from '../Child';
import AgeOnDate from '../AgeOnDate';

type StringKeyValue = {[key: string]: string};
type FullNameFirstLast = {[key: string]: [string, string]};

const nameRegex = /^([a-z]+?[-a-z ]*[a-z]+)|[a-z]$/i;
const dateRegex = /^(\d{1,2}\/\d{1,2}\/(\d{2}){1,2})|(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;

const genderMapping: {[key: string]: Gender} = {
    m: Gender.Male,
    male: Gender.Male,
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

export default function parseChildrenAndParents(filePath: string, fullNameFirstLast: FullNameFirstLast, ageOnDate: AgeOnDate, ignoreAgeLessThan: number, ignoreAgeGreaterThan: number, logger: Logger) {
    const rows = parseSheet(filePath, 'Sheet1');

    const parentsList: StringKeyValue[] = [];
    const children: Child[] = [];
    
    rows.forEach((row, index) => {
        row.ChildBirthday2 = row.ChildBirdthday2;
        delete row.ChildBirdthday2; 
    
        const parents: StringKeyValue = { $rowNum: row.$rowNum };
        parentsFields.forEach(field => parents[field] = row[field]);
    
        let parentsObj: Parents;
        _.range(1, 6).forEach(childNum => {
            const child: {[field: string]: any} = {};
            let isChild = false;
            childFields.forEach(field => {
                const fieldName = field + childNum.toString();
                if (row.hasOwnProperty(fieldName) && row[fieldName].length > 0) {
                    isChild = true;
                    child[field] = row[fieldName];
                }
            });
            if (isChild) {
                if (! parentsObj) {
                    parentsObj = createParents(parents, logger);
                }
                child.$childNum = childNum;
                child.$parents = parents;
                child.Notes = row.Notes;
                children.push(createChild(parentsObj, child, fullNameFirstLast, ageOnDate, ignoreAgeLessThan, ignoreAgeGreaterThan, logger));
            }
        });
    });

    return children;
}

function createParents(parents: StringKeyValue, logger: Logger) {
    const names: {firstName: string, lastName: string}[] = [];

    [['FirstName', 'LastName'], ['SpouseFirstName', 'SpouseLastName']].forEach(fields => {
        const [fField, lField] = fields;
        if (parents[fField] !== '' || parents[lField] !== '') {
            if (! nameRegex.test(parents[fField])) {
                logger.warning('Unexpected FirstName value', parents);
            }
            if (! nameRegex.test(parents[lField])) {
                logger.warning('Unexpected LastName value', parents);
            }
            names.push({firstName: parents[fField], lastName: parents[lField]});
        }
    });

    if (names.length < 1) {
        logger.warning('No parent names were found', parents);
    }

    return new Parents(...names);
}

function createChild(parents: Parents, child: {[field: string]: any}, fullNameFirstLast: FullNameFirstLast, ageOnDate: AgeOnDate, ignoreAgeLessThan: number, ignoreAgeGreaterThan: number, logger: Logger) {
    const [firstName, lastName] = getChildFirstAndLastName(child, parents, fullNameFirstLast, logger);
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
            dob = null;
        }
    }

    const gender = child.hasOwnProperty('ChildGender') && genderMapping.hasOwnProperty(child.ChildGender.toLowerCase()) ? genderMapping[child.ChildGender.toLowerCase()] : Gender.Unknown;
    const shirtSize = child.hasOwnProperty('ChildShirtSize') && shirtSizeMapping.hasOwnProperty(child.ChildShirtSize.toLowerCase()) ? shirtSizeMapping[child.ChildShirtSize.toLowerCase()] : null;

    if (dob === null) {
        logger.warning(`Unexpected DOB ${child.ChildBirthday}`, child);
    }

    if (gender === Gender.Unknown) {
        logger.warning(`Unknown gender ${child.ChildGender}`, child);
    }

    if (shirtSize === null) {
        logger.warning(`Unknown shirt size ${child.ShirtSize}`, child);
    }

    return new BaseChild(parents, child.Notes, firstName, lastName, dob, gender, shirtSize);
}

function getChildFirstAndLastName(child: {[field: string]: any}, parents: Parents, fullNameFirstLast: FullNameFirstLast, logger: Logger): [string, string] {
    let name = child.ChildName as string;
    if (! nameRegex.test(name)) {
        logger.warning(`Unexpected child name ${name}`, child);
    }
    if (typeof name !== 'string') {
        name = '';
    }
    const namePieces = name.split(/ +/);
    const parentLastNames = parents.names.map(name => name.lastName);

    if (namePieces.length > 1) {
        if (parentLastNames.length > 0) {
            for (const parentLastName of parentLastNames) {
                if (name.toLowerCase().endsWith(parentLastName.toLowerCase())) {
                    const firstName = name.substring(0, name.length - parentLastName.length).trim();
                    const lastName = parentLastName;
                    return [firstName, lastName];
                }
            }

            if (fullNameFirstLast.hasOwnProperty(name)) {
                return fullNameFirstLast[name];
            }

            else {
                logger.warning(`Assuming child name first/middle=${name} and last=${parentLastNames[0]} and not a different last name from parents`, child);
                return [name, parentLastNames[0]];
            }
        }
        else {
            const last = namePieces.pop() as string;
            const first = namePieces.join(' ');
            logger.warning(`Assuming child name is first=${first} last=${last} because no parent last names were found`, child);
            return [first, last];
        }
    }

    else if (parentLastNames.length > 0) {
        return [name, parentLastNames[0]];
    }

    else {
        logger.warning('No last name found for child or parents', child);
        return [name, ''];
    }
}
