export interface IWindow extends Window {
    open(url?: string, target?: string, features?: string, replace?: boolean): IWindow;
    Notification: any;
    IENotification: any;
    showModalDialog(dialog: string, varArgIn: any, varOptions: any): any;
    showModelessDialog(url: string, param: any, options: string): IDialog;
    lastPosition: Position;
}
export interface IDialog extends IWindow {
    dialogArguments: any;
    dialogLeft: string;
    dialogTop: string;
    dialogHeight: string;
    dialogWidth: string;
    fixedPosition: Position;
}
export declare class Promise<T> {
    constructor(callback: (resolve: (T) => void, reject: Function) => void);
}
export declare var window: IWindow;
import Position from './Position';
import Observable from './Observable';
import DelayTasks from './DelayTasks';
export declare const EVENT_OPEN: string;
export declare const EVENT_DISPOSE: string;
export declare class IENotification extends Observable {
    title: string;
    body: string;
    icon: string;
    data: string;
    onclick: Function;
    private _popup;
    private _bridge;
    delayTasks: DelayTasks;
    closed: boolean;
    static timeout: number;
    static basePath: any;
    static notificationPath: any;
    static notificationHeight: number;
    static notificationWidth: number;
    static edgeX: number;
    static edgeY: number;
    constructor(title: string, options: any);
    show(): void;
    close(): void;
    private _dispose();
    private _initBridge(bridge);
    initPopup(popup: IDialog): void;
    static requestPermission(callback: Function): Promise<string>;
    private _doClick(event);
}
