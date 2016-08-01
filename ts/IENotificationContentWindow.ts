import {IDialog, IWindow} from './WindowUtils';

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