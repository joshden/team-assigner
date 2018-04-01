import { BaseChild } from "../src/Child";
import Parents from "../src/Parents";

let nameSequence = 0;

export function createChild(params: {parents?: Parents, dob?: Date, notes?: string, firstName?: string, lastName?: string} = {}) {
    if (! params.parents) {
        params.parents = new Parents();
    }
    if (! params.dob) {
        params.dob = new Date();
    }
    if (! params.notes) {
        params.notes = '';
    }
    if (! params.firstName) {
        params.firstName = 'F' + (++nameSequence).toString();
    }
    if (! params.lastName) {
        params.lastName = 'L' + (++nameSequence).toString();
    }
    return new BaseChild(params.parents, params.notes, params.firstName, params.lastName, params.dob);
}