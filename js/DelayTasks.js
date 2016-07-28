"use strict";
var DelayTasks = (function () {
    function DelayTasks() {
        this.tasks = {};
    }
    DelayTasks.prototype.addTask = function (taskName, func, delay, repeat) {
        if (repeat === void 0) { repeat = false; }
        var self = this;
        if (repeat) {
            self.addRepeatTask(taskName, func, delay);
        }
        else {
            self.addSimpleTask(taskName, func, delay);
        }
    };
    DelayTasks.prototype.addSimpleTask = function (taskName, func, delay) {
        var self = this;
        self.tasks[taskName] = setTimeout(function () {
            self.endTask(taskName);
            func();
        }, delay);
    };
    DelayTasks.prototype.addRepeatTask = function (taskName, func, delay) {
        var self = this;
        self.tasks[taskName] = -setInterval(func, delay);
    };
    DelayTasks.prototype.addAwaitingTask = function (taskName, func, waitingFunc, delay) {
        var self = this;
        self.addRepeatTask(taskName, function () {
            if (waitingFunc()) {
                self.endTask(taskName);
                func();
            }
        }, delay);
    };
    DelayTasks.prototype.getTaskNames = function () {
        return Object.keys(this.tasks);
    };
    DelayTasks.prototype.endTask = function (taskName) {
        var id = this.tasks[taskName];
        if (id > 0) {
            clearTimeout(id);
        }
        else {
            clearInterval(-id);
        }
        delete this.tasks[taskName];
    };
    DelayTasks.prototype.endAllTasks = function () {
        var _this = this;
        this.getTaskNames().forEach(function (taskName) { return _this.endTask(taskName); });
    };
    return DelayTasks;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DelayTasks;
//# sourceMappingURL=DelayTasks.js.map