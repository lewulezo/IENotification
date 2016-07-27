interface Window {
    open(url?: string, target?: string, features?: string, replace?: boolean): Window;
    close(): any;
    focus(): any;
    addEventListener(eventName: string, handler: Function): any;
    Notification: any;
    IENotification: any;
    showModalDialog(dialog: string, varArgIn: any, varOptions: any): any;
    setTimeout(func: Function, timeout: number): any;
    showModelessDialog(url: string, param: any, options: string): Dialog;
    lastPosition: ienotification.Position;
}
interface Dialog extends Window {
    dialogArguments: any;
    dialogLeft: string;
    dialogTop: string;
    dialogHeight: string;
    dialogWidth: string;
    fixedPosition: ienotification.Position;
}
declare class Promise<T> {
    constructor(callback: (resolve: (T) => void, reject: Function) => void);
}
declare var window: Window;
declare module ienotification {
    class Position {
        x: number;
        y: number;
        w: number;
        h: number;
        constructor({x, y, w, h}: {
            x?: number;
            y?: number;
            w?: number;
            h?: number;
        });
        equals(pos: Position): boolean;
    }
}
