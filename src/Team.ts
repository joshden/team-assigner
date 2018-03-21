import Child from "./Child";
import Teacher from "./Teacher";

export default class Team {
    private readonly _children: Child[] = [];

    constructor(readonly teamNumber: number, readonly teachers: Teacher[]) { }

    get children() {
        return this._children;
    }

    addChild(child : Child) {
        this._children.push(child);
    }

}