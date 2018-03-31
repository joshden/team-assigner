import { Child } from "./Child";
import { Team } from "./Team";
import { RuleBuilder } from "./AssignmentRule";
import moment from 'moment';

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
    constructor(private readonly check: (child: Child, eventDate: Date) => boolean) {
    }

    isApplicable(child: Child, eventDate: Date) {
        return this.check(child, eventDate);
    }
}

export function notes(notes: string) {
    return new FindCriteria(child => child.notes.indexOf(notes) >= 0);
}

export function child(firstName: string, lastName: string) {
    return new FindCriteria(child => child.firstName === firstName && child.lastName === lastName);
}

export function ageAtLeast(age: number) {
    return new FindCriteria((child, eventDate) => !!child.dateOfBirth && moment(eventDate).diff(moment(child.dateOfBirth), 'years', true) >= age);
}

export function ageLessThan(age: number) {
    return new FindCriteria((child, eventDate) => !!child.dateOfBirth && moment(eventDate).diff(moment(child.dateOfBirth), 'years', true) < age);
}

export const unknownAge = new FindCriteria(child => !child.dateOfBirth);

export function parent(firstName: string, lastName: string) {
    return new FindCriteria(child => child.parents.names.some(name => name.firstName === firstName && name.lastName === lastName));
}

export function matchAll(...criteria: FindCriteria[]) {
    return new FindCriteria((child, eventDate) => criteria.every(criteria => criteria.isApplicable(child, eventDate)));
}

export function matchAny(...criteria: FindCriteria[]) {
    return new FindCriteria((child, eventDate) => criteria.some(criteria => criteria.isApplicable(child, eventDate)));
}

export function notMatch(criterion: FindCriteria) {
    return new FindCriteria((child, eventDate) => ! criterion.isApplicable(child, eventDate));
}


