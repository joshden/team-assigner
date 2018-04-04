import { BaseChild, Child, ChildWithRules, Gender } from "../src/Child";
import Parents from "../src/Parents";
import { withChild, AssignmentRule, RuleBuilder } from "../src/AssignmentRule";
import { Team } from "../src/Team";

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

export function withChildObj(child: Child) {
    return withChild(child.firstName, child.lastName);
}

export function childWithRules(child: Child, rule: RuleBuilder, teams: Team[], allChildren: Child[]) {
    return new ChildWithRules(child, rule.getRule(child, teams, allChildren.filter(c => c !== child)));
}