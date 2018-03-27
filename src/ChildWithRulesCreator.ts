import { Child, ChildWithRules } from "./Child";
import { AssignmentRuleMapping } from "./AssignmentRuleMapping";
import { Team } from "./Team";
import { AssignmentRule, RuleBuilder, all } from "./AssignmentRule";

export default function getChildWithRules(child: Child, assignmentRuleMappings: AssignmentRuleMapping[], otherChildren: Child[], assignableTeams: Team[]) {
    // const assignmentRules: AssignmentRule[] = [];
    // const childrenInvolvedInRules: Child[] = [];

    // let remainingNotes = child.notes;
    // let foundMatch = true;

    // while (foundMatch && remainingNotes.trim().length > 0) {
    //     foundMatch = false;
    //     for (const mapping of assignmentRuleMappings) {
    //         if (mapping.appliesTo(child, remainingNotes)) {
    //             foundMatch = true;
    //             remainingNotes = mapping.addRules(assignmentRules, remainingNotes, otherChildren, assignableTeams, childrenInvolvedInRules);
    //             break;
    //         }
    //     }
    // }

    // child.findSiblings(otherChildren)
        // .filter(sibling => ! childrenInvolvedInRules.includes(sibling))
        // .forEach(sibling => assignmentRules.push(AssignmentRule.withChild(sibling)));

    // const compositeRule = assignmentRules.length === 1 ? assignmentRules[0] : AssignmentRule.and(assignmentRules);

    const rules: RuleBuilder[] = [];
    for (const mapping of assignmentRuleMappings) {
        if (mapping.findCriteria.isApplicable(child)) {
            rules.push(mapping.rule);
        }
    }
    const compositeRule = rules.length === 1 ? rules[0] : all(...rules);

    return new ChildWithRules(child, compositeRule.getRule(child, assignableTeams, otherChildren));
}