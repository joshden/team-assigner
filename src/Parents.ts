export default class Parents {
    readonly names: {firstName: string; lastName: string}[] = [];
    
    constructor(..._names: {firstName: string; lastName: string}[]) {
        this.names = _names;
    }
}