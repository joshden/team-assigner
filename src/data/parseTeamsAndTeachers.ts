import * as path from 'path';
import parseSheet from './ExcelSheetObjectArrayParser';
import { Team } from '../Team';
import Teacher from '../Teacher';


export default function parseTeamsAndTeachers(filePath: string) {
    const rows = parseSheet(filePath, 'Sheet1', 3);
    const teams =
        rows.map(row =>
            new Team(
                row['Team #'],
                createTeachers(
                    row.Teacher,
                    row.Assistants,
                    row.Assistants$1)));
    return teams;
};

function createTeachers(...names: string[]) {
    return names
        .filter(n => typeof n === 'string')
        .map(name => {
            const [firstName, lastName] = name.split(/ +/, 2);
            return new Teacher(firstName, lastName);
        });
}