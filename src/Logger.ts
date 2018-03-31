export default class Logger {
    readonly entries: {level: Level, message: string, params: any[]}[] = [];

    warning(message: string, ...params: any[]) {
        this.entries.push({level: Level.warning, message: message, params: params});
    }

}

enum Level {
    warning
}