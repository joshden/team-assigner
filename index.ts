import Logger from './src/Logger';
import parseTeamsAndTeachers from "./src/data/parseTeamsAndTeachers";
import parseChildrenAndParents, { StringKeyValue } from './src/data/parseChildrenAndParents';
import writeTeamAssignments from './src/data/writeTeamAssignments';
import TeamAssigner from './src/TeamAssigner';
import { AssignmentRuleMapping } from './src/AssignmentRuleMapping';

// If this module cannot be found, start by copying customData.sample.ts to customData.ts and modifying it
import * as data from './customData';
import { Child } from './src/Child';
import AgeOnDate from './src/AgeOnDate';

const logger = new Logger;
const ageOnDate = new AgeOnDate(data.eventDate);
const children = parseChildrenAndParents(data.childParentsFilePath, data.fullNameToFirstLastMapping, ageOnDate, data.ignoreAgeLessThan, data.ignoreAgeGreaterThan, data.rawValueChanges, logger);
const teams = parseTeamsAndTeachers(data.teamsAndTeachersFilePath);
const teamAssigner = new TeamAssigner;
const assignedTeams = teamAssigner.assignTeams(children, teams, data.teamsBySpecialRequestOnly, data.assignmentRuleMappings, data.childrenToIgnore, ageOnDate, logger);
writeTeamAssignments(assignedTeams, ageOnDate, data.teamAssignmentsFilePath);

console.log(JSON.stringify(logger.entries, null, 2));
// console.log(JSON.stringify(children, null, 2));

// const teamVariances = assignedTeams.map(team => team.getCompositionReport());
// const overallVariance = teamVariances.map(r => r.weightedVariance).reduce((acc, val) => acc + val);
// console.log({overallVariance, teamVariances});

// logger.entries
//     .filter(e => e.message.startsWith('Assuming child name'))
//     .map(e => e.params[0] as any)
//     .forEach(child => console.log(`Parent: ${child.$parents.FirstName} ${child.$parents.LastName}\nChild: ${child.ChildName}\n`));


// function singleQuoteEscape(value: string | undefined) {
//     return typeof value === 'string' ? value.replace(/'/g, "\\'") : '';
// }
// logger.entries
//     .filter(e => e.message.startsWith('No applicable rule mapping was found for child notes'))
//     .map(e => e.params[0] as Child)
//     .forEach(child => console.log(`mapping(matchAll(notes('${singleQuoteEscape(child.notes)}'),\n` + 
//                                   `        child('${singleQuoteEscape(child.firstName)}', '${singleQuoteEscape(child.lastName)}')),\n` +
//                                   `    all()),\n`));

// const names = [
//     'FirstName LastName'
// ];
// console.log(JSON.stringify(assignedTeams
//     // .filter(t => t.team.teamNumber === 'A')
//     .map(t => ({
//         "team": t.team.teamNumber, 
//         "children": t.children.map(c => `${c.firstName} ${c.lastName}`)}))
//     .filter(t => t.children.some(name => names.includes(name)))
//     , null, 2));


const entriesWithRawValues = logger.entries.filter(e => e.rawValues);
const uniqueRawValues = new Set(entriesWithRawValues.map(e => e.rawValues as StringKeyValue));
Array.from(uniqueRawValues.values()).forEach(rawValues => {
    const { CartID, $rowNum } = rawValues;
    delete rawValues.CartID;
    delete rawValues.$rowNum;
    entriesWithRawValues.forEach(entry => {
        if (entry.rawValues === rawValues) {
            console.log(`// Row ${$rowNum} ${entry.message}`);
        }
    });
    console.log(`${JSON.stringify(CartID)}: {`);
    Object.keys(rawValues).forEach(key => {
        const jsonValue = JSON.stringify(rawValues[key]);
        console.log(`  ${JSON.stringify(key)}: [${jsonValue}, ${jsonValue}],`);
    });
    console.log("},");
});