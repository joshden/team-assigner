import { Team, AssignedTeam } from "./Team";
import { Child, ChildWithRules } from "./Child";
import { AssignmentRule } from "./AssignmentRule";
import { AssignmentRuleMapping } from "./AssignmentRuleMapping";
import AssignmentGroup from "./AssignmentGroup";
import getChildWithRules from './ChildWithRulesCreator';
import IdealTeamStats from "./IdealTeamStats";

export default class TeamAssigner {
    assignTeams(children: Child[], assignableTeams: Team[], assignmentRuleMappings: AssignmentRuleMapping[], eventDate: Date) {
        const idealTeamStats = this.getIdealTeamStats(assignableTeams, children);
        const childrenWithRules = this.getChildrenWithRules(children, assignableTeams, assignmentRuleMappings, eventDate);
        const groupsWithChildren = this.assignChildrenToGroups(childrenWithRules);
        const teamsWithChildren = this.assignGroupsToTeams(groupsWithChildren, assignableTeams, idealTeamStats);
        return teamsWithChildren;
    }

    private getIdealTeamStats(assignableTeams: Team[], children: Child[]) {
        return new IdealTeamStats;
    }

    private getChildrenWithRules(children: Child[], assignableTeams: Team[], assignmentRuleMappings: AssignmentRuleMapping[], eventDate: Date) {
        return children.map(child => {
            const otherChildren = children.filter(c => c !== child);
            return getChildWithRules(child, assignmentRuleMappings, otherChildren, assignableTeams, eventDate)
        });
    }

    private assignChildrenToGroups(children: ChildWithRules[]) {
        return [] as AssignmentGroup[];
    }

    private assignGroupsToTeams(assignmentGroups: AssignmentGroup[], assignableTeams: Team[], idealTeamStats: IdealTeamStats) {
        // take into account groups that should not be with each other
        return [] as AssignedTeam[];
    }
}