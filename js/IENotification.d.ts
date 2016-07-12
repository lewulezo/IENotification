interface Window {
    open(url?: string, target?: string, features?: string, replace?: boolean): Window;
    close(): any;
    focus(): any;
    addEventListener(eventName: string, handler: Function): any;
    Notification: any;
    showModalDialog(dialog: string, varArgIn: any, varOptions: any): any;
    setTimeout(func: Function, timeout: number): any;
    showModelessDialog(url: string, param: any, options: string): any;
    dialogArguments: any;
}
declare var window: Window;
declare class Observable {
    private listeners;
    constructor();
    addEventListener(eventName: string, func: Function): void;
    removeEventListener(eventName: any, func: Function): void;
    dispatchEvent(eventName: string): void;
    fire(eventName: string): void;
    on(eventName: string, func: Function): void;
    un(eventName: string, func: Function): void;
}
declare class ObjectEvent {
    name: string;
    stop: boolean;
    stopWhenError: boolean;
    constructor(name: any);
}
declare class DelayTasks {
    tasks: any;
    constructor();
    addTask(taskName: string, func: Function, delay: number): void;
    endTask(taskName: any): void;
    endAllTasks(): void;
}
declare const EVENT_OPEN: string;
declare const EVENT_DISPOSE: string;
declare class IENotification extends Observable {
    title: string;
    body: string;
    icon: string;
    data: string;
    onclick: Function;
    private _popup;
    private _bridge;
    delayTasks: DelayTasks;
    static timeout: number;
    static rootPath: string;
    constructor(title: string, options: any);
    show(): void;
    close(): void;
    dispose(): void;
    private _initBridge(bridge);
    private _initPopup(popup);
    static initContentInPopup(popup: Window): void;
    static requestPermission(callback: Function): void;
    private _doClick(event);
}
declare function appendBlankForTitle(title: string): string;
declare module IENotificationQueue {
    function add(noti: IENotification): void;
}
