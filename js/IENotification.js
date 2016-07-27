'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Position_1 = require('./Position');
var Observable_1 = require('./Observable');
var DelayTasks_1 = require('./DelayTasks');
var ienotification;
(function (ienotification) {
    //-------------------------------------------------------------------------------
    var EVENT_OPEN = 'OPEN';
    var EVENT_DISPOSE = 'DISPOSE';
    var IENotification = (function (_super) {
        __extends(IENotification, _super);
        function IENotification(title, options) {
            _super.call(this);
            var self = this;
            self.title = title;
            if (options) {
                self.body = options.body;
                self.icon = options.icon;
                self.data = options.data;
            }
            self.delayTasks = new DelayTasks_1.default();
            self.closed = false;
            IENotificationQueue.add(self);
        }
        IENotification.prototype.show = function () {
            var self = this;
            var height = IENotification.notificationHeight;
            var width = IENotification.notificationWidth;
            var left = screen.width - width;
            var top = screen.height - height;
            var bridge = window.open(IENotification.notificationPath + "bridge.html", self.title, "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left + ",center=0,resizable=0,scroll=0,status=0,location=0");
            self._bridge = bridge;
            self.delayTasks.addTask('initBridge', function () {
                self._initBridge(bridge);
            }, 10);
            self.fire(EVENT_OPEN);
            window.addEventListener('unload', function () { return self.close(); });
        };
        IENotification.prototype.close = function () {
            var self = this;
            if (self.closed) {
                return;
            }
            if (self._bridge) {
                self._bridge.close();
                self._bridge = null;
            }
            if (self._popup) {
                self._popup.close();
                self._popup = null;
            }
        };
        IENotification.prototype.dispose = function () {
            var self = this;
            if (self.closed) {
                return;
            }
            this.delayTasks.endAllTasks();
            if (self._bridge) {
                self._bridge.close();
            }
            self.fire(EVENT_DISPOSE);
            self.closed = true;
            console.log('close notification...');
        };
        IENotification.prototype._initBridge = function (bridge) {
            var self = this;
            var height = IENotification.notificationHeight + IENotification.edgeY;
            var width = IENotification.notificationWidth + IENotification.edgeX;
            var left = screen.width - width;
            var top = screen.height - height;
            var popup = bridge.showModelessDialog("content.html", self, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;dialogTop:" + top + "px;dialogLeft:" + left + "px;center:0;resizable:0;scroll:0;status:0;alwaysRaised=yes");
            self._popup = popup;
            // self.delayTasks.addRepeatTask('fixDialogPosition', ()=>fixDialogPosition(popup), 100);
            setDialogPosition(popup, getDialogPosition(popup));
            bridge.addEventListener('unload', function () { return self.close(); });
            self.delayTasks.addRepeatTask('fixBridgePosition', function () { return hideWindowBehindDialog(bridge, popup); }, 100);
            self.delayTasks.addRepeatTask('hideDialogAfterMove', function () { return onDialogMoved(popup, function () { return self.close(); }); }, 100);
            self.delayTasks.addTask('closePopup', function () { return self.close(); }, IENotification.timeout);
        };
        IENotification.prototype._initPopup = function (popup) {
            var self = this;
            var titleDiv = popup.document.getElementById('title-div');
            titleDiv.innerHTML = self.title;
            var bodyDiv = popup.document.getElementById('body-div');
            bodyDiv.innerText = self.body;
            var iconImg = popup.document.getElementById('icon-img');
            popup.document.title = appendBlankForTitle('');
            iconImg.src = self.icon.indexOf('data:image/png;base64') == 0 ? self.icon : IENotification.basePath + self.icon;
            popup.addEventListener('click', function (event) { return self._doClick(event); });
            popup.addEventListener('unload', function () { return self.dispose(); });
            popup.focus();
        };
        IENotification.initContentInPopup = function (popup) {
            popup.dialogArguments._initPopup(popup);
        };
        //We don't need to implement this, just compatible with formal API
        IENotification.requestPermission = function (callback) {
            if (callback && callback instanceof Function) {
                callback('granted');
            }
            else {
                return new Promise(function (res, rej) {
                    res('granted');
                });
            }
        };
        IENotification.prototype._doClick = function (event) {
            var self = this;
            event['notification'] = self;
            if (self.onclick instanceof Function) {
                self.onclick(event);
            }
            self.close();
            window.focus();
        };
        IENotification.timeout = 20000;
        IENotification.notificationHeight = 90;
        IENotification.notificationWidth = 360;
        IENotification.edgeX = 5;
        IENotification.edgeY = 20;
        return IENotification;
    }(Observable_1.default));
    function getDialogPosition(dialog) {
        return new Position_1.default({
            x: pxToNumber(dialog.dialogLeft),
            y: pxToNumber(dialog.dialogTop),
            w: pxToNumber(dialog.dialogWidth),
            h: pxToNumber(dialog.dialogHeight)
        });
    }
    function setDialogPosition(dialog, pos) {
        if (getDialogPosition(dialog).equals(pos)) {
            return;
        }
        dialog.dialogLeft = numberToPx(pos.x);
        dialog.dialogTop = numberToPx(pos.y);
        dialog.dialogWidth = numberToPx(pos.w);
        dialog.dialogHeight = numberToPx(pos.h);
    }
    function appendBlankForTitle(title) {
        var ret = [title];
        for (var i = 0; i < 40; i++) {
            ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
        }
        return ret.join('');
    }
    function fixDialogPosition(dialog) {
        if (!dialog) {
            return;
        }
        try {
            if (!dialog.fixedPosition) {
                dialog.fixedPosition = getDialogPosition(dialog);
                return;
            }
            setDialogPosition(dialog, dialog.fixedPosition);
        }
        catch (e) {
        }
    }
    function onDialogMoved(dialog, handler) {
        if (!dialog) {
            return;
        }
        try {
            var pos = getDialogPosition(dialog);
            if (!dialog.lastPosition) {
                dialog.lastPosition = pos;
                return;
            }
            if (dialog.lastPosition.equals(pos)) {
                return;
            }
            handler();
        }
        catch (e) {
        }
    }
    function hideWindowBehindDialog(wnd, dialog) {
        if (!dialog) {
            return;
        }
        try {
            var dialogPos = getDialogPosition(dialog);
            if (wnd.lastPosition && wnd.lastPosition.equals(dialogPos)) {
                return;
            }
            wnd.moveTo(dialogPos.x + 20, dialogPos.y + 20);
            wnd.resizeTo(dialogPos.w - 20, dialogPos.h - 20);
            wnd.lastPosition = dialogPos;
        }
        catch (e) {
        }
    }
    function pxToNumber(str) {
        if (str.length < 2) {
            return 0;
        }
        return Number(str.substring(0, str.length - 2));
    }
    function numberToPx(num) {
        return num + 'px';
    }
    var IENotificationQueue;
    (function (IENotificationQueue) {
        var maxQueueSize = 20;
        var popupQueue = [];
        var currentNoti;
        function add(noti) {
            if (popupQueue.length > maxQueueSize) {
                return;
            }
            noti.on(EVENT_OPEN, function () { return currentNoti = noti; });
            noti.on(EVENT_DISPOSE, function () {
                currentNoti = null;
                remove(noti);
            });
            if (isEmpty() && !currentNoti) {
                noti.show();
            }
            else {
                popupQueue.push(noti);
            }
        }
        IENotificationQueue.add = add;
        function remove(noti) {
            arrayRemove(popupQueue, noti);
            if (!isEmpty()) {
                window.setTimeout(function () { return popupQueue.pop().show(); }, 200);
            }
        }
        function isEmpty() {
            return popupQueue.length == 0;
        }
        function arrayRemove(arr, item) {
            var index = arr.indexOf(item);
            if (index > -1) {
                arr.splice(index, 1);
            }
        }
    })(IENotificationQueue || (IENotificationQueue = {}));
    function syncWindowPosition(targetWin, refWin, offset) {
        if (offset === void 0) { offset = { x: 0, y: 0 }; }
        try {
            var x = refWin.screenX + offset.x;
            var y = refWin.screenY + offset.y;
            if (targetWin.screenX != x || targetWin.screenY != y) {
                targetWin.moveTo(x, y);
            }
        }
        catch (e) {
        }
    }
    function getDefaultRootPath() {
        var queryStr = window.location.search;
        var urlStr = window.location.href;
        var path = urlStr.substr(0, urlStr.length - queryStr.length);
        return path.substring(0, path.lastIndexOf('/')) + '/';
    }
    IENotification.basePath = getDefaultRootPath();
    IENotification.notificationPath = IENotification.basePath + "IENotification/";
    if (!window.Notification) {
        window.Notification = window.IENotification = IENotification;
    }
})(ienotification || (ienotification = {}));
//# sourceMappingURL=IENotification.js.map