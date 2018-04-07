import {Child, ChildOnTeam, Gender} from "./Child";
import Teacher from "./Teacher";
import AssignmentGroup from "./AssignmentGroup";
import { getDobRangeCounts, NullableDate } from "./TeamIdealCreator";

export class Team {
    constructor(
        readonly teamNumber: string, 
        readonly teachers: Teacher[]
    ) { }
}

export type GenderCounts = Map<Gender, number>;
export type DateRangeCounts = Map<Date|null, number>;

export class IdealForTeam {
    constructor(
        readonly team: Team,
        readonly minChildren: number,
        readonly maxChildren: number,
        readonly byGender: GenderCounts,
        readonly byGenderDobRange: Map<Gender, DateRangeCounts>,
        readonly isSpecialRequestTeam: boolean
    ) {}
}

export class AssignedTeam {
    readonly children: ChildOnTeam[] = [];
    private readonly assignmentGroup = new AssignmentGroup;
    private readonly byGender: GenderCounts;
    private readonly byGenderDobRange: Map<Gender, DateRangeCounts>;

    get team() {
        return this.idealForTeam.team;
    }

    get info() {
        return {
            team: this.idealForTeam.team,
            children: this.children.map(c => ({firstName: c.firstName, lastName: c.lastName}))
        }
    }

    get isSpecialRequestTeam() {
        return this.idealForTeam.isSpecialRequestTeam;
    }

    constructor(private readonly idealForTeam: IdealForTeam) {
        // console.log(idealForTeam.byGenderDobRange);
        const genders = Array.from(idealForTeam.byGender.keys());
        this.byGender = new Map(genders.map(g => [g, 0] as [Gender, number]));
        this.byGenderDobRange = new Map(genders.map(gender => 
            [
                gender, 
                new Map(Array.from((idealForTeam.byGenderDobRange.get(gender) as DateRangeCounts).keys()).map(d => [d, 0] as [NullableDate, number]))
            ] as [Gender, DateRangeCounts]
        ));
    }

    getScore(group: AssignmentGroup): TeamScore {
        let score = 0;

        const currentSize = this.children.length;
        const targetSize = this.idealForTeam.minChildren;
        const increaseInSize = group.childCount;
        score = this.adjustScore(score, currentSize, targetSize, increaseInSize, 1.0);

        for (const gender of Array.from(this.idealForTeam.byGender.keys())) {
            const targetSizesByDobRange = this.idealForTeam.byGenderDobRange.get(gender) as Map<NullableDate, number>;
            const dobRanges = Array.from(targetSizesByDobRange.keys());
            const currentSizesByDobRange = this.byGenderDobRange.get(gender) as Map<NullableDate, number>;
            const newGenderDobs = group.children.filter(child => child.gender === gender).map(child => child.dateOfBirth);
            const increaseInSizesByDobRange = getDobRangeCounts(dobRanges, newGenderDobs);

            const currentGenderSize = this.byGender.get(gender) as number;
            const targetGenderSize = this.idealForTeam.byGender.get(gender) as number;
            const increaseInGenderSize = newGenderDobs.length;
            score = this.adjustScore(score, currentGenderSize, targetGenderSize, increaseInGenderSize, 0.7);

            for (const rangeDate of dobRanges) {
                const currentRangeSize = currentSizesByDobRange.get(rangeDate) as number;
                const targetRangeSize = targetSizesByDobRange.get(rangeDate) as number;
                const increaseInRangeSize = increaseInSizesByDobRange.get(rangeDate) as number;
                score = this.adjustScore(score, currentRangeSize, targetRangeSize, increaseInRangeSize, 0.3);
            }
        }

        return {
            isOverMax: currentSize + increaseInSize > this.idealForTeam.maxChildren,
            desirability: this.getDesirability(group),
            score: score
        };
    }

    private getDesirability(group: AssignmentGroup) {
        const requiredTeam = group.requiredTeam;
        if (requiredTeam) {
            if (requiredTeam === this.idealForTeam.team) {
                return Desirability.Required;
            }
            return this.idealForTeam.isSpecialRequestTeam ? Desirability.Disallowed : Desirability.OtherTeam;
        }
        if (! this.assignmentGroup.isMergeAllowed(group)) {
            return Desirability.Disallowed;
        }
        return Desirability.Allowed;
    }

    private adjustScore(score: number, currentSize: number, targetSize: number, increaseInSize: number, scalingFactor: number) {
        const currentSizeHeadroom = targetSize - currentSize;
        const newSize = currentSize + increaseInSize;

        if (newSize > targetSize) {
            if (currentSizeHeadroom > 0) {
                score -= (increaseInSize - currentSizeHeadroom) * scalingFactor;
            }
            else {
                score -= increaseInSize * scalingFactor;
            }
        }
        else {
            score += increaseInSize * scalingFactor;
        }

        return score;
    }

    addGroup(group: AssignmentGroup) {
        this.assignmentGroup.mergeGroups(group);
        for (const child of group.children) {
            this.children.push(new ChildOnTeam(child, this.idealForTeam.team));
            const gender = child.gender;
            const dob = child.dateOfBirth;
            this.byGender.set(gender, (this.byGender.get(gender) as number) + 1);
            const dobRangeCounts = (this.byGenderDobRange.get(gender) as DateRangeCounts);
            if (dob === null) {
                dobRangeCounts.set(null, (dobRangeCounts.get(null) as number) + 1);
            }
            else {
                for (const rangeDate of (Array.from(dobRangeCounts.keys()).filter(d => d !== null) as Date[])) {
                    if (dob <= rangeDate) {
                        dobRangeCounts.set(rangeDate, dobRangeCounts.get(rangeDate) as number + 1);
                        break;
                    }
                }
            }
        }
    }

    getCompositionReport() {
        const currentSize = this.children.length;
        const targetSize = this.idealForTeam.minChildren;
        const sizeVariance = Math.abs(currentSize - targetSize);

        let [genderVariance, genderDobRangeVariance] = [0, 0];

        const genders = Array.from(this.idealForTeam.byGender.keys());
        for (const gender of genders) {
            const targetSizesByDobRange = this.idealForTeam.byGenderDobRange.get(gender) as Map<NullableDate, number>;
            const dobRanges = Array.from(targetSizesByDobRange.keys());
            const currentSizesByDobRange = this.byGenderDobRange.get(gender) as Map<NullableDate, number>;

            const currentGenderSize = this.byGender.get(gender) as number;
            const targetGenderSize = this.idealForTeam.byGender.get(gender) as number;
            genderVariance += Math.abs(currentGenderSize - targetGenderSize);

            for (const rangeDate of dobRanges) {
                const currentRangeSize = currentSizesByDobRange.get(rangeDate) as number;
                const targetRangeSize = targetSizesByDobRange.get(rangeDate) as number;
                genderDobRangeVariance += Math.abs(currentRangeSize - targetRangeSize);
            }
        }

        return {
            weightedVariance: Math.round((sizeVariance + genderVariance * 0.7 + genderDobRangeVariance * 0.3) * 100) / 100,
            sizeVariance,
            genderVariance: Math.round(genderVariance / genders.length * 100) / 100,
            genderDobRangeVariance: Math.round(genderVariance / (genders.length * 4) * 100) / 100,
        };
    }
}

export enum Desirability {
    Disallowed,
    OtherTeam,
    Allowed,
    Required,
}

export interface TeamScore {
    isOverMax: boolean,
    desirability: Desirability,
    score: number
}