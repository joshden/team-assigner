import AssignmentGroup from "./AssignmentGroup";

export default class AssignmentGroupSorter {
    sortAssignmentGroups(assignmentGroups: AssignmentGroup[]) {
        const groupMap = new Map(assignmentGroups.map(group => {
            return [
                group, 
                {
                    requiredTeam: !! group.requiredTeam,
                    notTeamCount: group.notTeams.length,
                    childCount: group.childCount,
                    notChildCount: 0
                }
            ] as [AssignmentGroup, AssignmentGroupProps];
        }));

        for (const group1 of assignmentGroups) {
            for (const group2 of assignmentGroups) {
                if (group1 !== group2) {
                    if (! group1.isMergeAllowed(group2)) {
                        const prop1 = groupMap.get(group1) as AssignmentGroupProps;
                        prop1.notChildCount += group2.childCount;
                    }
                }
            }
        }

        const sortGroups = assignmentGroups.concat();

        sortGroups.sort((groupA, groupB) => {
            const a = groupMap.get(groupA) as AssignmentGroupProps;
            const b = groupMap.get(groupB) as AssignmentGroupProps;

            if (a.requiredTeam && ! b.requiredTeam) {
                return -1;
            }
            else if (b.requiredTeam && ! a.requiredTeam) {
                return 1;
            }

            return score(b) - score(a)
        });

        function score(props: AssignmentGroupProps) {
            return props.notTeamCount * 1.4
                + props.notChildCount * 1.2
                + props.childCount;
        }

        return sortGroups;
    }
}

type AssignmentGroupProps = {
    assignmentGroup: AssignmentGroup,
    requiredTeam: boolean,
    notTeamCount: number,
    childCount: number,
    notChildCount: number
};