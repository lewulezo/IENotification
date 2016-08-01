
export declare class Promise<T>{
  constructor(callback:(resolve:(T)=>void, reject:Function)=>void);
}

import Observable from './Observable';
import DelayTasks from './DelayTasks';
import {IENotificationQueue} from './IENotificationQueue';
import {IWindow, IDialog, WindowUtils} from './WindowUtils';

declare var window:IWindow;
//-------------------------------------------------------------------------------

export const EVENT_OPEN = 'OPEN';
export const EVENT_DISPOSE = 'DISPOSE';


export class IENotification extends Observable{
  public title: string;
  public body: string;
  public icon: string;
  public data: string;
  public onclick: Function;
  private _popup: IDialog;
  private _bridge: Window;
  private _delayTasks: DelayTasks;
  protected closed: boolean;

  public static timeout = 20000;
  public static basePath = '';
  public static notificationPath = '';
  public static notificationHeight = 90;
  public static notificationWidth = 360;
  public static edgeX = 5;
  public static edgeY = 20;

  constructor(title:string, options:{body:string, icon:string, data:string}){
    super();
    let self = this;
    self.title = title;
    if (options){
      self.body = options.body || '';
      self.icon = options.icon || '';
      self.data = options.data || '';
    }
    self._delayTasks = new DelayTasks();
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
    self._delayTasks.addTask('initBridge', ()=> {
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

  private _dispose():void{
    let self = this;
    if (self.closed){
      return;
    }
    this._delayTasks.endAllTasks();
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
    WindowUtils.setDialogPosition(popup, WindowUtils.getDialogPosition(popup));
    self._delayTasks.addAwaitingTask('unloadBridge',
      ()=>bridge.addEventListener('unload', ()=>self.close()),
      ()=>bridge.addEventListener instanceof Function,
      100
    );

    self._delayTasks.addRepeatTask('fixBridgePosition', ()=>WindowUtils.hideWindowBehindDialog(bridge, popup), 100);
    self._delayTasks.addRepeatTask('hideDialogAfterMove', ()=>WindowUtils.onDialogMoved(popup, ()=>self.close()), 100);
    self._delayTasks.addTask('closePopup', ()=>self.close(), IENotification.timeout);
  }

  private _initPopupContent(popup:IDialog){
    let self = this;
    let titleDiv = popup.document.getElementById('title-div');
    titleDiv.innerHTML = self.title;
    let bodyDiv = popup.document.getElementById('body-div');
    bodyDiv.innerText = self.body;
    let iconImg = <HTMLImageElement>popup.document.getElementById('icon-img');
    popup.document.title = appendBlankForTitle('');
    iconImg.src = self.icon.indexOf('data:image/png;base64') == 0 ? self.icon : IENotification.basePath + self.icon;
  }

  initPopup(popup:IDialog){
    let self = this;
    self._initPopupContent(popup);
    popup.addEventListener('click', (event)=>self._doClick(event));
    popup.addEventListener('unload', ()=>self._dispose());
    popup.focus();
  }


  //We don't need to implement this, just compatible with formal API
  public static requestPermission(callback?:((string)=>any)){
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


function appendBlankForTitle(title:string):string {
  let ret = [title];
  for (let i = 0; i < 40; i++) {
    ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
  }
  return ret.join('');
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
