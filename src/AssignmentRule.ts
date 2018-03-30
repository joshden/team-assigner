import { Child } from "./Child";
import { Team } from "./Team";
import { deprecate } from "util";

export abstract class RuleBuilder {
    readonly potentialMatches: PotentialRuleMatch[] = [];

    getRule(child: Child, teams: Team[], otherChildren: Child[]) {
        this.populateRule(child, teams, otherChildren);
        return new AssignmentRule(this.potentialMatches);
    }

    abstract populateRule(child: Child, teams: Team[], otherChildren: Child[]): void;
}

abstract class AtomicRuleBuilder extends RuleBuilder {
    private readonly isAtomic = 1;
}

export class AssignmentRule {
    constructor(
        readonly potentialMatches: PotentialRuleMatch[]
    ) {
        for (const potentialMatch of potentialMatches) {
            if (potentialMatch.team && potentialMatch.notTeams && potentialMatch.notTeams.includes(potentialMatch.team)) {
                throw new Error(`Team ${potentialMatch.team.teamNumber} was defined as both required and not allowed`);
            }
            const teammates = potentialMatch.teammates;
            if (teammates !== undefined && potentialMatch.notTeammates && potentialMatch.notTeammates.some(notTeammate => teammates.includes(notTeammate))) {
                throw new Error(`1 or more child was defined as both required and not allowed`);
            }
        }
    }

    isRuleMet(child: Child, otherChildren: Child[], team: Team) {
        return this.potentialMatches.some(potentialMatch => {
            return (! potentialMatch.team || potentialMatch.team === team)
                && (! potentialMatch.teammates || potentialMatch.teammates.every(teammate => otherChildren.includes(teammate)))
                && (! potentialMatch.notTeams || ! potentialMatch.notTeams.includes(team))
                && (! potentialMatch.notTeammates || ! potentialMatch.notTeammates.some(notTeammate => otherChildren.includes(notTeammate)))
        });
    }
}

export class PotentialRuleMatch {
    team?: Team;
    teammates?: Child[];
    notTeams?: Team[];
    notTeammates?: Child[];
}

export function team(teamName: string) {
    return new class extends AtomicRuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            const matchingTeams = teams.filter(team => team.teamNumber === teamName);
            if (matchingTeams.length !== 1) {
                throw new Error(`Looking for 1 team named ${teamName}, but found ${matchingTeams.length}`);
            }
            this.potentialMatches.push({team: matchingTeams[0]});
        }
    }();
}

export function taughtBy(firstName: string, lastName: string) {
    return new class extends AtomicRuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            const matchingTeams = teams.filter(team => team.teachers.some(t => t.firstName === firstName && t.lastName === lastName));
            if (matchingTeams.length !== 1) {
                throw new Error(`Looking for 1 team with teacher ${firstName} ${lastName}, but found ${matchingTeams.length}`);
            }
            this.potentialMatches.push({team: matchingTeams[0]});
        }
    }();
}

export function withChild(firstName: string, lastName: string) {
    return new class extends AtomicRuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            const matchingChildren = otherChildren.filter(other => other.firstName === firstName && other.lastName === lastName);
            if (matchingChildren.length !== 1) {
                throw new Error(`Looking for 1 child with ${firstName} ${lastName}, but found ${matchingChildren.length}`);
            }
            this.potentialMatches.push({teammates: [matchingChildren[0]]});
        }
    }();
}

export function withChildrenOf(firstName: string, lastName: string) {
    return new class extends AtomicRuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            const matchingChildren = otherChildren.filter(other => other.parents.names.some(parent => parent.firstName === firstName && parent.lastName === lastName));
            if (matchingChildren.length < 1) {
                throw new Error(`Found no parents with ${firstName} ${lastName} requested by child`);
            }
            this.potentialMatches.push({teammates: matchingChildren});
        }
    }();
}

