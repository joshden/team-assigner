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

describe('AssignmentGroupSorter', () => {

    it('sorts groups based on size', () => {
        const groups = createGroups({
            a: {childCount: 2},
            b: {childCount: 5},
            c: {childCount: 3},
        });

        const sortedGroups = new AssignmentGroupSorter().sortAssignmentGroups(Array.from(groups.values()));

        expect(sortedGroups).to.deep.equal([groups.get('b'), groups.get('c'), groups.get('a')]);
    });

    it('sorts groups based on required team, then size', () => {
        const groups = createGroups({
            a: {childCount: 2},
            b: {childCount: 5},
            c: {childCount: 3, requiredTeam: true},
        });

        const sortedGroups = new AssignmentGroupSorter().sortAssignmentGroups(Array.from(groups.values()));

        expect(sortedGroups).to.deep.equal([groups.get('c'), groups.get('b'), groups.get('a')]);
    });

    it('sorts groups based on required team, not teams, size, not with', () => {
        const y = true;
        const n = false;

        const groups = createGroups({
            //    childCount, requiredTeam, notTeamCount, notWith
            a: g(   8,          n,            0,           ['g']),
            b: g(   8,          n,            2,           []),
            c: g(   6,          n,            3,           []),
            d: g(   6,          n,            1,           ['k']),
            e: g(   4,          n,            0,           []),
            f: g(   4,          n,            2,           ['l']),
            g: g(   8,          y,            3,           ['a']),
            h: g(   8,          y,            1,           []),
            i: g(   6,          y,            2,           []),
            j: g(   6,          y,            1,           []),
            k: g(   4,          y,            0,           ['f','l']),
            l: g(   4,          y,            1,           ['k']),
        });

        const sortedGroups = new AssignmentGroupSorter().sortAssignmentGroups(Array.from(groups.values()));

        const actualSort = sortedGroups.map(g => (g as any).id as string);
        const expectedSort = [
            'g', 'k', 'l', 'h', 'i', 'j', 'a', 'd', 'f', 'b', 'c', 'e'
        ];
        expect(actualSort).to.deep.equal(expectedSort);
    });

});

function g(childCount: number, requiredTeam: boolean, notTeamCount: number, notWith: string[]) {
    return {
        requiredTeam: requiredTeam,
        notTeamCount: notTeamCount,
        childCount: childCount,
        notWith: notWith
    } as AssignmentGroupParams;
}

type AssignmentGroupParams = {
    requiredTeam?: boolean,
    notTeamCount?: number,
    childCount: number,
    notWith?: string[]
};

function createGroups(params: {[s: string]: AssignmentGroupParams}) {
    const mocks = new Map<string, AssignmentGroup>();
    const instances = new Map<string, AssignmentGroup>();

    const allIds = Object.keys(params);

    for (const id of allIds) {
        const param = params[id];
        const group = mock(AssignmentGroup);
        const notTeamCount = param.notTeamCount ? param.notTeamCount : 0;
        when(group.notTeams).thenReturn(_.times(notTeamCount, () => createTeam()));
        when(group.requiredTeam).thenReturn(param.requiredTeam ? createTeam() : undefined);
        when(group.childCount).thenReturn(param.childCount);
        mocks.set(id, group);
        const groupInstance = instance(group);
        (groupInstance as any).id = id;
        instances.set(id, groupInstance);
    }

    for (const id1 of allIds) {
        for (const id2 of allIds) {
            if (id1 !== id2) {
                const mock1 = mocks.get(id1) as AssignmentGroup;
                const instance2 = instances.get(id2) as AssignmentGroup;
                const notWith = params[id1].notWith;
                const isAllowed = ! (notWith && notWith.includes(id2));
                when(mock1.isMergeAllowed(instance2)).thenReturn(isAllowed);
            }
        }
    }

    return instances;
}