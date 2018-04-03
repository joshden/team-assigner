import { expect } from 'chai';
import Parents from '../src/Parents';
import { createChild, withChildObj, childWithRules } from './TestUtil';
import { ChildWithRules, Child } from '../src/Child';
import { withChild, all, RuleBuilder, not, onTeam, any } from '../src/AssignmentRule';
import { Team } from '../src/Team';
import AssignmentGroup from '../src/AssignmentGroup';

describe('AssignmentGroup', () => {
    const team1 = new Team('1', []);
    const team2 = new Team('2', []);
    const team3 = new Team('3', []);
    const teams = [team1, team2, team3];

    const childA = createChild();
    const childB = createChild();
    const childC = createChild();
    const childD = createChild();
    const childE = createChild();
    const childF = createChild();

    it('addChild with rules', () => {
        const children = [childA, childB];
    
        const ruleChildA = createChildWithRules(childA, any(onTeam('1'), withChildObj(childB)), children);
        const ruleChildB = createChildWithRules(childB, any(), children);

        const group = createGroupWithFirstMatches(ruleChildA, ruleChildB);
        
        expect(group.rules).to.deep.equal([ruleChildA.assignmentRule.potentialMatches[0]]);
    });

    describe('verifyNoContradictions', () => {

        it('fails if on team and not on team', () => {
            const children = [childA, childB];
    
            const ruleChildA = createChildWithRules(childA, onTeam('1'), children);
            const ruleChildB = createChildWithRules(childB, not(onTeam('1')), children);

            expect(() => verifyNoContradictions(ruleChildA, ruleChildB)).to.throw('Team 1 was requested both to be on and not to be on');
        });

        it('fails if multiple different teams', () => {
            const children = [childA, childB, childC];
    
            const ruleChildA = createChildWithRules(childA, onTeam('1'), children);
            const ruleChildB = createChildWithRules(childB, any(), children);
            const ruleChildC = createChildWithRules(childC, onTeam('2'), children);

            expect(() => verifyNoContradictions(ruleChildA, ruleChildB, ruleChildC)).to.throw('Both teams 1 and 2 were requested to be on');
        });

        it('fails if teammate and not teammate', () => {
            const children = [childA, childB, childC];
    
            const ruleChildA = createChildWithRules(childA, withChildObj(childC), children);
            const ruleChildB = createChildWithRules(childB, not(withChildObj(childC)), children);
            const ruleChildC = createChildWithRules(childC, any(), children);

            expect(() => verifyNoContradictions(ruleChildA, ruleChildB, ruleChildC)).to.throw(`Child ${childC.firstName} ${childC.lastName} was requested both to be with and not to be with`);
        });

        function verifyNoContradictions(...child: ChildWithRules[]) {
            const group = new AssignmentGroup();
            child.forEach(child => group.addChild(child, child.assignmentRule.potentialMatches[0]));
            group.verifyNoContradictions();
        }

    });

    describe('isMergeAllowed', () => {

        it('true if no contradictions would result', () => {
            const childrenAC = [childA, childB, childC];
            const ruleChildA = createChildWithRules(childA, withChildObj(childC), childrenAC);
            const ruleChildB = createChildWithRules(childB, withChildObj(childC), childrenAC);
            const ruleChildC = createChildWithRules(childC, onTeam('3'), childrenAC);
            const group1 = createGroupWithFirstMatches(ruleChildA, ruleChildB, ruleChildC);

            const childrenDE = [childD, childE];
            const ruleChildD = createChildWithRules(childD, withChildObj(childE), childrenDE);
            const ruleChildE = createChildWithRules(childE, not(onTeam('2')), childrenDE);
            const group2 = createGroupWithFirstMatches(ruleChildD, ruleChildE);

            const childG = createChild();
            const ruleChildF = createChildWithRules(childF, all(onTeam('3'), not(withChildObj(childG))), [childF, childG]);
            const group3 = createGroupWithFirstMatches(ruleChildF, ruleChildA);

            expect(group1.isMergeAllowed(group2, group3)).to.be.true;
        });

        it('false if not onTeam contradiction', () => {
            const childrenAC = [childA, childB, childC];
            const ruleChildA = createChildWithRules(childA, withChildObj(childC), childrenAC);
            const ruleChildB = createChildWithRules(childB, withChildObj(childC), childrenAC);
            const ruleChildC = createChildWithRules(childC, onTeam('3'), childrenAC);
            const group1 = createGroupWithFirstMatches(ruleChildA, ruleChildB, ruleChildC);

            const childrenDE = [childD, childE];
            const ruleChildD = createChildWithRules(childD, withChildObj(childE), childrenDE);
            const ruleChildE = createChildWithRules(childE, not(onTeam('2')), childrenDE);
            const group2 = createGroupWithFirstMatches(ruleChildD, ruleChildE);

            const childG = createChild();
            const ruleChildF = createChildWithRules(childF, all(not(onTeam('3')), not(withChildObj(childG))), [childF, childG]);
            const group3 = createGroupWithFirstMatches(ruleChildF);

            expect(group1.isMergeAllowed(group2, group3)).to.be.false;
        });

        it('false if two different teams', () => {
            const childrenAC = [childA, childB, childC];
            const ruleChildA = createChildWithRules(childA, withChildObj(childC), childrenAC);
            const ruleChildB = createChildWithRules(childB, withChildObj(childC), childrenAC);
            const ruleChildC = createChildWithRules(childC, onTeam('3'), childrenAC);
            const group1 = createGroupWithFirstMatches(ruleChildA, ruleChildB, ruleChildC);

            const childrenDE = [childD, childE];
            const ruleChildD = createChildWithRules(childD, withChildObj(childE), childrenDE);
            const ruleChildE = createChildWithRules(childE, not(onTeam('2')), childrenDE);
            const group2 = createGroupWithFirstMatches(ruleChildD, ruleChildE);

            const childG = createChild();
            const ruleChildF = createChildWithRules(childF, all(onTeam('1'), not(withChildObj(childG))), [childF, childG]);
            const group3 = createGroupWithFirstMatches(ruleChildF);

            expect(group1.isMergeAllowed(group2, group3)).to.be.false;
        });

        it('false if notTeammates contradiction', () => {
            const childrenAC = [childA, childB, childC];
            const ruleChildA = createChildWithRules(childA, withChildObj(childC), childrenAC);
            const ruleChildB = createChildWithRules(childB, withChildObj(childC), childrenAC);
            const ruleChildC = createChildWithRules(childC, onTeam('3'), childrenAC);
            const group1 = createGroupWithFirstMatches(ruleChildA, ruleChildB, ruleChildC);

            const childrenDE = [childD, childE];
            const ruleChildD = createChildWithRules(childD, withChildObj(childE), childrenDE);
            const ruleChildE = createChildWithRules(childE, not(withChildObj(childA)), [childD, childE, childA]);
            const group2 = createGroupWithFirstMatches(ruleChildD, ruleChildE);

            const childG = createChild();
            const ruleChildF = createChildWithRules(childF, all(not(withChildObj(childG))), [childF, childG]);
            const group3 = createGroupWithFirstMatches(ruleChildF);

            expect(group1.isMergeAllowed(group2, group3)).to.be.false;
        });

    });

    it('mergeGroups adds content of groups to this one', () => {
        const childrenAC = [childA, childB, childC];
        const ruleChildA = createChildWithRules(childA, withChildObj(childC), childrenAC);
        const ruleChildB = createChildWithRules(childB, withChildObj(childC), childrenAC);
        const ruleChildC = createChildWithRules(childC, onTeam('3'), childrenAC);
        const group1 = createGroupWithFirstMatches(ruleChildA, ruleChildB, ruleChildC);

        const childrenDE = [childD, childE];
        const ruleChildD = createChildWithRules(childD, all(), childrenDE);
        const ruleChildE = createChildWithRules(childE, not(onTeam('2')), childrenDE);
        const group2 = createGroupWithFirstMatches(ruleChildD, ruleChildE);

        const childG = createChild();
        const ruleChildF = createChildWithRules(childF, all(onTeam('3'), not(withChildObj(childG))), [childF, childG]);
        const group3 = createGroupWithFirstMatches(ruleChildF, ruleChildC);

        group1.mergeGroups(group2, group3);
        expect(group1.children).to.deep.equal([ruleChildA, ruleChildB, ruleChildC, ruleChildD, ruleChildE, ruleChildF]);
        expect(group1.rules).to.deep.equal([ruleChildA, ruleChildB, ruleChildC, ruleChildE, ruleChildF].map(c => c.assignmentRule.potentialMatches[0]));
    });

    function createChildWithRules(child: Child, rule: RuleBuilder, children: Child[]) {
        return childWithRules(child, rule, teams, children);
    }

});

function createGroupWithFirstMatches(...children: ChildWithRules[]) {
    const group = new AssignmentGroup();
    children.forEach(c => group.addChild(c, c.assignmentRule.potentialMatches[0]));
    return group;
}
