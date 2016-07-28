export default class DelayTasks {
    tasks: any;
    constructor();
    addTask(taskName: string, func: Function, delay: number, repeat?: boolean): void;
    addRepeatTask(taskName: string, func: Function, delay: number): void;
    endTask(taskName: any): void;
    endAllTasks(): void;
}
