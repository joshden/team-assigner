import AssignmentGroup from "./AssignmentGroup";
import { IdealForTeam, AssignedTeam, TeamScore, Desirability } from "./Team";
import AssignmentGroupSorter from "./AssignmentGroupSorter";
import Logger from "./Logger";


export class GroupToTeamAssigner {

    constructor(private readonly assignmentGroupSorter: AssignmentGroupSorter, private readonly logger: Logger) {

    }

    assignGroupsToTeams(assignmentGroups: AssignmentGroup[], idealsForTeams: IdealForTeam[]) {
        // sort assignment groups
        //  1. specific team assignment
        //  2. not specific team/teammate count, desc
        //      - give e.g. 5x more weight to the not team count vs. not teammate count
        //  3. number of children in group, desc
        //  4. uniqueness of characteristics of group, desc

        // with each group
        //  determine relative change in each team's score if group was placed on that team
        //      take into account groups that should not be with each other
        //      fail if not allowed to be on any of the teams
        //  put group on team with best score

        // Could be separate classes
        //  Assignment group sorting
        //  Assignment Group bubble down to children whether group can be placed on specific team already with specific children
        //  Assignment Group to report its stats for each gender, gender ages, number of children
        //  AssignedTeam to have addAssignmentGroup
        //  Relative and/or absolute team score for group being added to the team
        //  Logistics of adding each child in each group to the team

        const groups = this.assignmentGroupSorter.sortAssignmentGroups(assignmentGroups);
        const teams = idealsForTeams.map(idealForTeam => new AssignedTeam(idealForTeam));

        for (const group of groups) {
            const teamsAndScores = teams.map(team => [team, team.getScore(group)] as [AssignedTeam, TeamScore]);
            const requiredTeam = teamsAndScores.find(ts => ts[1].desirability >= Desirability.Required);
            if (requiredTeam) {
                const [team, score] = requiredTeam;
                if (score.isOverMax) {
                    this.logger.warning('Assigning group to required team even though it is over max', group, team);
                }
                team.addGroup(group);
                continue;
            }
            const allowedTeams = teamsAndScores.filter(ts => ts[1].desirability >= Desirability.Allowed);
            if (allowedTeams.length < 1) {
                this.logger.error('No allowed team was found for the group', group);
                throw new Error('No allowed team was found for the group');
            }
            let teamsToPickFrom: [AssignedTeam, TeamScore][] = allowedTeams;
            const allowedTeamsInCapacity = allowedTeams.filter(ts => ts[1].isOverMax === false);
            if (allowedTeamsInCapacity.length < 1) {
                this.logger.warning('All allowed teams are over capacity', group);
            }
            else {
                teamsToPickFrom = allowedTeamsInCapacity;
            }
            teamsToPickFrom.sort((a, b) => b[1].score - a[1].score);
            teamsToPickFrom[0][0].addGroup(group);
        }

        return teams;
    }

}

export default function assignGroupsToTeams(assignmentGroups: AssignmentGroup[], idealsForTeams: IdealForTeam[], logger: Logger) {
    return new GroupToTeamAssigner(new AssignmentGroupSorter, logger).assignGroupsToTeams(assignmentGroups, idealsForTeams);
}