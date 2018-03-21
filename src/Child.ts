import * as moment from 'moment';
import Team from './Team';
import Parents from './Parents';
import AssignmentRule from './AssignmentRule';

export default class Child {
    private _team: Team;
    assignmentRules: AssignmentRule[];

    constructor(readonly parents: Parents, readonly notes: string) { }

    get firstName() {
        return '';
    }

    get team() {
        return this._team;
    }
    set team(team: Team) {
        this._team = team;
    }

    shouldHaveInGroup(otherChild : Child) {
        throw new Error('not implemented');
    }

    shouldNotHaveInGroup(otherChild : Child) {
        throw new Error('not implemented');
    }

    findSiblings(children: Child[]) {
        const siblings: Child[] = [];
        return siblings;
    }

}