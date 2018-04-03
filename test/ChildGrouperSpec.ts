import { expect } from 'chai';
import Parents from '../src/Parents';
import { createChild, childWithRules, withChildObj } from './TestUtil';
import { ChildWithRules } from '../src/Child';
import { withChild, all, RuleBuilder, not, any, onTeam } from '../src/AssignmentRule';
import createAssignmentGroups from '../src/ChildGrouper';
import { Team } from '../src/Team';

describe('ChildGrouper', () => {
    const childA = createChild();
    const childB = createChild();
    const childC = createChild();
    const childD = createChild();
    const childE = createChild();
    const childF = createChild();

    const team1 = new Team('1', []);
    const team2 = new Team('2', []);
    const team3 = new Team('3', []);
    const teams1through3 = [team1, team2, team3];

    it('groups teammates who should be together', () => {
        const allChildren = [childA, childB, childC, childD, childE];

        const ruleChildA = childWithRules(childA, withChildObj(childB), [], allChildren);
        const ruleChildB = childWithRules(childB, all(), [], allChildren);
        const ruleChildC = childWithRules(childC, all(), [], allChildren);
        const ruleChildD = childWithRules(childD, withChildObj(childC), [], allChildren);
        const ruleChildE = childWithRules(childE, withChildObj(childD), [], allChildren);

        const groups = createAssignmentGroups([ruleChildA, ruleChildB, ruleChildC, ruleChildD, ruleChildE]);
        expect(groups).to.have.lengthOf(2);
        expect(groups[0].children).to.deep.equal([ruleChildA, ruleChildB]);
        expect(groups[1].children).to.deep.equal([ruleChildC, ruleChildD, ruleChildE]);
    });

    it("uses each child's first potential match", () => { // though could be enhanced in the future to find most optimal as well as pick ones that would eliminate contradictions
        const allChildren = [childA, childB, childC];

        const ruleChildA = childWithRules(childA, 
            any(
                withChild(childB.firstName, childB.lastName), 
                withChild(childC.firstName, childC.lastName)), [], allChildren);
        const ruleChildB = childWithRules(childB, all(), [], allChildren);
        const ruleChildC = childWithRules(childC, all(), [], allChildren);

        const groups = createAssignmentGroups([ruleChildA, ruleChildB, ruleChildC]);
        expect(groups).to.have.lengthOf(2);
        expect(groups[0].children).to.deep.equal([ruleChildA, ruleChildB]);
        expect(groups[0].rules).to.deep.equal([ruleChildA.assignmentRule.potentialMatches[0]]);
        expect(groups[1].children).to.deep.equal([ruleChildC]);
    });

    it('groups together children requesting the same team', () => {
        const allChildren = [childA, childB, childC];
        const ruleChildA = childWithRules(childA, any(withChildObj(childB)), teams1through3, allChildren);
        const ruleChildB = childWithRules(childB, onTeam('1'), teams1through3, allChildren);
        const ruleChildC = childWithRules(childC, onTeam('1'), teams1through3, allChildren);

        const groups = createAssignmentGroups([ruleChildA, ruleChildB, ruleChildC]);

        expect(groups).to.have.lengthOf(1);
        expect(groups[0].children).to.deep.equal([ruleChildA, ruleChildB, ruleChildC]);
    });

    it("checks for contradictions", () => {
        const allChildren = [childA, childB];

        const ruleChildA = childWithRules(childA, withChildObj(childB), [], allChildren);
        const ruleChildB = childWithRules(childB, not(withChildObj(childA)), [], allChildren);

        expect(() => createAssignmentGroups([ruleChildA, ruleChildB])).to.throw(Error);
    });
    
    describe('siblings', () => {
        const parents = new Parents();
        const siblingA = createChild({parents: parents});
        const siblingB = createChild({parents: parents});
        const siblingC = createChild({parents: parents});

        it('places in same group by default', () => {
            const allChildren = [siblingA, siblingB, siblingC];
            const childrenWithRules = allChildren.map(c => childWithRules(c, all(), [], allChildren));

            const groups = createAssignmentGroups(childrenWithRules);

            expect(groups).to.have.lengthOf(1);
            expect(groups[0].children).to.deep.equal(childrenWithRules);
        });

        it('places in different groups if contradiction would result', () => {
            const allChildren = [siblingA, siblingB];

            const ruleChildA = childWithRules(siblingA, onTeam('1'), teams1through3, allChildren);
            const ruleChildB = childWithRules(siblingB, not(onTeam('1')), teams1through3, allChildren);

            const groups = createAssignmentGroups([ruleChildA, ruleChildB]);

            expect(groups).to.have.lengthOf(2);
            expect(groups[0].children).to.deep.equal([ruleChildA]);
            expect(groups[1].children).to.deep.equal([ruleChildB]);
        });

        it('places in different groups if requested not together', () => {
            const allChildren = [siblingA, siblingB];

            const ruleChildA = childWithRules(siblingA, any(), teams1through3, allChildren);
            const ruleChildB = childWithRules(siblingB, not(withChildObj(siblingA)), teams1through3, allChildren);

            const groups = createAssignmentGroups([ruleChildA, ruleChildB]);

            expect(groups).to.have.lengthOf(2);
            expect(groups[0].children).to.deep.equal([ruleChildA]);
            expect(groups[1].children).to.deep.equal([ruleChildB]);
        });

    });
});