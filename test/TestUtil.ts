import { BaseChild, Child, ChildWithRules } from "../src/Child";
import Parents from "../src/Parents";
import { withChild, AssignmentRule, RuleBuilder } from "../src/AssignmentRule";
import { Team } from "../src/Team";

let nameSequence = 0;

export function createChild(params: {parents?: Parents, dob?: Date, notes?: string, firstName?: string, lastName?: string} = {}) {
    if (! params.parents) {
        params.parents = new Parents();
    }
    if (! params.dob) {
        params.dob = new Date();
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
    return new BaseChild(params.parents, params.notes, params.firstName, params.lastName, params.dob);
}

export function withChildObj(child: Child) {
    return withChild(child.firstName, child.lastName);
}

export function childWithRules(child: Child, rule: RuleBuilder, teams: Team[], allChildren: Child[]) {
    return new ChildWithRules(child, rule.getRule(child, teams, allChildren.filter(c => c !== child)));
}