export function withFamily_NotImplemented(lastName: string) {
    return new class extends AtomicRuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            throw new Error('Not implemented');
        }
    }();
}

export function not(rule: AtomicRuleBuilder) {
    return new class extends RuleBuilder {
        populateRule(child: Child, teams: Team[], otherChildren: Child[]) {
            rule.populateRule(child, teams, otherChildren);
            rule.potentialMatches.forEach(m => {
                if (m.team) {
                    this.potentialMatches.push({notTeams: [m.team]});
                }
                if (m.teammates) {
                    this.potentialMatches.push({notTeammates: m.teammates});
                }
            });
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
            const rulePotentialMatches = rules.map(rule => {
                rule.populateRule(child, teams, otherChildren);
                return rule.potentialMatches;
            });

            this.recursePermutations(rulePotentialMatches, permutation => {
                const teammates: Child[] = [];
                const notTeammates: Child[] = [];
                const notTeams: Team[] = [];
                let team: Team | undefined;
                for (const ruleMatch of permutation) {
                    if (ruleMatch.teammates) {
                        ruleMatch.teammates.filter(teammate => ! teammates.includes(teammate)).forEach(teammate => teammates.push(teammate));
                    }
                    if (ruleMatch.team) {
                        if (team !== undefined && team !== ruleMatch.team) {
                            throw new Error(`Child ${child.firstName} ${child.lastName} requested to be taught my multiple teachers on different teams`);
                        }
                        team = ruleMatch.team;
                    }
                    if (ruleMatch.notTeammates) {
                        ruleMatch.notTeammates.forEach(notTeammate => notTeammates.push(notTeammate));
                    }
                    if (ruleMatch.notTeams) {
                        ruleMatch.notTeams.forEach(notTeam => notTeams.push(notTeam));
                    }
                }
                if (teammates.length > 0 || team || notTeammates.length > 0 || notTeams.length > 0) {
                    const potentialMatch: PotentialRuleMatch = {};
                    if (teammates.length > 0) {
                        potentialMatch.teammates = teammates;
                    }
                    if (team) {
                        potentialMatch.team = team;
                    }
                    if (notTeammates.length > 0) {
                        potentialMatch.notTeammates = notTeammates;
                    }
                    if (notTeams.length > 0) {
                        potentialMatch.notTeams = notTeams;
                    }
                    this.potentialMatches.push(potentialMatch);
                }
            });
        }

        private recursePermutations<T>(arrOfArrays: T[][], callback: (permutation: T[]) => void, i: number = 0, previousElements: T[] = []) {
            if (i < arrOfArrays.length) {
                const currentElements = arrOfArrays[i];
                for (var element of currentElements) {
                    this.recursePermutations(arrOfArrays, callback, i + 1, previousElements.concat(element));
                }
                if (currentElements.length < 1) {
                    this.recursePermutations(arrOfArrays, callback, i + 1, Array.from(previousElements));
                }
            }
            else if (previousElements.length > 0) {
                callback(previousElements);
            }
        }
    }();
}

// export default class AssignmentRule {
    
//     static withChild(withChild: Child) {
//         return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
//             return otherChildren.includes(withChild);
//         });
//     }

//     static and(rules: AssignmentRule[]) {
//         return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
//             return rules.length === 0 || rules.every(rule => rule.isRuleMet(child, otherChildren, team));
//         });
//     }

//     static or(rules: AssignmentRule[]) {
//         return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
//             return rules.length === 0 || rules.some(rule => rule.isRuleMet(child, otherChildren, team));
//         });
//     }

//     static not(rule: AssignmentRule) {
//         return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
//             return ! rule.isRuleMet(child, otherChildren, team);
//         });
//     }

//     constructor(private readonly checkIfMet: (child: Child, otherChildren: Child[], team: Team) => boolean) { }

//     isRuleMet(child: Child, otherChildren: Child[], team: Team) {
//         return this.checkIfMet(child, otherChildren, team);
//     }
// }