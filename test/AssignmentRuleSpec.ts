import * as m from "../src/AssignmentRuleMapping";
import { RuleBuilder, all, withChild, any, AssignmentRule } from "../src/AssignmentRule";
import { BaseChild, Child } from "../src/Child";
import Parents from "../src/Parents";
import { Team } from "../src/Team";
import Teacher from "../src/Teacher";
import { expect } from 'chai';

describe('RuleBuilder', () => {
    const parentsA = new Parents();
    const parentsB = new Parents();
    const parentsC = new Parents();

    const childA1 = new BaseChild(parentsA, '', 'A1F', 'A1L', new Date());
    const childA2 = new BaseChild(parentsA, '', 'A2F', 'A2L', new Date());
    const childB1 = new BaseChild(parentsB, '', 'B1F', 'B1L', new Date());
    const childC1 = new BaseChild(parentsC, '', 'C1F', 'C1L', new Date());
    const childC2 = new BaseChild(parentsC, '', 'C2F', 'C2L', new Date());
    const childC3 = new BaseChild(parentsC, '', 'C3F', 'C3L', new Date());
    const allChildren = [childA1, childA2, childB1, childC1, childC2, childC3];

    const teams = [
        new Team(1, [new Teacher('TF1A', 'TL1A'), new Teacher('TF1B', 'TL1B')]),
        new Team(2, [new Teacher('TF2A', 'TL2A'), new Teacher('TF2B', 'TL2B')]),
        new Team(3, [new Teacher('TF3A', 'TL3A'), new Teacher('TF3B', 'TL3B')]),
    ];

    let rule: AssignmentRule;

    it('withChild, all, and any', () => {
        rule = getRule(childA1, 
            all(
                withChild('B1F', 'B1L'),
                withChild('C1F', 'C1L'),
                any(
                    withChild('C2F', 'C2L'),
                    withChild('C3F', 'C3L'),
                )
            ));

        expect(rule.potentialMatches).to.deep.equal([
            {
                teammates: [childB1, childC1, childC2]
            },
            {
                teammates: [childB1, childC1, childC3]
            }
        ]);
    });

    it('withChild any', () => {
        rule = getRule(childA1, 
            any(
                withChild('C2F', 'C2L'),
                withChild('C3F', 'C3L'),
            ));

        expect(rule.potentialMatches).to.deep.equal([
            {
                teammates: [childC2]
            },
            {
                teammates: [childC3]
            }
        ]);
    });

    it('withChild all', () => {
        rule = getRule(childA1, 
            all(
                withChild('C2F', 'C2L'),
                withChild('C3F', 'C3L'),
            ));

        expect(rule.potentialMatches).to.deep.equal([
            {
                teammates: [childC2, childC3]
            }
        ]);
    });

    it('withChild', () => {
        rule = getRule(childA1, withChild('C2F', 'C2L'));
        
        expect(rule.potentialMatches).to.deep.equal([
            {
                teammates: [childC2]
            }
        ]);
    });

    function getRule(child: Child, ruleBuilder: RuleBuilder) {
        return ruleBuilder.getRule(child, teams, allChildren.filter(c => c!== childA1));
    }
});
