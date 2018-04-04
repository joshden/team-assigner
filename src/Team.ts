import {Child, ChildOnTeam, Gender} from "./Child";
import Teacher from "./Teacher";

export class Team {
    constructor(
        readonly teamNumber: string, 
        readonly teachers: Teacher[]
    ) { }
}

export class IdealForTeam {
    constructor(
        readonly team: Team,
        readonly minChildren: number,
        readonly maxChildren: number,
        readonly byGender: Map<Gender, number>,
        readonly byGenderDobRange: Map<Gender, Map<Date|null, number>>,
        readonly isSpecialRequestTeam: boolean
    ) {}
}

export class AssignedTeam {
    readonly children: ChildOnTeam[];

    constructor(
        readonly team: Team,
        children: Child[]
    ) {
        this.children = children.map(child => new ChildOnTeam(child, this.team))
    }
}