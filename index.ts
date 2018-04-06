import path from 'path';
import Logger from './src/Logger';
import parseTeamsAndTeachers from "./src/data/parseTeamsAndTeachers";
import parseChildrenAndParents from './src/data/parseChildrenAndParents';
import TeamAssigner from './src/TeamAssigner';
import { AssignmentRuleMapping } from './src/AssignmentRuleMapping';

// If this module cannot be found, start by copying customData.sample.ts to customData.ts and modifying it
import { assignmentRuleMappings, teamsBySpecialRequestOnly } from './customData'; // TODO could also add to this corrections mappings like student last names

const logger = new Logger;
const children = parseChildrenAndParents(path.resolve(__dirname, '..', '2018 FBA registration.xls'), logger);
const teams = parseTeamsAndTeachers(path.resolve(__dirname, '..', 'FBA Team Assignments 2018.xlsx'));
const teamAssigner = new TeamAssigner;
const assignedTeams = teamAssigner.assignTeams(children, teams, teamsBySpecialRequestOnly, assignmentRuleMappings, new Date('2018-04-13'), logger);

// console.log(JSON.stringify(logger.entries, null, 2));
// console.log(JSON.stringify(children, null, 2));
// console.log(JSON.stringify(assignedTeams, null, 2));