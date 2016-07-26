interface Window {
    open(url?: string, target?: string, features?: string, replace?: boolean): Window;
    close(): any;
    focus(): any;
    addEventListener(eventName: string, handler: Function): any;
    Notification: any;
    IENotification: any;
    showModalDialog(dialog: string, varArgIn: any, varOptions: any): any;
    setTimeout(func: Function, timeout: number): any;
    showModelessDialog(url: string, param: any, options: string): any;
    dialogArguments: any;
    dialogLeft: string;
    dialogTop: string;
    fixedPosition: {
        x: string;
        y: string;
    };
}
declare class Promise<T> {
    constructor(callback: (resolve: (T) => void, reject: Function) => void);
}
declare var window: Window;
declare module ienotification {
}
