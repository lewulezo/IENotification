'use strict';
declare interface Window{
  open(url?: string, target?: string, features?: string, replace?: boolean): Window;
  close();
  focus();
  addEventListener(eventName:string, handler:Function);
  Notification;
  IENotification;
  showModalDialog(dialog:string, varArgIn, varOptions);
  setTimeout(func:Function, timeout:number);
  showModelessDialog(url:string, param:any, options:string): Dialog;
  lastPosition: ienotification.Position;
}


declare interface Dialog extends Window{
  dialogArguments:any;
  dialogLeft:string;
  dialogTop:string;
  dialogHeight:string;
  dialogWidth:string;
  fixedPosition: ienotification.Position;
}

declare class Promise<T>{
  constructor(callback:(resolve:(T)=>void, reject:Function)=>void);
}

declare var window:Window;

module ienotification{
  export class Position{
    x:number;
    y:number;
    w:number;
    h:number;
    constructor({x=0, y=0, w=0, h=0}){
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
    equals(pos:Position):boolean{
      return this.x == pos.x && this.y == pos.y && this.w == pos.w && this.h == pos.h;
    }
  }

  class Observable{
    private listeners;
    constructor(){
      let self = this;
      self.listeners = {};
      self.addEventListener.bind(self);
      self.removeEventListener.bind(self);
      self.dispatchEvent.bind(self);
      self.fire.bind(self);
      self.on.bind(self);
      self.un.bind(self);
    }

    addEventListener(eventName:string, func:Function){
      let handlers:Function[] = this.listeners[eventName];
      if (handlers){
        handlers.push(func);
      } else {
        handlers = [func];
        this.listeners[eventName] = handlers;
      }
    }

    removeEventListener(eventName, func: Function){
      let handlers:Function[] = this.listeners[eventName];
      if (handlers){
        let index = handlers.indexOf(func);
        if (index > -1){
          handlers.splice(index, 1);
        }
      }
    }

    dispatchEvent(eventName:string){
      let self = this;
      let handlers: Function[] = self.listeners[eventName];
      let evt = new ObjectEvent(eventName);
      if (handlers){
        handlers.some(func=>{
          try {
            func.call(self, evt);
            if (evt.stop){
              return true;
            }
          } catch (error){
            console.log(`Error in dispatchEvent ${eventName}...${error.message}`)
            if (evt.stopWhenError){
              return true;
            }
          }
        })
      }
    }

    fire(eventName:string){
      this.dispatchEvent(eventName);
    }

    on(eventName:string, func:Function){
      this.addEventListener(eventName, func);
    }

    un(eventName:string, func:Function){
      this.removeEventListener(eventName, func);
    }
  }

  class ObjectEvent{
    name:string;
    stop:boolean;
    stopWhenError:boolean;

    constructor(name){
      this.name = name;
      this.stop = false;
      this.stopWhenError = true;
    }
  }

  class DelayTasks{
    tasks;

    constructor(){
      this.tasks = {};
    }

    addTask(taskName:string, func:Function, delay:number, repeat=false):void{
      if (repeat){
        this.tasks[taskName] = - setInterval(func, delay);
      } else {
        this.tasks[taskName] = setTimeout(func, delay);
      }
    }

    addRepeatTask(taskName:string, func:Function, delay:number):void{
      this.addTask(taskName, func, delay, true);
    }

    endTask(taskName):void{
      let id = this.tasks[taskName];
      if (id > 0){
        clearTimeout(id);
      } else {
        clearInterval(-id);
      }
      delete this.tasks[taskName];
    }

    endAllTasks(){
      Object.keys(this.tasks).forEach(taskName=>this.endTask(taskName));
    }
  }

  //-------------------------------------------------------------------------------

  const EVENT_OPEN = 'OPEN';
  const EVENT_DISPOSE = 'DISPOSE';


