'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable = (function () {
    function Observable() {
        var self = this;
        self.listeners = {};
        self.addEventListener.bind(self);
        self.removeEventListener.bind(self);
        self.dispatchEvent.bind(self);
        self.fire.bind(self);
        self.on.bind(self);
        self.un.bind(self);
    }
    Observable.prototype.addEventListener = function (eventName, func) {
        var handlers = this.listeners[eventName];
        if (handlers) {
            handlers.push(func);
        }
        else {
            handlers = [func];
            this.listeners[eventName] = handlers;
        }
    };
    Observable.prototype.removeEventListener = function (eventName, func) {
        var handlers = this.listeners[eventName];
        if (handlers) {
            var index = handlers.indexOf(func);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    };
    Observable.prototype.dispatchEvent = function (eventName) {
        var self = this;
        var handlers = self.listeners[eventName];
        var evt = new ObjectEvent(eventName);
        if (handlers) {
            handlers.some(function (func) {
                try {
                    func.call(self, evt);
                    if (evt.stop) {
                        return true;
                    }
                }
                catch (error) {
                    console.log("Error in dispatchEvent " + eventName + "..." + error.message);
                    if (evt.stopWhenError) {
                        return true;
                    }
                }
            });
        }
    };
    Observable.prototype.fire = function (eventName) {
        this.dispatchEvent(eventName);
    };
    Observable.prototype.on = function (eventName, func) {
        this.addEventListener(eventName, func);
    };
    Observable.prototype.un = function (eventName, func) {
        this.removeEventListener(eventName, func);
    };
    return Observable;
}());
var ObjectEvent = (function () {
    function ObjectEvent(name) {
        this.name = name;
        this.stop = false;
        this.stopWhenError = true;
    }
    return ObjectEvent;
}());
var DelayTasks = (function () {
    function DelayTasks() {
        this.tasks = {};
    }
    DelayTasks.prototype.addTask = function (taskName, func, delay) {
        this.tasks[taskName] = setTimeout(func, delay);
    };
    DelayTasks.prototype.endTask = function (taskName) {
        clearTimeout(this.tasks[taskName]);
        delete this.tasks[taskName];
    };
    DelayTasks.prototype.endAllTasks = function () {
        var _this = this;
        Object.keys(this.tasks).forEach(function (taskName) { return _this.endTask(taskName); });
    };
    return DelayTasks;
}());
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
        self.delayTasks = new DelayTasks();
        IENotificationQueue.add(self);
    }
    IENotification.prototype.show = function () {
        var self = this;
        var height = 120;
        var width = screen.width * 0.2;
        var left = screen.width - width;
        var top = screen.height - height;
        var bridge = window.open(IENotification.rootPath + "bridge.html?title=" + self.title + "&body=" + self.body + "&icon=" + self.icon, "", "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left + ",center=0,resizable=0,scroll=0,status=0");
        bridge.notificationHost = self;
        self.fire(EVENT_OPEN);
    };
    IENotification.prototype.close = function () {
        var self = this;
        if (self._popup) {
            self._popup.close();
            self._popup = null;
        }
        console.log('close notification...');
    };
    IENotification.prototype.dispose = function () {
        var self = this;
        this.delayTasks.endAllTasks();
        self.fire(EVENT_DISPOSE);
    };
    Object.defineProperty(IENotification.prototype, "popup", {
        set: function (popup) {
            var self = this;
            self._popup = popup;
            popup.notificationHost = self;
            window.setTimeout(function () {
                popup.onclick = function (event) {
                    self._doClick(event);
                };
                popup.addEventListener('unload', function () { return self.dispose(); });
                popup.focus();
            }, 100);
            window.setTimeout(function () { return self.close(); }, IENotification.timeout);
        },
        enumerable: true,
        configurable: true
    });
    //We don't need to implement this, just compatible with formal API
    IENotification.requestPermission = function (callback) {
        callback('default');
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
    IENotification.rootPath = '';
    return IENotification;
}(Observable));
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
if (!window.Notification) {
    window.Notification = IENotification;
}
//# sourceMappingURL=IENotification.js.map