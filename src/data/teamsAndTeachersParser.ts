import * as path from 'path';
import parseSheet from './ExcelSheetObjectArrayParser';
import { Team } from '../Team';
import Teacher from '../Teacher';

const rows = parseSheet(__dirname + '/../FBA Team Assignments 2018.xlsx', 'Sheet1', 3);

export const teams =
    rows.map(row =>
        new Team(
            row['Team #'],
            createTeachers(
                row.Teacher,
                row.Assistants,
                row.Assistants$1)));

function createTeachers(...names: string[]) {
    return names
        .filter(n => typeof n === 'string')
        .map(name => {
            const [firstName, lastName] = name.split(/ +/, 2);
            return new Teacher(firstName, lastName);
        });
}