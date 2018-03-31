import * as moment from 'moment';
import { Team } from './Team';
import Parents from './Parents';
import { AssignmentRule } from './AssignmentRule';

export interface Child {
    readonly parents: Parents;
    readonly notes: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly dateOfBirth: Date | null;
    readonly gender: Gender | null;
    readonly shirtSize: ShirtSize | null;
    findSiblings(children: Child[]): Child[];
}

abstract class ChildDecorator implements Child {
    constructor(protected readonly child: Child) {}

    get parents() {
        return this.child.parents;
    }

    get notes() {
        return this.child.notes;
    }

    get firstName() {
        return this.child.firstName;
    }

    get lastName() {
        return this.child.lastName;
    }

    get dateOfBirth() {
        return this.child.dateOfBirth;
    }

    get gender() {
        return this.child.gender;
    }

    get shirtSize() {
        return this.child.shirtSize;
    }
    
    findSiblings(children: Child[]) {
        return this.child.findSiblings(children);
    }
}

export class BaseChild implements Child {
    constructor(
        readonly parents: Parents,
        readonly notes: string,
        readonly firstName: string = '',
        readonly lastName: string = '',
        readonly dateOfBirth: Date | null = null,
        readonly gender: Gender | null = null,
        readonly shirtSize: ShirtSize | null = null
    ) {}

    findSiblings(children: Child[]) {
        const siblings: Child[] = [];
        return siblings;
    }
}

export class ChildWithRules extends ChildDecorator {
    constructor(
        child: Child, 
        readonly assignmentRule: AssignmentRule
    ) {
        super(child);
    }
}

export class ChildOnTeam extends ChildDecorator {
    constructor(
        child: Child, 
        readonly team: Team
    ) {
        super(child);
    }
}

export enum Gender {
    Male,
    Female
}

export enum ShirtSize {
    YS,
    YM,
    YL,
    AS,
    AM,
    AL,
    XL
}