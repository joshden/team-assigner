import { ChildWithRules } from "./Child";
import { PotentialRuleMatch } from "./AssignmentRule";
import { Team } from "./Team";

export default class AssignmentGroup {
    readonly children: ChildWithRules[] = [];
    private readonly _matches: PotentialRuleMatch[] = [];

    get rules() {
        return this._matches;
    }

    addChild(child: ChildWithRules, match: PotentialRuleMatch) {
        this.children.push(child);
        if (match !== undefined) {
            this._matches.push(match);
        }
        return this;
    }

    hasChild(child: ChildWithRules) {
        return this.children.includes(child);
    }

    verifyNoContradictions() {
        let team: Team|undefined = undefined;
        const notTeams: Team[] = [];

        for (const match of this._matches) {
            if (match.notTeams) {
                match.notTeams
                    .filter(t => ! notTeams.includes(t))
                    .forEach(t => notTeams.push(t));
            }
            if (match.team && team && team !== match.team) {
                throw new Error(`Both teams ${team.teamNumber} and ${match.team.teamNumber} were requested to be on`);
            }
            if (match.notTeammates) {
                console.log(match.notTeammates);
                match.notTeammates.forEach(notT => {
                    if (this.children.map(c => c.child).includes(notT)) {
                        throw new Error(`Child ${notT.firstName} ${notT.lastName} was requested both to be with and not to be with`);
                    }
                });
            }
            team = match.team;
        }

        for (const match of this._matches) {
            if (match.team && notTeams.includes(match.team)) {
                throw new Error(`Team ${match.team.teamNumber} was requested both to be on and not to be on`);
            }
        }
    }
}