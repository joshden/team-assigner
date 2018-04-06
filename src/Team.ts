import {Child, ChildOnTeam, Gender} from "./Child";
import Teacher from "./Teacher";
import AssignmentGroup from "./AssignmentGroup";

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

    constructor(private readonly idealForTeam: IdealForTeam) {
        const genders = Array.from(idealForTeam.byGender.keys());
        this.byGender = new Map(genders.map(g => [g, 0] as [Gender, number]));
        this.byGenderDobRange = new Map(genders.map(gender => 
            [
                gender, 
                new Map(Array.from((idealForTeam.byGenderDobRange.get(gender) as DateRangeCounts).keys()).map(d => [d, 0] as [Date|null, number]))
            ] as [Gender, DateRangeCounts]
        ));
    }

    getScore(group: AssignmentGroup): TeamScore {
        const oldSize = this.children.length;
        const sizeIncrease = group.childCount;
        const newSize = oldSize + sizeIncrease;
        const minSize = this.idealForTeam.minChildren;
        const maxSize = this.idealForTeam.maxChildren;

        let score = 0;

        if (newSize > maxSize) {
            score -= 10;
        }
        else if (newSize > minSize) {
            score -= 2;
        }
        else {
            score += (minSize - newSize);
        }

        // for each gender
        //  if new count is greater than expected, reduce score by the amount it is greater
        //  if new count is less than expected, increase score by the amount this helped

        return {
            isOverMax: newSize > maxSize,
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

    addGroup(group: AssignmentGroup) {
        this.assignmentGroup.mergeGroups(group);
        for (const child of group.children) {
            this.children.push(new ChildOnTeam(child, this.idealForTeam.team));
            const gender = child.gender;
            const dob = child.dateOfBirth;
            // TODO need to handle if we don't have this gender in the map yet.
            this.byGender.set(gender, (this.byGender.get(gender) as number) + 1);
            const dobRangeCounts = (this.byGenderDobRange.get(gender) as DateRangeCounts);
            if (! dobRangeCounts) {
                console.log('gender', gender);
                console.log('byGenderDobRange', this.byGenderDobRange);
            }
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


    // constructor(
    //     readonly team: Team,
    //     children: Child[]
    // ) {
    //     this.children = children.map(child => new ChildOnTeam(child, this.team))
    // }
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