import {IDialog, IWindow} from './IENotification';

declare var window:IDialog;

export module IENotificationContentWindow{
  export function initContentInPopup(){
    let popup = window;
    popup.dialogArguments.initPopup(popup);
  }
}

if (window.IENotification && window.dialogArguments){
  window.IENotificationContentWindow = IENotificationContentWindow;
}