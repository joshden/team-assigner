import { ChildWithRules } from "./Child";
import { PotentialRuleMatch } from "./AssignmentRule";
import { Team } from "./Team";
import _ from 'lodash';

export default class AssignmentGroup {
    readonly children: ChildWithRules[] = [];
    private readonly _matches: PotentialRuleMatch[] = [];

    get rules() {
        return this._matches;
    }

    get childCount() {
        return this.children.length;
    }

    get requiredTeam() {
        return this._matches.map(match => match.team).find(t => t !== undefined);
    }

    get notTeams() {
        const notTeams = new Set<Team>();
        this._matches.forEach(match => { 
            if (match.notTeams) {
                match.notTeams.forEach(team => notTeams.add(team));
            }
        });
        return Array.from(notTeams);
    }

    addChild(child: ChildWithRules, match: PotentialRuleMatch) {
        this.children.push(child);
        if (match !== undefined) {
            this._matches.push(match);
        }
        return this;
    }

    /**
     * Return true if merging the groups into the current group would not cause contradictions
     * @param groups 
     */
    isMergeAllowed(...groups: AssignmentGroup[]) {
        const children = _.flatten(groups.map(g => g.children))
        const matches = _.flatten(groups.map(g => g._matches));
        try {
            this._verifyNoContradictions(this.children.concat(children), this._matches.concat(matches));
            return true;
        }
        catch (e) {
            return false;
        }
    }

    mergeGroups(...groups: AssignmentGroup[]) {
        const children = _.flatten(groups.map(g => g.children))
        const matches = _.flatten(groups.map(g => g._matches));
        children.filter(c => ! this.children.includes(c)).forEach(c => this.children.push(c));
        matches.filter(m => ! this._matches.includes(m)).forEach(m => this._matches.push(m));
    }

    hasChild(child: ChildWithRules) {
        return this.children.includes(child);
    }

    verifyNoContradictions() {
        this._verifyNoContradictions(this.children, this._matches);
    }

    private _verifyNoContradictions(children: ChildWithRules[], matches: PotentialRuleMatch[]) {
        let team: Team|undefined = undefined;
        const notTeams: Team[] = [];

        for (const match of matches) {
            if (match.notTeams) {
                match.notTeams
                    .filter(t => ! notTeams.includes(t))
                    .forEach(t => notTeams.push(t));
            }
            if (match.team) {
                if (team && team !== match.team) {
                    throw new Error(`Both teams ${team.teamNumber} and ${match.team.teamNumber} were requested to be on`);
                }
                team = match.team;
            }
            if (match.notTeammates) {
                match.notTeammates.forEach(notChild => {
                    if (children.map(c => c.child).includes(notChild)) {
                        throw new Error(`Child ${notChild.firstName} ${notChild.lastName} was requested both to be with and not to be with`);
                    }
                });
            }
        }

        for (const match of matches) {
            if (match.team && notTeams.includes(match.team)) {
                throw new Error(`Team ${match.team.teamNumber} was requested both to be on and not to be on`);
            }
        }
    }
}