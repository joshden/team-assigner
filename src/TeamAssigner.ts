import { Team, AssignedTeam, IdealForTeam } from "./Team";
import { Child, ChildWithRules } from "./Child";
import { AssignmentRule } from "./AssignmentRule";
import { AssignmentRuleMapping } from "./AssignmentRuleMapping";
import AssignmentGroup from "./AssignmentGroup";
import getChildWithRules from './ChildWithRulesCreator';
import IdealTeamStats from "./IdealTeamStats";
import Logger from "./Logger";
import createAssignmentGroups from "./ChildGrouper";
import { createIdealsForTeams } from "./TeamIdealCreator";
import assignGroupstoTeams from "./GroupToTeamAssigner";
import assignGroupsToTeams from "./GroupToTeamAssigner";

export default class TeamAssigner {
    assignTeams(children: Child[], assignableTeams: Team[], teamsBySpecialRequestOnly: Set<string>, assignmentRuleMappings: AssignmentRuleMapping[], eventDate: Date, logger: Logger) {
        const childrenWithRules = this.getChildrenWithRules(children, assignableTeams, assignmentRuleMappings, eventDate, logger);
        const idealsForTeams = this.getIdealTeamStats(assignableTeams, teamsBySpecialRequestOnly, childrenWithRules);
        const groupsWithChildren = this.assignChildrenToGroups(childrenWithRules);
        const teamsWithChildren = assignGroupsToTeams(groupsWithChildren, idealsForTeams);
        return teamsWithChildren;
    }

    private getIdealTeamStats(assignableTeams: Team[], teamsBySpecialRequestOnly: Set<string>, children: ChildWithRules[]) {
        return createIdealsForTeams(assignableTeams, teamsBySpecialRequestOnly, children);
    }

    private getChildrenWithRules(children: Child[], assignableTeams: Team[], assignmentRuleMappings: AssignmentRuleMapping[], eventDate: Date, logger: Logger) {
        return children.map(child => {
            const otherChildren = children.filter(c => c !== child);
            return getChildWithRules(child, assignmentRuleMappings, otherChildren, assignableTeams, eventDate, logger)
        });
    }

    private assignChildrenToGroups(children: ChildWithRules[]) {
        return createAssignmentGroups(children);
    }
}