  class IENotification extends Observable{
    title: string;
    body: string;
    icon: string;
    data: string;
    onclick: Function;
    private _popup: Dialog;
    private _bridge: Window;
    delayTasks: DelayTasks;

    static timeout = 20000;
    public static basePath;
    public static notificationPath;
    public static notificationHeight = 90;
    public static notificationWidth = 360;
    public static edgeX = 0;
    public static edgeY = 0;

    constructor(title:string, options){
      super();
      let self = this;
      self.title = title;
      if (options){
        self.body = options.body;
        self.icon = options.icon;
        self.data = options.data;
      }
      self.delayTasks = new DelayTasks();
      IENotificationQueue.add(self);
    }

    show():void{
      let self = this;
      let height = IENotification.notificationHeight;
      let width = IENotification.notificationWidth;
      let left = screen.width - width;
      let top = screen.height - height;
      let bridge:Window = window.open(`${IENotification.notificationPath}bridge.html`, self.title, 
      `width=${width},height=${height},top=${top},left=${left},center=0,resizable=0,scroll=0,status=0,location=0`);

      IENotification.edgeX = bridge.screenLeft - left;
      IENotification.edgeY = bridge.screenTop - top;

      self._bridge = bridge;
      self.delayTasks.addTask('initBridge', ()=> {
        self._initBridge(bridge);
      }, 10);
      
      self.fire(EVENT_OPEN);
      window.addEventListener('unload', ()=>self.close());    
    }
    
    public close():void{
      let self = this;
      if (self._bridge){
        self._bridge.close();
        self._bridge = null;
      }
      if (self._popup){
        self._popup.close();
        self._popup = null;
      }
    }

    dispose():void{
      let self = this;
      this.delayTasks.endAllTasks();
      if (self._bridge){
        self._bridge.close();
      }
      self.fire(EVENT_DISPOSE);    
      console.log('close notification...');
    }


    private _initBridge(bridge:Window){
      let self = this;
      let height = IENotification.notificationHeight + IENotification.edgeY;
      let width = IENotification.notificationWidth + IENotification.edgeX;
      let left = screen.width - width;
      let top = screen.height - height;

      let popup = bridge.showModelessDialog(`content.html`, self, 
        `dialogWidth:${width}px;dialogHeight:${height}px;dialogTop:${top}px;dialogLeft:${left}px;center:0;resizable:0;scroll:0;status:0;alwaysRaised=yes`);
      self._popup = popup;
      // self.delayTasks.addRepeatTask('fixDialogPosition', ()=>fixDialogPosition(popup), 100);
      self.delayTasks.addRepeatTask('fixBridgePosition', ()=>hideWindowBehindDialog(bridge, popup), 100);
      self.delayTasks.addTask('closePopup', ()=>self.close(), IENotification.timeout);
    }

    private _initPopup(popup:Dialog){
      let self = this;
      let titleDiv = popup.document.getElementById('title-div');
      titleDiv.innerHTML = self.title;
      let bodyDiv = popup.document.getElementById('body-div');
      bodyDiv.innerText = self.body;
      let iconImg = <HTMLImageElement>popup.document.getElementById('icon-img');
      popup.document.title = appendBlankForTitle('');
      iconImg.src = self.icon.indexOf('data:image/png;base64') == 0 ? self.icon : IENotification.basePath + self.icon;

      popup.addEventListener('click', (event)=>self._doClick(event));
      popup.addEventListener('blur', ()=>self.dispose());
      popup.addEventListener('unload', ()=>self.dispose());
      popup.focus();
    }

    static initContentInPopup(popup:Dialog){
      popup.dialogArguments._initPopup(popup);
    }

    //We don't need to implement this, just compatible with formal API
    static requestPermission(callback:Function){
      if (callback && callback instanceof Function){
        callback('granted');
      } else {
        return new Promise<string>((res, rej)=>{
          res('granted');
        });
      }
    }


    private _doClick(event:Event){
      let self:IENotification = this;
      event['notification'] = self;
      if (self.onclick instanceof Function){
        self.onclick(event);
      }
      self.close();
      window.focus();
    }
  }

