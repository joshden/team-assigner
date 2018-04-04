import { expect } from 'chai';
import { createChild, childWithRules, createTeam, dateNumbers, genderDobChild } from './TestUtil';
import { Gender, ChildWithRules } from '../src/Child';
import { all, onTeam, RuleBuilder } from '../src/AssignmentRule';
import { Team, IdealForTeam } from '../src/Team';
import { createIdealsForTeams } from '../src/TeamIdealCreator';
import assignGroupstoTeams, { GroupToTeamAssigner } from '../src/GroupToTeamAssigner';
import { mock, instance, when } from 'ts-mockito';
import AssignmentGroupSorter from '../src/AssignmentGroupSorter';
import AssignmentGroup from '../src/AssignmentGroup';
import _ from 'lodash';

describe('GroupToTeamAssigner', () => {

    it('sorts and assigns to teams', () => {
        const groupMocks = _.times(5, () => mock(AssignmentGroup));
        const idealsForTeams = _.times(3, () => mock(IdealForTeam));

        const groups = groupMocks.map(g => instance(g));
        const [group1, group2, group3, group4, group5] = groups;

        const sorter = mock(AssignmentGroupSorter);
        when(sorter.sortAssignmentGroups(groups)).thenReturn([group5, group2, group3, group1, group4]);

        const assigner = new GroupToTeamAssigner(sorter);
        assigner.assignGroupsToTeams(groups, idealsForTeams.map(i => instance(i)));

    });

    it.skip('assigns to teams', () => {
        const child1 = genderDobChild(Gender.Female, '2005-05-12');
        const child2 = genderDobChild(Gender.Male, '2012-03-25');
        const child3 = genderDobChild(Gender.Female, '2009-04-25');

        const teams = [createTeam(), createTeam(), createTeam()];

        new IdealForTeam(createTeam(), 2, 3, 
            new Map([[Gender.Female, 2], [Gender.Male, 1]]), 
            new Map([
                [Gender.Female, dateNumbers(['2006-05-01', 2], ['2007-06-01', 2])],
                [Gender.Male, dateNumbers(['2006-05-01', 2], ['2007-06-01', 2])]]),
            false);
    });

});
