import { BaseChild, Child, ChildWithRules, Gender } from "../src/Child";
import Parents from "../src/Parents";
import { withChild, AssignmentRule, RuleBuilder } from "../src/AssignmentRule";
import { Team } from "../src/Team";
import Teacher from "../src/Teacher";

let nameSequence = 0;

export type SparseChild = {
    parents?: Parents, 
    dob?: Date|null, 
    notes?: string, 
    firstName?: string, 
    lastName?: string,
    gender?: Gender
};

export function createChild(params: SparseChild = {}) {
    if (! params.parents) {
        params.parents = new Parents();
    }
    if (! params.dob) {
        params.dob = null;
    }
    if (! params.notes) {
        params.notes = '';
    }
    if (! params.firstName) {
        params.firstName = 'F' + (++nameSequence).toString();
    }
    if (! params.lastName) {
        params.lastName = 'L' + (++nameSequence).toString();
    }
    return new BaseChild(params.parents, params.notes, params.firstName, params.lastName, params.dob, params.gender);
}

export function genderDobChild(gender = Gender.Unknown, dob: string|null = null) {
   return createChild({gender: gender, dob: dob === null ? null : new Date(dob)});
}

export function withChildObj(child: Child) {
    return withChild(child.firstName, child.lastName);
}

export function childWithRules(child: Child, rule: RuleBuilder, teams: Team[], allChildren: Child[]) {
    return new ChildWithRules(child, rule.getRule(child, teams, allChildren.filter(c => c !== child)));
}

let i = 0;
export function createTeam(teamName = 'T'+(++i), ...teachers: Teacher[]) {
    return new Team(teamName, teachers);
}

export function dateNumbers(...values: [string|null, number][]) {
    return new Map(values.map(value => {
        const dateStr = value[0];
        return [dateStr  === null ? null : new Date(dateStr), value[1]] as [Date|null, number]
    }));
}