import Child from "./Child";
import Team from "./Team";

export default class AssignmentRule {
    
    static withChild(withChild: Child) {
        return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
            return otherChildren.includes(withChild);
        });
    }

    static and(rules: AssignmentRule[]) {
        return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
            return rules.every(rule => rule.isRuleMet(child, otherChildren, team));
        });
    }

    static or(rules: AssignmentRule[]) {
        return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
            return rules.some(rule => rule.isRuleMet(child, otherChildren, team));
        });
    }

    static not(rule: AssignmentRule) {
        return new AssignmentRule((child: Child, otherChildren: Child[], team: Team) => {
            return ! rule.isRuleMet(child, otherChildren, team);
        });
    }

    constructor(private readonly checkIfMet: (child: Child, otherChildren: Child[], team: Team) => boolean) { }

    isRuleMet(child: Child, otherChildren: Child[], team: Team) {
        return this.checkIfMet(child, otherChildren, team);
    }
}