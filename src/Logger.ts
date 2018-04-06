export default class Logger {
    readonly entries: {level: Level, message: string, params: any[]}[] = [];

    warning(message: string, ...params: any[]) {
        this.pushEntry(Level.warning, message, params);
    }

    error(message: string, ...params: any[]) {
        this.pushEntry(Level.error, message, params);
    }

    private pushEntry(level: Level, message: string, params: any[]) {
        this.entries.push({level, message, params});
    }
}

enum Level {
    warning,
    error
}