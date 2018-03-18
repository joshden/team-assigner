import * as moment from 'moment';
import Team from './Team';
import Parents from './Parents';

export default class Child {
    readonly parents: Parents;
    private _team: Team;

    constructor(parents: Parents) {
        this.parents = parents;
    }

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

    shoulNotdHaveInGroup(otherChild : Child) {
        throw new Error('not implemented');
    }

}