import { expect } from 'chai';
import Parents from '../src/Parents';
import { createChild } from './TestUtil';
import { ChildWithRules } from '../src/Child';
import { withChild, all, RuleBuilder } from '../src/AssignmentRule';
import createAssignmentGroups from '../src/ChildGrouper';

describe('ChildGrouper', () => {

    it('groups teammates who should be together', () => {
        const childA = createChild();
        const childB = createChild();
        const childC = createChild();
        const childD = createChild();
        const childE = createChild();

        const ruleChildA = new ChildWithRules(childA, withChild(childB.firstName, childB.lastName).getRule(childA, [], [childB, childC, childD, childE]));
        const ruleChildB = new ChildWithRules(childB, all().getRule(childB, [], []));
        const ruleChildC = new ChildWithRules(childC, all().getRule(childC, [], []));
        const ruleChildD = new ChildWithRules(childD, withChild(childC.firstName, childC.lastName).getRule(childD, [], [childA, childB, childC, childE]));
        const ruleChildE = new ChildWithRules(childE, withChild(childD.firstName, childD.lastName).getRule(childE, [], [childA, childB, childC, childD]));

        const groups = createAssignmentGroups([ruleChildA, ruleChildB, ruleChildC, ruleChildD, ruleChildE]);
        expect(groups).to.have.lengthOf(2);
        expect(groups[0].children).to.deep.equal([ruleChildA, ruleChildB]);
        expect(groups[1].children).to.deep.equal([ruleChildC, ruleChildD, ruleChildE]);
    });

    // TODO need to take into account any() and not to include teammates from all potential matches

    
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