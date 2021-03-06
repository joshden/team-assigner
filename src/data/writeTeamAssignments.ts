import { AssignedTeam } from "../Team";
import xlsx from 'xlsx';
import { Gender } from "../Child";
import _ from "lodash";
import AgeOnDate from "../AgeOnDate";

type ChildRow = {
    'Last Name': string;
    'First Name': string;
    'Gender': string;
    'Age': number;
    'Team': string;
    'Notes': string;
};

export default function writeTeamAssignments(teams: AssignedTeam[], ageOnDate: AgeOnDate, filePath: string) {
    const childRows = _.flatten(teams.map(t => t.children.map(c => ({
        'Last Name': c.lastName,
        'First Name': c.firstName,
        'Gender': c.gender === Gender.Male ? 'Male' : c.gender === Gender.Female ? 'Female' : undefined,
        'Age': c.dateOfBirth === null ? undefined : Math.round(ageOnDate.getYears(c.dateOfBirth) * 10) / 10,
        'Team': t.team.teamNumber,
        'Notes': c.notes
    }) as ChildRow)))
    
    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(childRows);
    xlsx.utils.book_append_sheet(workbook, sheet);
    xlsx.writeFile(workbook, filePath);
}