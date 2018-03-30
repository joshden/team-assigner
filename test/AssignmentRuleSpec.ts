import * as m from "../src/AssignmentRuleMapping";
import { RuleBuilder, all, withChild, any, AssignmentRule, taughtBy, not, PotentialRuleMatch, withChildrenOf, team } from "../src/AssignmentRule";
import { BaseChild, Child } from "../src/Child";
import Parents from "../src/Parents";
import { Team } from "../src/Team";
import Teacher from "../src/Teacher";
import { expect } from 'chai';

describe('RuleBuilder', () => {
    const parentsA = new Parents({firstName: 'PAF1', lastName: 'PAL1'}, {firstName: 'PAF2', lastName: 'PAL1'});
    const parentsB = new Parents({firstName: 'PBF1', lastName: 'PBL1'}, {firstName: 'PBF2', lastName: 'PBL2'});
    const parentsC = new Parents({firstName: 'PCF1', lastName: 'PCL1'}, {firstName: 'PCF2', lastName: 'PCL1'});

    const childA1 = new BaseChild(parentsA, '', 'A1F', 'A1L', new Date());
    const childA2 = new BaseChild(parentsA, '', 'A2F', 'A2L', new Date());
    const childB1 = new BaseChild(parentsB, '', 'B1F', 'B1L', new Date());
    const childC1 = new BaseChild(parentsC, '', 'C1F', 'C1L', new Date());
    const childC2 = new BaseChild(parentsC, '', 'C2F', 'C2L', new Date());
    const childC3 = new BaseChild(parentsC, '', 'C3F', 'C3L', new Date());
    const allChildren = [childA1, childA2, childB1, childC1, childC2, childC3];

    const teams = [
        new Team('1', [new Teacher('TF1A', 'TL1A'), new Teacher('TF1B', 'TL1B')]),
        new Team('2', [new Teacher('TF2A', 'TL2A'), new Teacher('TF2B', 'TL2B')]),
        new Team('3', [new Teacher('TF3A', 'TL3A'), new Teacher('TF3B', 'TL3B')]),
    ];
    const [team1, team2, team3] = teams;

    let rule: AssignmentRule;

    it('withChild, all, and any', () => {
        rule = getRule(childA1, 
            all(
                withChild('B1F', 'B1L'),
                withChild('C1F', 'C1L'),
                any(
                    withChild('C2F', 'C2L'),
                    withChild('C3F', 'C3L'),
                ),
                taughtBy('TF1B', 'TL1B')
            ));

        expectPotentialMatches(rule, [
            {
                teammates: [childB1, childC1, childC2],
                team: team1
            },
            {
                teammates: [childB1, childC1, childC3],
                team: team1
            }
        ]);

        expect(isRuleMet(rule, childA1, [childB1, childC1, childC3], team1)).to.be.true;
        expect(isRuleMet(rule, childA1, [childB1, childC1, childC2], team1)).to.be.true;
        expect(isRuleMet(rule, childA1, [childB1, childC2, childC3], team1)).to.be.false;
        expect(isRuleMet(rule, childA1, [childB1, childC1, childC3], team2)).to.be.false;
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

    it('taughtBy', () => {
        rule = getRule(childA1, taughtBy('TF2A', 'TL2A'));

        expectPotentialMatches(rule, [
            {
                team: team2
            }
        ]);
    });

    it('taughtBy and not team', () => {
        rule = getRule(childA1, all(taughtBy('TF2A', 'TL2A'), not(team('1'))));

        expectPotentialMatches(rule, [
            {
                notTeams: [team1],
                team: team2
            }
        ]);
    });

    it('taughtBy multiple teachers on same team', () => {
        rule = getRule(childA1, all(taughtBy('TF2A', 'TL2A'), taughtBy('TF2B', 'TL2B')));

        expectPotentialMatches(rule, [
            {
                team: team2
            }
        ]);
    });

    it('taughtBy from multiple teams', () => {
        expect(
            () => getRule(childA1, all( taughtBy('TF2A', 'TL2A'), taughtBy('TF1B', 'TL1B') ))
        ).to.throw(Error);
    });

    it('withChildrenOf', () => {
        rule = getRule(childC1, withChildrenOf('PAF2', 'PAL1'));

        expectPotentialMatches(rule, [
            {
                teammates: [ childA1, childA2 ]
            }
        ]);
    });

    it('not withChildrenOf', () => {
        rule = getRule(childC1, not(withChildrenOf('PAF2', 'PAL1')));

        expectPotentialMatches(rule, [
            {
                notTeammates: [ childA1, childA2 ]
            }
        ]);
    });

    it('not taughtBy', () => {
        rule = getRule(childA1, all(not(taughtBy('TF2A', 'TL2A')), not(taughtBy('TF1B', 'TL1B'))));

        expectPotentialMatches(rule, [
            {
                notTeams: [team2, team1]
            }
        ]);

        expect(rule.isRuleMet(childA1, [childA2, childC3], team2)).to.be.false;
        expect(rule.isRuleMet(childA1, [childA2, childC3], team1)).to.be.false;
        expect(rule.isRuleMet(childA1, [childA2, childC3], team3)).to.be.true;
    });

    it('not withChild', () => {
        rule = getRule(childA1, not(withChild('C3F', 'C3L')));

        expectPotentialMatches(rule, [
            {
                notTeammates: [ childC3 ]
            }
        ]);
    });

    it('not with children or on team', () => {
        rule = getRule(childC1, 
            all(
                not(withChild('C2F', 'C2L')),
                not(withChild('C3F', 'C3L')),
                not(taughtBy('TF1A', 'TL1A'))));

        expectPotentialMatches(rule, [
            {
                notTeammates: [ childC2, childC3 ],
                notTeams: [ team1 ]
            }
        ]);
    });

    it('with and not with a child', () => {
        const getRuleFail = () => 
            getRule(childC1, 
                all(
                    not(withChild('C2F', 'C2L')),
                    withChild('C2F', 'C2L')));

        expect(getRuleFail).to.throw(Error);
    });

    it('taught and not taught by a teacher', () => {
        const getRuleFail = () => 
            getRule(childC1, 
                all(
                    not(taughtBy('TF2A', 'TL2A')),
                    taughtBy('TF2A', 'TL2A')));

        expect(getRuleFail).to.throw(Error);
    });

    function getRule(child: Child, ruleBuilder: RuleBuilder) {
        return ruleBuilder.getRule(child, teams, allChildren.filter(c => c !== child));
    }

    function isRuleMet(rule: AssignmentRule, child: Child, otherChildren: Child[], team: Team) {
        return rule.isRuleMet(child, otherChildren, team);
    }

    function expectPotentialMatches(rule: AssignmentRule, expectedPotentialMatches: PotentialRuleMatch[]) {
        expect(rule.potentialMatches).to.deep.equal(expectedPotentialMatches);
    }
});
