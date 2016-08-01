'use strict';
declare interface Window{
  showModelessDialog(url:string, title:string, option:string);
  notificationHost;
}

module IENotificationHelper {

  /**
   * this function is used in bridge.html
   */
  // export function openPopup() {
  //   try {
  //     let title = getUrlParameter('title');
  //     let height = 125;
  //     let width = screen.width * 0.2 + 5;
  //     let left = screen.width - width;
  //     let top = screen.height - height;
  //     let popup = window.showModelessDialog(`content.html${location.search}`, title, 
  //       `dialogWidth:${width}px;dialogHeight:${height}px;dialogTop:${top}px;dialogLeft:${left}px;center:0;resizable:0;scroll:0;status:0;alwaysRaised=yes`);
  //     let notification = window.notificationHost;
  //     notification.popup = popup;
  //   } catch (error) {
  //     console.log("open popup failed...");
  //     console.log(error);
  //   }
  //   window.setTimeout(()=>window.close(), 100);
  // }


  /**
   * this function is used in popup.html
   */
  export function initContent() {
    let title = getUrlParameter('title');
    let body = getUrlParameter('body');
    let icon = getUrlParameter('icon');
    let bodyDiv = document.getElementById('body-div');
    bodyDiv.innerText = body;
    let iconImg = <HTMLImageElement>document.getElementById('icon-img');
    document.title = appendBlankForTitle(title);
    iconImg.src = icon;
  }


  function genID():string{
    return Date.now() + '-' + Math.floor((1 + Math.random()) * 0x10000);
  }

  function getUrlParameter(paramName:string, url = location.search): string {
    url = url.substring(1);
    let value = null;
    url.split('&').some(paramsStr => {
      let nameValueArr = paramsStr.split('=');
      let pName = nameValueArr[0];
      if (pName == paramName) {
        value = nameValueArr[1];
        return true;
      }
    });
    return value;
  }

  function appendBlankForTitle(title:string):string {
    let ret = [title];
    for (let i = 0; i < 40; i++) {
      ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
    }
    return ret.join('');
  }
}
