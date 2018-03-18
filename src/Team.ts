import Child from "./Child";

export default class Team {
    private readonly _children: Child[] = [];

    get children() {
        return this._children;
    }

    addChild(child : Child) {
        this._children.push(child);
    }

}