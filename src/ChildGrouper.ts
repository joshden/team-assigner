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
            // TODO replace this with actually looking at the rules
            // .filter(potentialGroupChild => child.shouldHaveInGroup(potentialGroupChild))
            .forEach(groupChild => group.addChild(groupChild));
    }
    // merge the groups down by consolidating groups with children that are also in other groups
    // find contradictions (children that ended up in the same group in spite of a child saying that another child shouldNotHaveInGroup)
    return groups;
}