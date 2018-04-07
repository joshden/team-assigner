import { Team, IdealForTeam, GenderCounts, DateRangeCounts } from "./Team";
import { ChildWithRules, Gender } from "./Child";

export type NullableDate = Date | null;

export function createIdealsForTeams(assignableTeams: Team[], teamsBySpecialRequestOnly: Set<string>, allChildren: ChildWithRules[], maxGenderDobRangeCount = 4) {
    const specialRequestTeams = getSpecialRequestTeams(assignableTeams, teamsBySpecialRequestOnly);
    const nonSpecialTeamCount = assignableTeams.length - teamsBySpecialRequestOnly.size;
    const children = allChildren.filter(child => ! child.matchToUse || ! specialRequestTeams.has(child.matchToUse.team as Team));
    const childrenPerTeam = children.length / nonSpecialTeamCount;
    const minChildrenPerTeam = Math.floor(childrenPerTeam);
    const maxChildrenPerTeam = Math.ceil(childrenPerTeam);
    const byGenderDobRange = new Map<Gender, Map<NullableDate, number>>();
    const {byGender, dobByGender} = createEmptyMaps();

    children.forEach(child => {
        const gender = child.gender;
        byGender.set(gender, byGender.get(gender) as number + 1);
        (dobByGender.get(gender) as Array<NullableDate>).push(child.dateOfBirth);
    });

    for (const genderCount of Array.from(byGender.entries())) {
        byGender.set(genderCount[0], genderCount[1] / nonSpecialTeamCount);
    }

    for (const entry of Array.from(dobByGender.entries())) {
        const [gender, allDobs] = entry;
        const dobs = allDobs.filter(dob => dob !== null) as Date[];
        const rangeDates: NullableDate[] = [null];
        dobs.sort((a, b) => a.getTime() - b.getTime());
        if (dobs.length > 0) {
            const oldest = dobs[0].getTime();
            const youngest = dobs[dobs.length - 1].getTime();
            const sizeOfEachRange = (youngest - oldest) / maxGenderDobRangeCount;
            for (let range = 1; range <= maxGenderDobRangeCount; range++) {
                rangeDates.push(new Date(oldest + sizeOfEachRange * range));
            }
        }

        const dobRangeCounts = getDobRangeCounts(rangeDates, allDobs);
        const dobRangeCountPerTeam = new Map(Array.from(dobRangeCounts.entries()).map(entry => [entry[0], entry[1] / nonSpecialTeamCount] as [NullableDate, number]));
        byGenderDobRange.set(gender, dobRangeCountPerTeam);
    }

    // console.log(byGender);
    // console.log(byGenderDobRange);

    return assignableTeams.map(team => {
        const isSpecialRequestTeam = specialRequestTeams.has(team);
        return new IdealForTeam(
            team,
            isSpecialRequestTeam ? 0 : minChildrenPerTeam,
            isSpecialRequestTeam ? 0 : maxChildrenPerTeam,
            isSpecialRequestTeam ? createEmptyMaps().byGender : byGender,
            isSpecialRequestTeam ? createEmptyMaps().byGenderDobRange : byGenderDobRange,
            isSpecialRequestTeam)
    });
}


export function getDobRangeCounts(rangeDates: NullableDate[], datesOfBirth: NullableDate[]) {
    const dobRangeCounts = new Map<NullableDate, number>();

    rangeDates.forEach(date => {
        dobRangeCounts.set(date, 0);
    });
    
    datesOfBirth.forEach(dob => {
        let rangeToUse: NullableDate = null;
        if (dob !== null) {
            for (const rangeDate of rangeDates) {
                if (rangeDate !== null && dob <= rangeDate) {
                    rangeToUse = rangeDate;
                    break;
                }
            }
        }
        dobRangeCounts.set(rangeToUse, dobRangeCounts.get(rangeToUse) as number + 1);
    });
    
    return dobRangeCounts;
}

function getSpecialRequestTeams(allTeams: Team[], specialRequestNames: Set<string>) {
    const specialRequestTeams = new Set<Team>();
    for (const teamName of Array.from(specialRequestNames)) {
        const team = allTeams.find(team => teamName === team.teamNumber);
        if (team === undefined) {
            throw new Error(`Team ${teamName} does not exist but was designated as by special request only`);
        }
        specialRequestTeams.add(team);
    }
    return specialRequestTeams;
}

function createEmptyMaps() {
    const byGender = new Map<Gender, number>();
    const byGenderDobRange = new Map<Gender, Map<NullableDate, number>>();
    const dobByGender = new Map<Gender, Array<NullableDate>>();

    for (let item in Gender) {
        if (isNaN(Number(item))) {
            const gender = Gender[item] as any as Gender;
            byGender.set(gender, 0);
            byGenderDobRange.set(gender, new Map([[null, 0]]));
            dobByGender.set(gender, []);
        }
    }

    return { byGender, byGenderDobRange, dobByGender };
}