import { ageAtLeast, ageLessThan, unknownAge } from "../src/AssignmentRuleMapping";
import { BaseChild } from "../src/Child";
import Parents from "../src/Parents";
import { expect } from 'chai';


describe('AssignmentRuleMapping', () => {
    it('ageAtLeast', () => {
        expect(ageAtLeast(5).isApplicable(child({dob: new Date(2013, 3-1, 3)}), new Date(2018, 3-1, 3))).to.be.true;
        expect(ageAtLeast(5).isApplicable(child({dob: new Date(2013, 3-1, 4)}), new Date(2018, 3-1, 3))).to.be.false;
        expect(ageAtLeast(5).isApplicable(new BaseChild(new Parents(), '', 'F', 'L', null), new Date(2018, 3-1, 3))).to.be.false;
    });

    it('ageLessThan', () => {
        expect(ageLessThan(5).isApplicable(child({dob: new Date(2013, 3-1, 4)}), new Date(2018, 3-1, 3))).to.be.true;
        expect(ageLessThan(5).isApplicable(child({dob: new Date(2013, 3-1, 3)}), new Date(2018, 3-1, 3))).to.be.false;
        expect(ageLessThan(5).isApplicable(new BaseChild(new Parents(), '', 'F', 'L', null), new Date(2018, 3-1, 3))).to.be.false;
    });

    it('unknownAge', () => {
        expect(unknownAge.isApplicable(new BaseChild(new Parents(), '', 'F', 'L', null), new Date(2018, 3-1, 3))).to.be.true;
        expect(unknownAge.isApplicable(child({dob: new Date(2013, 3-1, 4)}), new Date(2018, 3-1, 3))).to.be.false;
    });
});


function child(params: {dob?: Date}) {
    if (! params.dob) {
        params.dob = new Date();
    }
    return new BaseChild(new Parents(), '', 'F', 'L', params.dob);
}