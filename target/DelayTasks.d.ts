export default class DelayTasks {
    private tasks;
    constructor();
    addTask(taskName: string, func: Function, delay: number, repeat?: boolean): void;
    addSimpleTask(taskName: string, func: Function, delay: number): void;
    addRepeatTask(taskName: string, func: Function, delay: number): void;
    addAwaitingTask(taskName: string, func: Function, waitingFunc: Function, delay: number): void;
    getTaskNames(): string[];
    endTask(taskName: any): void;
    endAllTasks(): void;
}
