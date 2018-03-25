import { Child } from "./Child";
import { Team } from "./Team";
import { RuleBuilder } from "./AssignmentRule";

export class AssignmentRuleMapping {
    constructor(
        readonly findCriteria: FindCriteria, 
        readonly rule: RuleBuilder
    ) { }
}

export function mapping(findCriteria: FindCriteria, rule: RuleBuilder) {
    return new AssignmentRuleMapping(findCriteria, rule);
}

class FindCriteria {
    constructor(private readonly check: (child: Child) => boolean) {
    }

    isApplicable(child: Child) {
        return this.check(child);
    }
}

export function notes(notes: string) {
    return new FindCriteria(child => child.notes.indexOf(notes) >= 0);
}

export function child(firstName: string, lastName: string) {
    return new FindCriteria(child => child.firstName === firstName && child.lastName === lastName);
}

export function parent(firstName: string, lastName: string) {
    return new FindCriteria(child => child.parents.names.some(name => name.firstName === firstName && name.lastName === lastName));
}

export function matchAll(...criteria: FindCriteria[]) {
    return new FindCriteria(child => criteria.every(criteria => criteria.isApplicable(child)));
}

export function matchAny(...criteria: FindCriteria[]) {
    return new FindCriteria(child => criteria.some(criteria => criteria.isApplicable(child)));
}

export function notMatch(criterion: FindCriteria) {
    return new FindCriteria(child => ! criterion.isApplicable(child));
}


