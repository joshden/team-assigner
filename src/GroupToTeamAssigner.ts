import AssignmentGroup from "./AssignmentGroup";
import { IdealForTeam, AssignedTeam, TeamScore, Desirability } from "./Team";
import AssignmentGroupSorter from "./AssignmentGroupSorter";
import Logger from "./Logger";


export class GroupToTeamAssigner {
    constructor(
        private readonly assignmentGroupSorter: AssignmentGroupSorter, 
        private readonly logger: Logger
    ) { }

    assignGroupsToTeams(assignmentGroups: AssignmentGroup[], idealsForTeams: IdealForTeam[]) {
        const groups = this.assignmentGroupSorter.sortAssignmentGroups(assignmentGroups);
        const teams = idealsForTeams.map(idealForTeam => new AssignedTeam(idealForTeam));

        for (const group of groups) {
            const teamsAndScores = teams.map(team => [team, team.getScore(group)] as [AssignedTeam, TeamScore]);
            const requiredTeam = teamsAndScores.find(ts => ts[1].desirability >= Desirability.Required);
            if (requiredTeam) {
                const [team, score] = requiredTeam;
                if (score.isOverMax && ! team.isSpecialRequestTeam) {
                    this.logger.warning('No allowed team was found for the group', group.childNames);
                    this.logger.warning('Assigning group to required team even though it is over max', group.childNames, team.info);
                }
                team.addGroup(group);
                continue;
            }
            const allowedTeams = teamsAndScores.filter(ts => ts[1].desirability >= Desirability.Allowed);
            if (allowedTeams.length < 1) {
                this.logger.error('No allowed team was found for the group', group.childNames);
                throw new Error('No allowed team was found for the group');
            }
            let teamsToPickFrom: [AssignedTeam, TeamScore][] = allowedTeams;
            const allowedTeamsWithCapacity = allowedTeams.filter(ts => ts[1].isOverMax === false);
            if (allowedTeamsWithCapacity.length < 1) {
                this.logger.warning('All allowed teams are over capacity', group.childNames);
            }
            else {
                teamsToPickFrom = allowedTeamsWithCapacity;
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