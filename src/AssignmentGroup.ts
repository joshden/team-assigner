import { Child } from "./Child";

export default class AssignmentGroup {
    readonly children: Child[] = [];

    addChild(child: Child) {
        this.children.push(child);
        return this;
    }

    hasChild(child: Child) {
        return this.children.includes(child);
    }
}