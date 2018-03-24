import { Child } from "./Child";
import AssignmentRule from "./AssignmentRule";
import { Team } from "./Team";

export class AssignmentRuleMapping {
    constructor(findCriteria: FindCriteria, rule: RuleBuilder) {

    }

    appliesTo(child: Child, remainingNotes: string): boolean {
        return false;
        // throw new Error("Method not implemented.");
    }

    addRules(assignmentRules: AssignmentRule[], remainingNotes: string, otherChildren: Child[], assignableTeams: Team[], childrenInvolvedInRules: Child[]): string {
        throw new Error("Method not implemented.");
    }

    getApplicableRules(child: Child, teams: Team[], otherChildren: Child[]) {
        const assignmentRules: AssignmentRule[] = [];
        return assignmentRules;
    }
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


abstract class RuleBuilder {
    potentialMatches: PotentialRuleMatch[] = [];
    // mismatches: PotentialRuleMatch[] = [];

    // notAllowedTeams: Team[] = [];
    // notAllowedTeammates: Child[] = [];
    
    abstract populateRule(child: Child, teams: Team[], otherChildren: Child[]);
}

class PotentialRuleMatch {
    team?: Team;
    teammates?: Child[];
    notTeams?: Team[];
    notTeammates?: Child[];
}

class Rule {
    // potentialMatches: PotentialRuleMatch[] = [];
    // notAllowedTeams: Team[] = [];
    // notAllowedTeammates: Child[] = [];
}

export function taughtBy(firstName, lastName) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            const matchingTeams = teams.filter(team => team.teachers.some(t => t.firstName === firstName && t.lastName === lastName));
            // TODO verify exactly one matching team was found
            this.potentialMatches.push({team: matchingTeams[0]});
        }
    }();
}

export function withChild(firstName, lastName) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            const matchingChildren = otherChildren.filter(c => c.firstName === firstName && c.lastName === lastName);
            // TODO verify exactly one matching team was found
            this.potentialMatches.push({teammates: [matchingChildren[0]]});
        }
    }();
}

export function withChildrenOf(firstName, lastName) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            throw new Error('Not implemented');
        }
    }();
}

export function withFamily(lastName) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            throw new Error('Not implemented');
        }
    }();
}

export function not(rule: RuleBuilder) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            rule.populateRule(child, teams, otherChildren);
            // this.mismatches = rule.potentialMatches;
            // this.potentialMatches = rule.mismatches;
            throw new Error('Not implemented');
        }
    }();
}

export function any(...rules: RuleBuilder[]) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            rules.forEach(rule => {
                rule.populateRule(child, teams, otherChildren);
                this.potentialMatches.push(...rule.potentialMatches);
            });
        }
    }();
}

export function all(...rules: RuleBuilder[]) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            rules.forEach(rule => {
                rule.populateRule(child, teams, otherChildren);
            });
            this.rescursivelyPopulate(0, []);
        }

        private rescursivelyPopulate(index: number, teammatesFromOtherRules: Child[]) {
            if (index < rules.length) {
                const rule = rules[index];
                rule.potentialMatches.forEach(potentialMatch => {
                    if (potentialMatch.teammates) {
                        teammatesFromOtherRules.push(...potentialMatch.teammates.filter(child => ! teammatesFromOtherRules.includes(child)));
                    }
                    this.rescursivelyPopulate(index+1, Array.from(teammatesFromOtherRules));
                });
            }
            else {
                this.potentialMatches.push({teammates: teammatesFromOtherRules});
            }
        }
    }();
}