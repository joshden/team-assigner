import { expect } from 'chai';
import { createChild, childWithRules, dateNumbers, genderDobChild } from './TestUtil';
import { Gender } from '../src/Child';
import { all, onTeam } from '../src/AssignmentRule';
import { Team } from '../src/Team';
import { createIdealsForTeams } from '../src/TeamIdealCreator';

describe('TeamIdealCreator', () => {
    it('returns ideal for each team of unknown DOB and unknown gender', () => {
        const teams = ['1','2','3'].map(name => new Team(name, []));
        const children = ['A','B','C','D','E','F','G'].map(name => child());

        const idealsForTeams = createIdealsForTeams(teams, new Set(), children);

        expect(idealsForTeams.map(i => i.team)).to.deep.equal(teams);
        idealsForTeams.forEach(ideal => expect(ideal.minChildren).to.equal(2));
        idealsForTeams.forEach(ideal => expect(ideal.maxChildren).to.equal(3));
        idealsForTeams.forEach(ideal => expect(ideal.byGender).to.deep.equal(new Map([[Gender.Unknown, 7/3]])));
        idealsForTeams.forEach(ideal => expect(ideal.byGenderDobRange).to.deep.equal(new Map([[Gender.Unknown, new Map([[null, 7/3]])]])));
    });

    it('handles no teams and no children', () => {
        expect(createIdealsForTeams([], new Set(), [])).to.be.empty;
    });

    it('handles no children', () => {
        const teams = ['1','2','3'].map(name => new Team(name, []));

        const idealsForTeams = createIdealsForTeams(teams, new Set(), []);

        expect(idealsForTeams.map(i => i.team)).to.deep.equal(teams);
        idealsForTeams.forEach(ideal => expect(ideal.minChildren).to.equal(0));
        idealsForTeams.forEach(ideal => expect(ideal.maxChildren).to.equal(0));
        idealsForTeams.forEach(ideal => expect(ideal.byGender).to.deep.equal(new Map()));
        idealsForTeams.forEach(ideal => expect(ideal.byGenderDobRange).to.deep.equal(new Map()));
    });

    it("handles teams by special request", () => {
        const teams = ['1','2','3'].map(name => new Team(name, []));

        const children = [
            child(),
            child(),
            child(),
            teamChild(teams[1]),
            child(),
            child(),
            teamChild(teams[1]),
            child(),
            child(),
        ];

        const idealsForTeams = createIdealsForTeams(teams, new Set(['2']), children);

        expect(idealsForTeams.map(i => i.team)).to.deep.equal(teams);

        const regularTeamIdeals = [idealsForTeams[0], idealsForTeams[2]];
        regularTeamIdeals.forEach(ideal => expect(ideal.minChildren).to.equal(3));
        regularTeamIdeals.forEach(ideal => expect(ideal.maxChildren).to.equal(4));
        regularTeamIdeals.forEach(ideal => expect(ideal.byGender).to.deep.equal(new Map([[Gender.Unknown, 3.5]])));
        regularTeamIdeals.forEach(ideal => expect(ideal.byGenderDobRange).to.deep.equal(new Map([[Gender.Unknown, new Map([[null, 3.5]])]])));

        const specialIdeal = idealsForTeams[1];
        expect(specialIdeal.minChildren).to.equal(0);
        expect(specialIdeal.maxChildren).to.equal(0);
        expect(specialIdeal.byGender).to.deep.equal(new Map());
        expect(specialIdeal.byGenderDobRange).to.deep.equal(new Map());
    });

    it("handles all teams by special request only", () => {
        const teams = ['2','3'].map(name => new Team(name, []));

        const children = [child(), child()];

        const idealsForTeams = createIdealsForTeams(teams, new Set(['2', '3']), children);

        const specialIdeal = idealsForTeams[1];
        expect(specialIdeal.minChildren).to.equal(0);
        expect(specialIdeal.maxChildren).to.equal(0);
        expect(specialIdeal.byGender).to.deep.equal(new Map());
        expect(specialIdeal.byGenderDobRange).to.deep.equal(new Map());
    });

    it("fails if invalid teams by special request only", () => {
        const teams = ['1','2','3'].map(name => new Team(name, []));
        expect(() => createIdealsForTeams(teams, new Set(['1', 'A']), [])).to.throw("Team A does not exist but was designated as by special request only");
    });

    it('returns ideal for each team of known and unknown gender', () => {
        const teams = ['1','2'].map(name => new Team(name, []));

        const children = [
            child(Gender.Female),
            child(Gender.Male),
            child(Gender.Unknown),
            child(Gender.Female),
            child(Gender.Female),
            child(Gender.Male),
        ]

        const idealsForTeams = createIdealsForTeams(teams, new Set(), children);

        expect(idealsForTeams.map(i => i.team)).to.deep.equal(teams);
        idealsForTeams.forEach(ideal => expect(ideal.minChildren).to.equal(3));
        idealsForTeams.forEach(ideal => expect(ideal.maxChildren).to.equal(3));
        idealsForTeams.forEach(ideal => expect(ideal.byGender).to.deep.equal(new Map([
            [Gender.Female, 3/2],
            [Gender.Male, 2/2],
            [Gender.Unknown, 1/2],
        ])));
    });

    it('returns ideal for DOB of multiple gender and ages', () => {
        const teams = ['A','1','2'].map(name => new Team(name, []));

        const children = [
            child(Gender.Male, '2011-01-05'),
            child(Gender.Male, null),
            child(Gender.Male, '2011-03-05'),
            child(Gender.Male, '2008-01-07'),
            child(Gender.Female, '2010-05-31', teams[0]),
            child(Gender.Male, '2009-07-14'),
            child(Gender.Female, '2006-12-01'),
            child(Gender.Female, '2008-03-02'),
            child(Gender.Female, null),
            child(Gender.Female, '2011-03-17'),
            child(Gender.Female, '2007-11-11'),
            child(Gender.Female, '2010-05-31'),
            child(Gender.Female, '2008-06-12'),
            child(Gender.Unknown, '2012-04-02'),
            child(Gender.Unknown, null),
        ];

        const idealsForTeams = createIdealsForTeams(teams, new Set('A'), children, 3);

        idealsForTeams.slice(1).forEach(ideal => expect(ideal.byGenderDobRange).to.deep.equal(new Map([
            [Gender.Male, dateNumbers(
                ['2009-01-25T08:00:00.000Z', 0.5],
                ['2010-02-13T16:00:00.000Z', 0.5],
                ['2011-03-05T00:00:00.000Z', 1],
                [null, 0.5]
            )],
            [Gender.Female, dateNumbers(
                ['2008-05-06T08:00:00.000Z', 1.5],
                ['2009-10-10T16:00:00.000Z', 0.5],
                ['2011-03-17T00:00:00.000Z', 1],
                [null, 0.5]
            )],
            [Gender.Unknown, dateNumbers(
                ['2012-04-02T00:00:00.000Z', 0.5],
                ['2012-04-02T00:00:00.000Z', 0],
                ['2012-04-02T00:00:00.000Z', 0],
                [null, 0.5]
            )],
        ])));
    });
});

function child(gender = Gender.Unknown, dob: string|null = null, team: Team|undefined = undefined) {
    const baseChild = genderDobChild(gender, dob);
    const ruleBuilder = team ? onTeam(team.teamNumber) : all();
    return childWithRules(baseChild, ruleBuilder, team ? [team] : [], []);
}

function teamChild(team: Team|undefined = undefined, gender = Gender.Unknown, dob: string|null = null) {
    return child(gender, dob, team);
}