import { Child, ChildWithRules } from "./Child";
import { AssignmentRuleMapping } from "./AssignmentRuleMapping";
import { Team } from "./Team";
import { AssignmentRule, RuleBuilder, all } from "./AssignmentRule";
import Logger from "./Logger";

export default function getChildWithRules(child: Child, assignmentRuleMappings: AssignmentRuleMapping[], otherChildren: Child[], assignableTeams: Team[], eventDate: Date, logger: Logger) {
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
    let wereChildNotesMatched = false;
    for (const mapping of assignmentRuleMappings) {
        const [isApplicable, wereNotesMatched] = mapping.findCriteria.isApplicable(child, eventDate);
        if (isApplicable) {
            rules.push(mapping.rule);
            wereChildNotesMatched = wereChildNotesMatched || wereNotesMatched;
        }
    }
    const compositeRule = rules.length === 1 ? rules[0] : all(...rules);

    if (child.notes.length > 0 && ! wereChildNotesMatched) {
        logger.warning('No applicable rule mapping was found for child notes', child);
    }

    return new ChildWithRules(child, compositeRule.getRule(child, assignableTeams, otherChildren));
}