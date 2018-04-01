import { ChildWithRules } from "./Child";
import AssignmentGroup from "./AssignmentGroup";

export default function createAssignmentGroups(children: ChildWithRules[]) {
    const groups : AssignmentGroup[] = [];
    for (const child of children) {
        let [group] = groups.filter(group => group.hasChild(child));
        if (! group) {
            group = new AssignmentGroup().addChild(child);
            groups.push(group);
        }
        children
            .filter(potentialGroupChild => ! group.hasChild(potentialGroupChild))
            .filter(potentialGroupChild => child.assignmentRule.potentialMatches.some(potentialMatch => potentialMatch.teammates !== undefined && potentialMatch.teammates.includes(potentialGroupChild.child)))
            .forEach(groupChild => group.addChild(groupChild));
    }

    const mergedGroups = getMergedGroups(groups);
    // find contradictions (children that ended up in the same group in spite of a child saying that another child shouldNotHaveInGroup)

    // siblings:
    // otherChildren
    //     .filter(otherChild => otherChild.parents === child.parents)
    //     .forEach(otherChild => rules.push(withChildObj(otherChild)));

    return mergedGroups;
}

function getMergedGroups(groups: AssignmentGroup[]) {
    let groupToRemove: AssignmentGroup | null;

    do {
        groupToRemove = null;
        loop1: for (const group1 of groups) {
            for (const group2 of groups) {
                if (group1 !== group2) {
                    const hasCommonChildren = group1.children.some(child => group2.children.includes(child));
                    if (hasCommonChildren) {
                        group2.children
                            .filter(child => ! group1.hasChild(child))
                            .forEach(child => group1.addChild(child));
                        groupToRemove = group2;
                        break loop1;
                    }
                }
            }
        }
        if (groupToRemove) {
            groups = groups.filter(group => group !== groupToRemove);
        }
    } while (groupToRemove);

    return groups;
}