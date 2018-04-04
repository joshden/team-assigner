import { expect } from 'chai';
import { createChild, childWithRules, createTeam, dateNumbers, genderDobChild } from './TestUtil';
import { Gender, ChildWithRules } from '../src/Child';
import { all, onTeam, RuleBuilder } from '../src/AssignmentRule';
import { Team, IdealForTeam } from '../src/Team';
import { createIdealsForTeams } from '../src/TeamIdealCreator';
import assignGroupstoTeams from '../src/GroupToTeamAssigner';
import { mock } from 'ts-mockito';

describe('GroupToTeamAssigner', () => {

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
