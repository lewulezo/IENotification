import { IENotification, EVENT_OPEN, EVENT_DISPOSE } from './IENotification';

export module IENotificationQueue{
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
    //avoid if a notification throw exception and never fire dispose event, it will block all other notifications.
    window.setTimeout(()=>{
      if (currentNoti == noti && !noti.closed){
        currentNoti = null;
        remove(noti);
      }
    }, IENotification.timeout);
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