import Position from './Position';

export declare interface IWindow extends Window{
  open(url?: string, target?: string, features?: string, replace?: boolean): IWindow;
  Notification;
  IENotification;
  showModalDialog(dialog:string, varArgIn, varOptions);
  showModelessDialog(url:string, param:any, options:string): IDialog;
  lastPosition: Position;
}


export declare interface IDialog extends IWindow{
  dialogArguments:any;
  dialogLeft:string;
  dialogTop:string;
  dialogHeight:string;
  dialogWidth:string;
  fixedPosition: Position;
  IENotificationContentWindow;
}


export module WindowUtils{
  export function getDialogPosition(dialog:IDialog):Position{
    return new Position({
      x: pxToNumber(dialog.dialogLeft),
      y: pxToNumber(dialog.dialogTop),
      w: pxToNumber(dialog.dialogWidth),
      h: pxToNumber(dialog.dialogHeight)
    });
  }

  export function setDialogPosition(dialog:IDialog, pos:Position):void{
    if (getDialogPosition(dialog).equals(pos)){
      return;
    }
    dialog.dialogLeft = numberToPx(pos.x);
    dialog.dialogTop = numberToPx(pos.y);
    dialog.dialogWidth = numberToPx(pos.w);
    dialog.dialogHeight = numberToPx(pos.h);
  }

  export function fixDialogPosition(dialog:IDialog):void{
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

  export function onDialogMoved(dialog:IDialog, handler:Function):void{
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

  export function hideWindowBehindDialog(wnd:IWindow, dialog:IDialog){
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

  export function forceFocus(){
    window.open("about:blank").close();
    window.focus();
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

}
