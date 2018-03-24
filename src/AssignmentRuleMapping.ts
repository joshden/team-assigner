import { Child } from "./Child";
import AssignmentRule from "./AssignmentRule";
import { Team } from "./Team";

export default class AssignmentRuleMapping {

    appliesTo(child: Child, remainingNotes: string): boolean {
        throw new Error("Method not implemented.");
    }

    addRules(assignmentRules: AssignmentRule[], remainingNotes: string, otherChildren: Child[], assignableTeams: Team[], childrenInvolvedInRules: Child[]): string {
        throw new Error("Method not implemented.");
    }
}

