import { ageAtLeast, ageLessThan, unknownAge, notes, FindCriteria, child, matchAny, matchAll, gender } from "../src/AssignmentRuleMapping";
import { BaseChild, Child, Gender } from "../src/Child";
import Parents from "../src/Parents";
import { expect } from 'chai';
import { createChild, genderDobChild } from "./TestUtil";
import { create } from "domain";
import AgeOnDate from "../src/AgeOnDate";

describe('FindCriteria', () => {
    it('ageAtLeast', () => {
        expectIsApplicableTrue(ageAtLeast(5), createChild({dob: new Date('2013-03-03')}), new Date('2018-03-03'));
        expectIsApplicableFalse(ageAtLeast(5), createChild({dob: new Date('2013-03-04')}), new Date('2018-03-03'));
        expectIsApplicableFalse(ageAtLeast(5), new BaseChild(new Parents(), '', 'F', 'L', null), new Date('2018-03-03'));
    });

    it('ageLessThan', () => {
        expectIsApplicableTrue(ageLessThan(5), createChild({dob: new Date('2013-03-04')}), new Date('2018-03-03'));
        expectIsApplicableFalse(ageLessThan(5), createChild({dob: new Date('2013-03-03')}), new Date('2018-03-03'));
        expectIsApplicableFalse(ageLessThan(5), new BaseChild(new Parents(), '', 'F', 'L', null), new Date('2018-03-03'));
    });

    it('unknownAge', () => {
        expectIsApplicableTrue(unknownAge, new BaseChild(new Parents(), '', 'F', 'L', null), new Date('2018-03-03'));
        expectIsApplicableFalse(unknownAge, createChild({dob: new Date('2013-03-04')}), new Date('2018-03-03'));
    });

    it('notes', () => {
        const child = new BaseChild(new Parents(), 'Just a string with some, you know, notes', 'F', 'L', null);
        expect(isApplicable(notes('Just a string with some, you know, notes'), child)).to.deep.equal([true, true]);
        expect(isApplicable(notes('some'), child)).to.deep.equal([false, false]);
    });

    it('wereChildNotesMatched', () => {
        const childA = createChild({notes: 'The Notes', firstName: 'F', lastName: 'L'});
        expect(isApplicable(matchAny(notes('Some other notes'), child('F', 'L')), childA)).to.deep.equal([true, false]);
        expect(isApplicable(matchAny(notes('The Notes'), child('F2', 'L2')), childA)).to.deep.equal([true, true]);
        expect(isApplicable(matchAll(notes('Some other notes'), child('F', 'L')), childA)).to.deep.equal([false, false]);
        expect(isApplicable(matchAll(notes('The Notes'), child('F', 'L')), childA)).to.deep.equal([true, true]);
        expect(isApplicable(matchAll(notes('The Notes'), child('F2', 'L2')), childA)).to.deep.equal([false, false]);
    });

    it('blank empty and all', () => {
        expectIsApplicableTrue(matchAny(), createChild());
        expectIsApplicableTrue(matchAll(), createChild());
    });

    it('gender', () => {
        const unknownChild = genderDobChild(Gender.Unknown);
        const maleChild = genderDobChild(Gender.Male);
        const femaleChild = genderDobChild(Gender.Female);

        expect(isApplicable(gender(Gender.Unknown), unknownChild)[0]).to.deep.equal(true);
        expect(isApplicable(gender(Gender.Male), femaleChild)[0]).to.deep.equal(false);
        expect(isApplicable(gender(Gender.Female), femaleChild)[0]).to.deep.equal(true);
        expect(isApplicable(gender(Gender.Male), maleChild)[0]).to.deep.equal(true);
        expect(isApplicable(gender(Gender.Male), unknownChild)[0]).to.deep.equal(false);
    });
});

function isApplicable(findCriteria: FindCriteria, child: Child, eventDate: Date = new Date('2018-03-03')) {
    return findCriteria.isApplicable(child, new AgeOnDate(eventDate));
}

function expectIsApplicableTrue(findCriteria: FindCriteria, child: Child, eventDate: Date = new Date('2018-03-03')) {
    expect(isApplicable(findCriteria, child, eventDate)[0]).to.be.true;
}

function expectIsApplicableFalse(findCriteria: FindCriteria, child: Child, eventDate: Date = new Date('2018-03-03')) {
    expect(isApplicable(findCriteria, child, eventDate)[0]).to.be.false;
}