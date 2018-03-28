import {Child, ChildOnTeam} from "./Child";
import Teacher from "./Teacher";

export class Team {
    constructor(
        readonly teamNumber: string, 
        readonly teachers: Teacher[]
    ) { }
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