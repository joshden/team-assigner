import * as m from './src/AssignmentRuleMapping';
import { mapping, notes, child, ageAtLeast, ageLessThan, unknownAge, parent, matchAll, matchAny, notMatch } from "./src/AssignmentRuleMapping";
import * as r from './src/AssignmentRule';
import { team, taughtBy, withChild, withChildrenOf, not, any, all } from "./src/AssignmentRule";

export default [
    mapping(notes('If possible, we would like our kids to be on the same team as Jon Doe.  Thank you!'),
        withChild('Jon', 'Doe'))
];