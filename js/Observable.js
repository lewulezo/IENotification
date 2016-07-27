"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Observable;
var ObjectEvent = (function () {
    function ObjectEvent(name) {
        this.name = name;
        this.stop = false;
        this.stopWhenError = true;
    }
    return ObjectEvent;
}());
//# sourceMappingURL=Observable.js.map