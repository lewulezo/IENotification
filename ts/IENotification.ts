import Position from './Position';
import Observable from './Observable';
import DelayTasks from './DelayTasks';
import IENotificationQueue from './IENotificationQueue';

declare interface IWindow extends Window{
  open(url?: string, target?: string, features?: string, replace?: boolean): IWindow;
  Notification;
  IENotification;
  showModalDialog(dialog:string, varArgIn, varOptions);
  showModelessDialog(url:string, param:any, options:string): IDialog;
  lastPosition: Position;
}


declare interface IDialog extends IWindow{
  dialogArguments:any;
  dialogLeft:string;
  dialogTop:string;
  dialogHeight:string;
  dialogWidth:string;
  fixedPosition: Position;
}

declare class Promise<T>{
  constructor(callback:(resolve:(T)=>void, reject:Function)=>void);
}

declare var window:IWindow;

//-------------------------------------------------------------------------------

const EVENT_OPEN = 'OPEN';
const EVENT_DISPOSE = 'DISPOSE';


export default class IENotification extends Observable{
  title: string;
  body: string;
  icon: string;
  data: string;
  onclick: Function;
  private _popup: IDialog;
  private _bridge: Window;
  delayTasks: DelayTasks;
  closed: boolean;

  static timeout = 20000;
  public static basePath;
  public static notificationPath;
  public static notificationHeight = 90;
  public static notificationWidth = 360;
  public static edgeX = 5;
  public static edgeY = 20;

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
    self.closed = false;
    IENotificationQueue.add(self);
  }

  show():void{
    let self = this;
    let height = IENotification.notificationHeight;
    let width = IENotification.notificationWidth;
    let left = screen.width - width;
    let top = screen.height - height;
    let bridge:IWindow = window.open(`${IENotification.notificationPath}bridge.html`, self.title, 
    `width=${width},height=${height},top=${top},left=${left},center=0,resizable=0,scroll=0,status=0,location=0`);

    self._bridge = bridge;
    self.delayTasks.addTask('initBridge', ()=> {
      self._initBridge(bridge);
    }, 10);
    
    self.fire(EVENT_OPEN);
    window.addEventListener('unload', ()=>self.close());    
  }
  
  public close():void{
    let self = this;
    if (self.closed){
      return;        
    }
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
    if (self.closed){
      return;        
    }
    this.delayTasks.endAllTasks();
    if (self._bridge){
      self._bridge.close();
    }
    self.fire(EVENT_DISPOSE);
    self.closed = true;    
    console.log('close notification...');
  }


  private _initBridge(bridge:IWindow){
    let self = this;
    let height = IENotification.notificationHeight + IENotification.edgeY;
    let width = IENotification.notificationWidth + IENotification.edgeX;
    let left = screen.width - width;
    let top = screen.height - height;

    let popup = bridge.showModelessDialog(`content.html`, self, 
      `dialogWidth:${width}px;dialogHeight:${height}px;dialogTop:${top}px;dialogLeft:${left}px;center:0;resizable:0;scroll:0;status:0;alwaysRaised=yes`);
    self._popup = popup;
    // self.delayTasks.addRepeatTask('fixDialogPosition', ()=>fixDialogPosition(popup), 100);
    setDialogPosition(popup, getDialogPosition(popup));
    bridge.addEventListener('unload', ()=>self.close());

    self.delayTasks.addRepeatTask('fixBridgePosition', ()=>hideWindowBehindDialog(bridge, popup), 100);
    self.delayTasks.addRepeatTask('hideDialogAfterMove', ()=>onDialogMoved(popup, ()=>self.close()), 100);
    self.delayTasks.addTask('closePopup', ()=>self.close(), IENotification.timeout);
  }

  private _initPopup(popup:IDialog){
    let self = this;
    let titleDiv = popup.document.getElementById('title-div');
    titleDiv.innerHTML = self.title;
    let bodyDiv = popup.document.getElementById('body-div');
    bodyDiv.innerText = self.body;
    let iconImg = <HTMLImageElement>popup.document.getElementById('icon-img');
    popup.document.title = appendBlankForTitle('');
    iconImg.src = self.icon.indexOf('data:image/png;base64') == 0 ? self.icon : IENotification.basePath + self.icon;

    popup.addEventListener('click', (event)=>self._doClick(event));
    popup.addEventListener('unload', ()=>self.dispose());
    popup.focus();
  }

  static initContentInPopup(popup:IDialog){
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

function getDialogPosition(dialog:IDialog):Position{
  return new Position({
    x: pxToNumber(dialog.dialogLeft),
    y: pxToNumber(dialog.dialogTop),
    w: pxToNumber(dialog.dialogWidth),
    h: pxToNumber(dialog.dialogHeight)
  });
}

function setDialogPosition(dialog:IDialog, pos:Position):void{
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

function fixDialogPosition(dialog:IDialog):void{
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

function onDialogMoved(dialog:IDialog, handler:Function):void{
  if (!dialog){
    return;
  }
  try {
    let pos = getDialogPosition(dialog);
    if (!dialog.lastPosition){
      dialog.lastPosition = pos;
      return;
    }
    if (dialog.lastPosition.equals(pos)){
      return;
    }
    handler();
  } catch (e){
    //do nothing here
  }
}

function hideWindowBehindDialog(wnd:IWindow, dialog:IDialog){
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

