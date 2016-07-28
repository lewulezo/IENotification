"use strict";
var IENotification_1 = require('./IENotification');
var IENotificationQueue;
(function (IENotificationQueue) {
    var maxQueueSize = 20;
    var popupQueue = [];
    var currentNoti;
    function add(noti) {
        if (popupQueue.length > maxQueueSize) {
            return;
        }
        noti.on(IENotification_1.EVENT_OPEN, function () { return currentNoti = noti; });
        noti.on(IENotification_1.EVENT_DISPOSE, function () {
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
})(IENotificationQueue = exports.IENotificationQueue || (exports.IENotificationQueue = {}));
//# sourceMappingURL=IENotificationQueue.js.map