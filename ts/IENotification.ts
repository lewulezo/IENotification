'use strict';
declare interface Window{
  open(url?: string, target?: string, features?: string, replace?: boolean): Window;
  close();
  focus();
  addEventListener(eventName:string, handler:Function);
  Notification;
  showModalDialog(dialog:string, varArgIn, varOptions);
  setTimeout(func:Function, timeout:number);
  showModelessDialog(url:string, param:any, options:string);
  dialogArguments:any;
}
declare var window:Window;


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



const EVENT_OPEN = 'OPEN';
const EVENT_DISPOSE = 'DISPOSE';


class IENotification extends Observable{
  title: string;
  body: string;
  icon: string;
  data: string;
  onclick: Function;
  private _popup: Window;
  private _bridge: Window;
  delayTasks: DelayTasks;

  static timeout = 20000;
  public static rootPath = '';

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
    let height = 120;
    let width = screen.width * 0.2;
    let left = screen.width - width;
    let top = screen.height - height;
    let bridge:Window = window.open('bridge.html', self.title, 
    `width=${width},height=${height},top=${top},left=${left},center=0,resizable=0,scroll=0,status=0,location=0`);

    self._bridge = bridge;
    self.delayTasks.addTask('initBridge', ()=> {
      self._initBridge(bridge);
      // setTimeout(()=>bridge.close(), 100);
    }, 10);
    
    self.fire(EVENT_OPEN);    
  }
  
  public close():void{
    let self = this;
    if (self._popup){
      self._popup.close();
      self._popup = null;
    }
    console.log('close notification...');
  }

  dispose():void{
    let self = this;
    this.delayTasks.endAllTasks();
    if (self._bridge){
      self._bridge.close();
    }
    self.fire(EVENT_DISPOSE);    
  }


  private _initBridge(bridge:Window){
    let self = this;
    let height = 120 + 5;
    let width = screen.width * 0.2 + 5;
    let left = screen.width - width;
    let top = screen.height - height;
    let popup = bridge.showModelessDialog(`content.html`, self, 
      `dialogWidth:${width}px;dialogHeight:${height}px;dialogTop:${top}px;dialogLeft:${left}px;center:0;resizable:0;scroll:0;status:0;alwaysRaised=yes`);

    self._popup = popup;
    self.delayTasks.addTask('closePopup', ()=>self.close(), IENotification.timeout);
  }

  private _initPopup(popup:Window){
    let self = this;
    let bodyDiv = popup.document.getElementById('body-div');
    bodyDiv.innerText = self.body;
    let iconImg = <HTMLImageElement>popup.document.getElementById('icon-img');
    document.title = appendBlankForTitle(self.title);
    iconImg.src = self.icon;
    popup.focus();
  }

  static initContentInPopup(popup:Window){
    popup.dialogArguments._initPopup(popup);
  }

  //We don't need to implement this, just compatible with formal API
  static requestPermission(callback:Function){
    callback('granted');
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

function appendBlankForTitle(title:string):string {
  let ret = [title];
  for (let i = 0; i < 40; i++) {
    ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
  }
  return ret.join('');
}


function syncWindowPosition(win1:Window, win2:Window){
  let x = win1.screenX;
  let y = win1.screenY;
  win2.moveTo(x+5, y+5);
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

if (!window.Notification){
  window.Notification = IENotification;
}