  function getDialogPosition(dialog:Dialog):Position{
    return new Position({
      x: pxToNumber(dialog.dialogLeft),
      y: pxToNumber(dialog.dialogTop),
      w: pxToNumber(dialog.dialogWidth),
      h: pxToNumber(dialog.dialogHeight)
    });
  }

  function setDialogPosition(dialog:Dialog, pos:Position):void{
    if (getDialogPosition(dialog).equals(pos)){
      return;
    }
    dialog.dialogLeft = numberToPx(pos.x);
    dialog.dialogTop = numberToPx(pos.y);
    dialog.dialogWidth = numberToPx(pos.w);
    dialog.dialogHeight = numberToPx(pos.h);
  }

  
  function appendBlankForTitle(title:string):string {
    let ret = [title];
    for (let i = 0; i < 40; i++) {
      ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
    }
    return ret.join('');
  }

  function fixDialogPosition(dialog:Dialog):void{
    if (!dialog){
      return;
    }
    try {
      if (!dialog.fixedPosition){
        dialog.fixedPosition = getDialogPosition(dialog);
        return;
      }
      setDialogPosition(dialog, dialog.fixedPosition);
    } catch (e){
      //do nothing here
    }
  }

  function hideWindowBehindDialog(wnd:Window, dialog:Dialog){
    if (!dialog){
      return;
    }
    try {
      let dialogPos = getDialogPosition(dialog);
      if (wnd.lastPosition && wnd.lastPosition.equals(dialogPos)){
        return;
      }
      wnd.moveTo(dialogPos.x + 20, dialogPos.y + 20);
      wnd.resizeTo(dialogPos.w - 20, dialogPos.h - 20);
      wnd.lastPosition = dialogPos;
    } catch(e){
      //do nothing here
    }
  }

  function pxToNumber(str:string):number{
    if (str.length < 2){
      return 0;
    }
    return Number(str.substring(0, str.length - 2));
  }

  function numberToPx(num:number):string{
    return num + 'px';
  }

  module IENotificationQueue{
    let maxQueueSize = 20;
    let popupQueue:IENotification[] = [];
    let currentNoti:IENotification;

    export function add(noti:IENotification){
      if (popupQueue.length > maxQueueSize){
        return;
      }
      noti.on(EVENT_OPEN, ()=>currentNoti = noti);
      noti.on(EVENT_DISPOSE, ()=>{
        currentNoti = null;
        remove(noti);
      });
      if (isEmpty() && !currentNoti){
        noti.show();
      } else {
        popupQueue.push(noti);
      }
    }

    function remove(noti:IENotification){
      arrayRemove(popupQueue, noti);
      if (!isEmpty()){
        window.setTimeout(() => popupQueue.pop().show(), 200);
      }
    }

    function isEmpty():boolean{
      return popupQueue.length == 0;
    }

    function arrayRemove(arr:Array<any>, item){
      let index = arr.indexOf(item);
      if (index > -1){
        arr.splice(index, 1);
      }
    }
  }

  function syncWindowPosition(targetWin:Window, refWin:Window, offset={x:0,y:0}){
    try {
      let x = refWin.screenX + offset.x;
      let y = refWin.screenY + offset.y;
      if (targetWin.screenX != x || targetWin.screenY != y){
        targetWin.moveTo(x, y);
      }
    } catch (e){
      //do nothing here
    }
  }

  function getDefaultRootPath():string{
    let queryStr = window.location.search;
    let urlStr = window.location.href;
    let path = urlStr.substr(0, urlStr.length - queryStr.length);
    return path.substring(0, path.lastIndexOf('/')) + '/';
  }

  IENotification.basePath = getDefaultRootPath();
  IENotification.notificationPath = IENotification.basePath + "IENotification/";

  if (!window.Notification){
    window.Notification = window.IENotification= IENotification;
  } 

}


