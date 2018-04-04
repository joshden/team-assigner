import { Team, IdealForTeam } from "./Team";
import { ChildWithRules, Gender } from "./Child";

export function createIdealsForTeams(assignableTeams: Team[], teamsBySpecialRequestOnly: Set<string>, allChildren: ChildWithRules[], maxGenderDobRangeCount = 3) {
    const specialRequestTeams = getSpecialRequestTeams(assignableTeams, teamsBySpecialRequestOnly);
    const nonSpecialTeamCount = assignableTeams.length - teamsBySpecialRequestOnly.size;
    const children = allChildren.filter(child => ! child.assignmentRule.potentialMatches[0] || ! specialRequestTeams.has(child.assignmentRule.potentialMatches[0].team as Team));
    const childrenPerTeam = children.length / nonSpecialTeamCount;
    const minChildrenPerTeam = Math.floor(childrenPerTeam);
    const maxChildrenPerTeam = Math.ceil(childrenPerTeam);

    const byGender = new Map<Gender, number>();
    const dobByGender = new Map<Gender, Array<Date | null>>();
    const byGenderDobRange = new Map<Gender, Map<Date | null, number>>();
    
    children.forEach(child => {
        const gender = child.gender;
        if (!byGender.has(gender)) {
            byGender.set(gender, 0);
            dobByGender.set(gender, []);
            byGenderDobRange.set(gender, new Map());
        }
        byGender.set(gender, byGender.get(gender) as number + 1);
        (dobByGender.get(gender) as Array<Date | null>).push(child.dateOfBirth);
    });

    for (const genderCount of Array.from(byGender.entries())) {
        byGender.set(genderCount[0], genderCount[1] / nonSpecialTeamCount);
    }

    for (const entry of Array.from(dobByGender.entries())) {
        const [gender, allDobs] = entry;
        const dobRangeCounts = (byGenderDobRange.get(gender) as Map<Date | null, number>)
        const dobs = allDobs.filter(dob => dob !== null) as Date[];
        const rangeDates: Date[] = [];
        dobs.sort((a, b) => a.getTime() - b.getTime());
        if (dobs.length > 0) {
            const oldest = dobs[0].getTime();
            const youngest = dobs[dobs.length - 1].getTime();
            const sizeOfEachRange = (youngest - oldest) / maxGenderDobRangeCount;
            for (let range = 1; range <= maxGenderDobRangeCount; range++) {
                rangeDates.push(new Date(oldest + sizeOfEachRange * range));
            }
        }
        rangeDates.forEach(date => {
            dobRangeCounts.set(date, 0);
        });
        dobs.forEach(dob => {
            for (const rangeDate of rangeDates) {
                if (dob <= rangeDate) {
                    dobRangeCounts.set(rangeDate, dobRangeCounts.get(rangeDate) as number + 1);
                    break;
                }
            }
        });
        for (const rangeDate of rangeDates) {
            dobRangeCounts.set(rangeDate, dobRangeCounts.get(rangeDate) as number / nonSpecialTeamCount);
        }
        const nullDobCount = allDobs.length - dobs.length;
        if (nullDobCount > 0) {
            dobRangeCounts.set(null, nullDobCount / nonSpecialTeamCount);
        }
    }

    return assignableTeams.map(team => {
        const isSpecialRequestteam = specialRequestTeams.has(team);
        return new IdealForTeam(
            team,
            isSpecialRequestteam ? 0 : minChildrenPerTeam,
            isSpecialRequestteam ? 0 : maxChildrenPerTeam,
            isSpecialRequestteam ? new Map() : byGender,
            isSpecialRequestteam ? new Map() : byGenderDobRange,
            isSpecialRequestteam)
    });
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