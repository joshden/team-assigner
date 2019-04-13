import { StringKeyValue } from "./data/parseChildrenAndParents";

export default class Logger {
    readonly entries: {level: Level, message: string, params: any[], rawValues?: StringKeyValue}[] = [];

    parseWarning(rawValues: StringKeyValue, message: string, ...params: any[]) {
        this.pushEntry(Level.warning, message, params, rawValues);
    }

    warning(message: string, ...params: any[]) {
        this.pushEntry(Level.warning, message, params);
    }

    error(message: string, ...params: any[]) {
        this.pushEntry(Level.error, message, params);
    }

    private pushEntry(level: Level, message: string, params: any[], rawValues?: StringKeyValue) {
        this.entries.push({level, message, params, rawValues});
    }
}

enum Level {
    warning,
    error
}