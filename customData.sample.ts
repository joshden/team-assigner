import path from 'path';
import * as m from './src/AssignmentRuleMapping';
import { mapping, notes, child, ageAtLeast, ageLessThan, unknownAge, parent, matchAll, matchAny, notMatch, gender } from "./src/AssignmentRuleMapping";
import * as r from './src/AssignmentRule';
import { onTeam, taughtBy, withChild, withChildrenOf, not, any, all } from "./src/AssignmentRule";
import { Gender } from './src/Child';
import { RawValueChanges } from './src/data/parseChildrenAndParents';

export const eventDate = new Date('2019-04-12');
export const ignoreAgeLessThan = 0;
export const ignoreAgeGreaterThan = 14;

export const teamsAndTeachersFilePath = path.resolve(__dirname, '..', 'teamsAndTeachers.xlsx');
export const childParentsFilePath = path.resolve(__dirname, '..', 'childrenAndParents.xls');
export const teamAssignmentsFilePath = path.resolve(__dirname, '..', 'assignedTeams.xlsx');

export const teamsBySpecialRequestOnly = new Set([
    // 'A'
]);

export const rawValueChanges = {
} as RawValueChanges;

export const fullNameToFirstLastMapping = {
    // 'Full Name': ['First Name', 'Last Name'],
} as {[fullName: string]: [string, string]};

// These registrants seem to have incorrectly put their full name into the child 1 field and not intended to register children
const mistakenParentRegistration = (first: string, last: string) =>
    matchAll(child(first, last), gender(Gender.Unknown), unknownAge, parent(first, last));

export const childrenToIgnore = matchAny(
    notMatch(matchAny()),
    //  matchAll(child('Jane', 'Doe'), gender(Gender.Unknown), unknownAge, parent('John', 'Doe')),
);

export const assignmentRuleMappings = [
    mapping(notes('If possible, we would like our kids to be on the same team as Jon Doe.  Thank you!'),
        withChild('Jon', 'Doe'))
];