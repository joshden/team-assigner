import Parents from "../src/Parents";
import { Child } from "../src/Child";
import { Team } from "../src/Team";
import Teacher from "../src/Teacher";
import getChildWithRules from "../src/ChildWithRulesCreator";
import Logger from "../src/Logger";
import { createChild } from "./TestUtil";
import { expect } from 'chai';
import { mapping, notes, matchAny, child } from "../src/AssignmentRuleMapping";
import { all, withChild } from "../src/AssignmentRule";
import AgeOnDate from "../src/AgeOnDate";

const ageOnDate = new AgeOnDate(new Date());

describe('createChildWithRules', () => {

    let logger: Logger;

    beforeEach(() => {
        logger = new Logger;
    });

    it('child with notes and no rules logs warning', () => {
        const child = createChild({notes: 'unmatched notes'});
        getChildWithRules(child, [], [], [], ageOnDate, logger);
        expect(logger.entries[0].message).to.equal('No applicable rule mapping was found for child notes');
        expect(logger.entries[0].params).to.deep.equal([child]);
    });

    it('child with notes and note matching rule does not log warning', () => {
        const child = createChild({notes: 'matched notes'});
        getChildWithRules(child, [mapping(notes('matched notes'), all())], [], [], ageOnDate, logger);
        expect(logger.entries).to.be.empty;
    });

    it('child with no notes does not log notes warning', () => {
        getChildWithRules(createChild(), [], [], [], ageOnDate, logger);
        expect(logger.entries).to.be.empty;
    });

    it('applies all applicable rules', () => {
        const child1 = createChild();
        const child2 = createChild();
        const child3 = createChild();

        const rule1 = mapping(matchAny(), withChild(child1.firstName, child1.lastName));
        const rule2 = mapping(child('WrongFname', 'WrongLname'), withChild(child2.firstName, child2.lastName));
        const rule3 = mapping(matchAny(), withChild(child3.firstName, child3.lastName));
        
        const childWithRules = getChildWithRules(createChild(), [rule1, rule2, rule3], [child1, child2, child3], [], ageOnDate, logger);
        
        expect(childWithRules.assignmentRule.potentialMatches).to.have.lengthOf(1);
        expect(childWithRules.assignmentRule.potentialMatches[0].teammates).to.deep.equal([child1, child3]);
    });

});