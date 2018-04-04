import AssignmentGroup from "./AssignmentGroup";
import { IdealForTeam, AssignedTeam } from "./Team";
import AssignmentGroupSorter from "./AssignmentGroupSorter";


export class GroupToTeamAssigner {

    constructor(private readonly assignmentGroupSorter: AssignmentGroupSorter) {

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
        //  Assignment Group to report its stats for each gender, gender ages
        //  Relative and/or absolute team score for group being added to the team
        //  Logistics of adding each child in each group to the team

        return [] as AssignedTeam[];
    }

}

export default function assignGroupsToTeams(assignmentGroups: AssignmentGroup[], idealsForTeams: IdealForTeam[]) {
    return new GroupToTeamAssigner(new AssignmentGroupSorter).assignGroupsToTeams(assignmentGroups, idealsForTeams);
}