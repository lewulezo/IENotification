'use strict';
var IENotificationHelper;
(function (IENotificationHelper) {
    /**
     * this function is used in bridge.html
     */
    function openPopup() {
        try {
            var title = getUrlParameter('title');
            var path = getUrlParameter('path');
            var height = 125;
            var width = screen.width * 0.2 + 5;
            var left = screen.width - width;
            var top_1 = screen.height - height;
            var popup = window.showModelessDialog(path + "content.html" + location.search, title, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;dialogTop:" + top_1 + "px;dialogLeft:" + left + "px;center:0;resizable:0;scroll:0;status:0;alwaysRaised=yes");
            var notification = window.notificationHost;
            notification.popup = popup;
        }
        catch (error) {
            console.log("open popup failed...");
            console.log(error);
        }
        window.setTimeout(function () { return window.close(); }, 100);
    }
    IENotificationHelper.openPopup = openPopup;
    /**
     * this function is used in popup.html
     */
    function initContent() {
        var title = getUrlParameter('title');
        var body = getUrlParameter('body');
        var icon = getUrlParameter('icon');
        var bodyDiv = document.getElementById('body-div');
        bodyDiv.innerText = body;
        var iconImg = document.getElementById('icon-img');
        document.title = appendBlankForTitle(title);
        iconImg.src = icon;
    }
    IENotificationHelper.initContent = initContent;
    function genID() {
        return Date.now() + '-' + Math.floor((1 + Math.random()) * 0x10000);
    }
    function getUrlParameter(paramName, url) {
        if (url === void 0) { url = location.search; }
        url = url.substring(1);
        var value = null;
        url.split('&').some(function (paramsStr) {
            var nameValueArr = paramsStr.split('=');
            var pName = nameValueArr[0];
            if (pName == paramName) {
                value = nameValueArr[1];
                return true;
            }
        });
        return value;
    }
    function appendBlankForTitle(title) {
        var ret = [title];
        for (var i = 0; i < 40; i++) {
            ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
        }
        return ret.join('');
    }
})(IENotificationHelper || (IENotificationHelper = {}));
//# sourceMappingURL=IENotificationHelper.js.map