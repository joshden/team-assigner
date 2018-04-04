import { ChildWithRules } from "./Child";
import AssignmentGroup from "./AssignmentGroup";

export default function createAssignmentGroups(children: ChildWithRules[]) {
    const groups : AssignmentGroup[] = [];
    for (const child of children) {
        const matchToUse = child.matchToUse;

        if (matchToUse && matchToUse.team) {
            groups
                .filter(group => 
                    ! group.hasChild(child)
                    && group.rules.map(r => r.team).filter(t => t !== undefined).includes(matchToUse.team))
                .forEach(g => addChildToGroup(g, child));
        }

        let [group] = groups.filter(group => group.hasChild(child));
        if (! group) {
            group = addChildToGroup(new AssignmentGroup(), child);
            groups.push(group);
        }

        children
            .filter(potentialGroupChild => ! group.hasChild(potentialGroupChild))
            .filter(potentialGroupChild => {
                const isRequestedTeammate = matchToUse && matchToUse.teammates !== undefined && matchToUse.teammates.includes(potentialGroupChild.child);
                return isRequestedTeammate;
            })
            .forEach(groupChild => addChildToGroup(group, groupChild));
    }

    const mergedGroups = getMergedGroups(groups);

    for (const group of mergedGroups) {
        group.verifyNoContradictions();
    }

    return mergeNonContradictingGroupsWithSiblings(mergedGroups, children);
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
    return group.addChild(child, child.matchToUse);
}

function mergeNonContradictingGroupsWithSiblings(groups: AssignmentGroup[], children: ChildWithRules[]) {
    const mergedGroupsToRemove : AssignmentGroup[] = [];
    for (const child of children) {
        const siblings = children.filter(c => c !== child && c.parents === child.parents);
        if (siblings.length > 0) {
            const group = groups.find(g => g.hasChild(child) && ! mergedGroupsToRemove.includes(g)) as AssignmentGroup;
            for (const sibling of siblings) {
                const siblingGroup = groups.find(g => g.hasChild(sibling) && ! mergedGroupsToRemove.includes(g)) as AssignmentGroup;
                if (siblingGroup !== group) {
                    if (group.isMergeAllowed(siblingGroup)) {
                        group.mergeGroups(siblingGroup);
                        mergedGroupsToRemove.push(siblingGroup);
                    }
                }
            }
        }
    }
    return groups.filter(g => ! mergedGroupsToRemove.includes(g));
}