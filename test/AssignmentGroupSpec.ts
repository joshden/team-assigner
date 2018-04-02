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

    it('addChild with rules', () => {
        const children = [childA, childB];
    
        const ruleChildA = createChildWithRules(childA, any(onTeam('1'), withChildObj(childB)), children);
        const ruleChildB = createChildWithRules(childB, any(), children);

        const group = new AssignmentGroup()
            .addChild(ruleChildA, ruleChildA.assignmentRule.potentialMatches[0])
            .addChild(ruleChildB, ruleChildB.assignmentRule.potentialMatches[0]);
        
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
            const children = [childA, childB];
    
            const ruleChildA = createChildWithRules(childA, onTeam('1'), children);
            const ruleChildB = createChildWithRules(childB, onTeam('2'), children);

            expect(() => verifyNoContradictions(ruleChildA, ruleChildB)).to.throw('Both teams 1 and 2 were requested to be on');
        });

        it('fails if teammate and not teammate', () => {
            const children = [childA, childB, childC];
    
            const ruleChildA = createChildWithRules(childA, withChildObj(childC), children);
            const ruleChildB = createChildWithRules(childB, not(withChildObj(childC)), children);
            const ruleChildC = createChildWithRules(childC, any(), children);

            // console.log(JSON.stringify(ruleChildB, null, 2));
            expect(() => verifyNoContradictions(ruleChildA, ruleChildB, ruleChildC)).to.throw(`Child ${childC.firstName} ${childC.lastName} was requested both to be with and not to be with`);
        });

        function verifyNoContradictions(...child: ChildWithRules[]) {
            const group = new AssignmentGroup();
            child.forEach(child => group.addChild(child, child.assignmentRule.potentialMatches[0]));
            group.verifyNoContradictions();
        }

    });

    function createChildWithRules(child: Child, rule: RuleBuilder, children: Child[]) {
        return childWithRules(child, rule, teams, children);
    }

});