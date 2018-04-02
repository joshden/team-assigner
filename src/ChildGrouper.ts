import { ChildWithRules } from "./Child";
import AssignmentGroup from "./AssignmentGroup";

export default function createAssignmentGroups(children: ChildWithRules[]) {
    const groups : AssignmentGroup[] = [];
    for (const child of children) {
        const matchToUse = child.assignmentRule.potentialMatches[0];
        let [group] = groups.filter(group => group.hasChild(child));
        if (! group) {
            group = addChildToGroup(new AssignmentGroup(), child);
            groups.push(group);
        }
        children
            .filter(potentialGroupChild => ! group.hasChild(potentialGroupChild))
            .filter(potentialGroupChild => { 
                return matchToUse && matchToUse.teammates !== undefined && matchToUse.teammates.includes(potentialGroupChild.child);
            })
            .forEach(groupChild => addChildToGroup(group, groupChild));
    }

    const mergedGroups = getMergedGroups(groups);

    for (const group of mergedGroups) {
        group.verifyNoContradictions();
    }

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
                            .forEach(child => addChildToGroup(group1, child));
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

function addChildToGroup(group: AssignmentGroup, child: ChildWithRules) {
    return group.addChild(child, child.assignmentRule.potentialMatches[0]);
}