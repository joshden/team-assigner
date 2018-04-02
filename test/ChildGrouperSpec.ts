import { expect } from 'chai';
import Parents from '../src/Parents';
import { createChild, childWithRules, withChildObj } from './TestUtil';
import { ChildWithRules } from '../src/Child';
import { withChild, all, RuleBuilder, not, any } from '../src/AssignmentRule';
import createAssignmentGroups from '../src/ChildGrouper';
import { Team } from '../src/Team';

describe('ChildGrouper', () => {
    const childA = createChild();
    const childB = createChild();
    const childC = createChild();
    const childD = createChild();
    const childE = createChild();

    it('groups teammates who should be together', () => {
        const allChildren = [childA, childB, childC, childD, childE];

        const ruleChildA = childWithRules(childA, withChildObj(childB), [], allChildren);
        const ruleChildB = childWithRules(childB, all(), [], allChildren);
        const ruleChildC = childWithRules(childC, all(), [], allChildren);
        const ruleChildD = childWithRules(childD, withChildObj(childC), [], allChildren);
        const ruleChildE = childWithRules(childE, withChildObj(childD), [], allChildren);

        const groups = createAssignmentGroups([ruleChildA, ruleChildB, ruleChildC, ruleChildD, ruleChildE]);
        expect(groups).to.have.lengthOf(2);
        expect(groups[0].children).to.deep.equal([ruleChildA, ruleChildB]);
        expect(groups[1].children).to.deep.equal([ruleChildC, ruleChildD, ruleChildE]);
    });

    it("uses each child's first potential match", () => { // though could be enhanced in the future to find most optimal as well as pick ones that would eliminate contradictions
        const allChildren = [childA, childB, childC];

        const ruleChildA = childWithRules(childA, 
            any(
                withChild(childB.firstName, childB.lastName), 
                withChild(childC.firstName, childC.lastName)), [], allChildren);
        const ruleChildB = childWithRules(childB, all(), [], allChildren);
        const ruleChildC = childWithRules(childC, all(), [], allChildren);

        const groups = createAssignmentGroups([ruleChildA, ruleChildB, ruleChildC]);
        expect(groups).to.have.lengthOf(2);
        expect(groups[0].children).to.deep.equal([ruleChildA, ruleChildB]);
        expect(groups[0].rules).to.deep.equal([ruleChildA.assignmentRule.potentialMatches[0]]);
        expect(groups[1].children).to.deep.equal([ruleChildC]);
    });

    it("checks for contradictions", () => {
        const allChildren = [childA, childB];

        const ruleChildA = childWithRules(childA, withChildObj(childB), [], allChildren);
        const ruleChildB = childWithRules(childB, not(withChildObj(childA)), [], allChildren);

        expect(() => createAssignmentGroups([ruleChildA, ruleChildB])).to.throw(Error);
    });
    
    // describe('siblings', () => {
    //     it('places together if no conflicting rules', () => {
    //         const parents = new Parents();
    //         const sibling = createChild({parents: parents});

    //         const child = getChildWithRules(createChild({parents: parents}), [], [sibling], [], new Date(), logger);

    //         expect(child.assignmentRule.potentialMatches).to.have.lengthOf(1);
    //         expect(child.assignmentRule.potentialMatches[0].teammates).to.deep.equal([sibling]);
    //     });

    // });
});