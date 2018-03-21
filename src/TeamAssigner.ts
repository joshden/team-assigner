import Team from "./Team";
import Child from "./Child";
import AssignmentRule from "./AssignmentRule";
import AssignmentRuleMapping from "./AssignmentRuleMapping";
import AssignmentGroup from "./AssignmentGroup";
import createAssignmentRules from './AssignmentRuleCreator';

export default class TeamAssigner {
    assignTeams(children: Child[], assignableTeams: Team[], assignmentRuleMappings: AssignmentRuleMapping[]) {
        this.setIdealTeamStats(assignableTeams, children);
        this.addAssignmentRulesToChildren(children, assignableTeams, assignmentRuleMappings);
        this.assignChildrenToTeams(children, assignableTeams);

        const groups = this.groupChildren(children);
        this.assignGroupsToTeams(groups, assignableTeams);
    }

    private setIdealTeamStats(assignableTeams: Team[], children: Child[]) {

    }

    private addAssignmentRulesToChildren(children: Child[], assignableTeams: Team[], assignmentRuleMappings : AssignmentRuleMapping[]) {
        children.forEach(child => {
            child.assignmentRules = createAssignmentRules(child, assignmentRuleMappings, children.filter(c => c !== child), assignableTeams);
        });
    }

    private assignChildrenToTeams(children: Child[], assignableTeams: Team[]) {

    }

    private groupChildren(children: Child[]): AssignmentGroup[] {
        const groups : AssignmentGroup[] = [];
        for (const child of children) {
            let group = groups.find(group => group.hasChild(child));
            if (! group) {
                group = new AssignmentGroup().addChild(child);
                groups.push(group);
            }
            children
                .filter(potentialGroupChild => ! group.hasChild(potentialGroupChild))
                .filter(potentialGroupChild => child.shouldHaveInGroup(potentialGroupChild))
                .forEach(groupChild => group.addChild(groupChild));
        }
        // merge the groups down by consolidating groups with children that are also in other groups
        // find contradictions (children that ended up in the same group in spite of a child saying that another child shouldNotHaveInGroup)
        return groups;
    }

    private assignGroupsToTeams(groups: AssignmentGroup[], assignableTeams: Team[]) {
        // take into account groups that should not be with each other
    }
}