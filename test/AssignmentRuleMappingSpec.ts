import * as m from "../src/AssignmentRuleMapping";
import { all, withChild, any } from "../src/AssignmentRuleMapping";
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

    let ruleBuilder: m.RuleBuilder;

    it('withChild, all, and any', () => {
        ruleBuilder = all(
            withChild('B1F', 'B1L'),
            withChild('C1F', 'C1L'),
            any(
                withChild('C2F', 'C2L'),
                withChild('C3F', 'C3L'),
            )
        );
        
        populateRule(childA1);

        expect(ruleBuilder.potentialMatches).to.deep.equal([
            {
                teammates: [childB1, childC1, childC2]
            },
            {
                teammates: [childB1, childC1, childC3]
            }
        ]);
    });

    it('withChild any', () => {
        ruleBuilder = any(
            withChild('C2F', 'C2L'),
            withChild('C3F', 'C3L'),
        );
        
        populateRule(childA1);

        expect(ruleBuilder.potentialMatches).to.deep.equal([
            {
                teammates: [childC2]
            },
            {
                teammates: [childC3]
            }
        ]);
    });

    it('withChild all', () => {
        ruleBuilder = all(
            withChild('C2F', 'C2L'),
            withChild('C3F', 'C3L'),
        );
        
        populateRule(childA1);

        expect(ruleBuilder.potentialMatches).to.deep.equal([
            {
                teammates: [childC2, childC3]
            }
        ]);
    });

    it('withChild', () => {
        ruleBuilder = withChild('C2F', 'C2L');
        
        populateRule(childA1);

        expect(ruleBuilder.potentialMatches).to.deep.equal([
            {
                teammates: [childC2]
            }
        ]);
    });


    function populateRule(child: Child) {
        ruleBuilder.populateRule(child, teams, allChildren.filter(c => c!== childA1));
    }
});
