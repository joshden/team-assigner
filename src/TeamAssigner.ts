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
import AgeOnDate from "./AgeOnDate";

export default class TeamAssigner {
    assignTeams(children: Child[], assignableTeams: Team[], teamsBySpecialRequestOnly: Set<string>, assignmentRuleMappings: AssignmentRuleMapping[], ageOnDate: AgeOnDate, logger: Logger) {
        const childrenWithRules = this.getChildrenWithRules(children, assignableTeams, assignmentRuleMappings, ageOnDate, logger);
        const idealsForTeams = this.getIdealTeamStats(assignableTeams, teamsBySpecialRequestOnly, childrenWithRules);
        // console.log(JSON.stringify(Array.from(idealsForTeams[0].byGender.values()), null, 2));
        const groupsWithChildren = this.assignChildrenToGroups(childrenWithRules);
        const teamsWithChildren = assignGroupsToTeams(groupsWithChildren, idealsForTeams, logger);
        return teamsWithChildren;
    }

    private getIdealTeamStats(assignableTeams: Team[], teamsBySpecialRequestOnly: Set<string>, children: ChildWithRules[]) {
        return createIdealsForTeams(assignableTeams, teamsBySpecialRequestOnly, children);
    }

    private getChildrenWithRules(children: Child[], assignableTeams: Team[], assignmentRuleMappings: AssignmentRuleMapping[], ageOnDate: AgeOnDate, logger: Logger) {
        return children.map(child => {
            const otherChildren = children.filter(c => c !== child);
            return getChildWithRules(child, assignmentRuleMappings, otherChildren, assignableTeams, ageOnDate, logger)
        });
    }

    private assignChildrenToGroups(children: ChildWithRules[]) {
        return createAssignmentGroups(children);
    }
}