export default class Observable {
    private listeners;
    constructor();
    addEventListener(eventName: string, func: Function): void;
    removeEventListener(eventName: any, func: Function): void;
    dispatchEvent(eventName: string): void;
    fire(eventName: string): void;
    on(eventName: string, func: Function): void;
    un(eventName: string, func: Function): void;
}
