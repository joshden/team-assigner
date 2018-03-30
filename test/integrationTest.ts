import TeamAssigner from "../src/TeamAssigner";
import { Team } from "../src/Team";
import { BaseChild, Child } from "../src/Child";
import { AssignmentRuleMapping, mapping, matchAll, matchAny, notMatch, child, parent, notes, ageLessThan, ageAtLeast, unknownAge } from "../src/AssignmentRuleMapping";
import { taughtBy, withChild, withChildrenOf, not, any, all, withFamily_NotImplemented, team } from '../src/AssignmentRule';
import Parents from "../src/Parents";
import Teacher from "../src/Teacher";

const parents1 = new Parents({firstName: "PFname", lastName: "PLname"});

const children: Child[] = [
    new BaseChild(parents1, "Note message. Put with best teacher. Something else", "Jacob", "Lname", new Date()),
    new BaseChild(parents1, "Note message. Put with best teacher. Something else", "Andrew", "Lname", new Date()),
    new BaseChild(new Parents(), "", "Some", "Loner", new Date()),
    new BaseChild(parents1, "Notes", "FName", "Lname", new Date(2010, 3-1, 23)),
];

const teams: Team[] = [
    new Team('1', [new Teacher("TeacherFname1", "TeacherLname1"), new Teacher("TeachFname2", "TeacherLname2")]),
    new Team('A', [new Teacher("A-T-F1", "A-T-L1"), new Teacher("A-T-F2", "A-T-L2")])
];

const assignmentRuleMappings: AssignmentRuleMapping[] = [
    mapping(matchAll(notes("Notes"), child("FName", "Lname"), parent("PFname", "PLname")),
        taughtBy("TeacherFname1", "TeacherLname1")),
    mapping(matchAll(notes("Put with best teacher."), child("CFirst", "CLast"), parent("PFirst", "PLast")), 
        taughtBy("TeacherFname1", "TeacherLname1")),
    mapping(matchAll(notes("Not taught by older sibling and not with other siblings."), matchAny(child("CF1", "CL1"), child("CF2", "CL2"))),
        not(taughtBy("TeacherFname2", "TeacherLname2"))),
    mapping(matchAll(notes("Match all but one particular child"), notMatch(child("CF1", "CL1"))),
        not(taughtBy("TeacherFname2", "TeacherLname2"))),
    mapping(notes("Not with mean family."),
        not(withChildrenOf("A", "Meanies"))),
    // mapping(notes("Not with mean family."),
    //     not(withFamily_NotImplemented("Meanies"))),
    mapping(notes("With known teacher or known other child"),
        any(taughtBy("TeachF", "TeachL"), withChild("Someone", "Chiles"))),
    mapping(notes("On specific team with other student"),
        all(taughtBy("TeachF", "TeachL"), withChild("Someone", "Chiles"))),
    mapping(ageLessThan(6),
        team("A")),
    mapping(matchAny(ageAtLeast(6), unknownAge),
        not(team("A"))),
    // groupWithSiblingsNotAlreadyInRules
];


/*
all(team1, any(child1, child2))
team1, child1
team1, child2

all(team1, child0, any(child1, child2, and(child3, child4)))
team1, child0, child1
team1, child0, child2
team1, child0, child3, child4

all(any(child1, child2), any(child3, child4))
child1, child3
child1, child4
child2, child3
child2, child4

all(any(child1, child2), any(child3, child4, child5))
child1, child3
child1, child4
child1, child5
child2, child3
child2, child4
child2, child5


all(child1, child2)
child1, child2

all(any(team1, child1, child2), any(child3, child4), any(child5, child6))
    any(team1, child1, child2)
        team1 
        child1
        child2
    any(child3, child4)
        child3
        child4
    any(child5, child6)
        child5
        child6

child1, child3, child5
child1, child3, child6
child1, child4, child5
child1, child4, child6
child2, child3, child5
child2, child3, child6
child2, child4, child5
child2, child4, child6
*/

describe('TeamAssigner', () => {
    it("doesn't fail", () => {
        const assignedTeams = new TeamAssigner().assignTeams(children, teams, assignmentRuleMappings, new Date(2018, 4-1, 13));
    });
});