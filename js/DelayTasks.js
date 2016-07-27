"use strict";
var DelayTasks = (function () {
    function DelayTasks() {
        this.tasks = {};
    }
    DelayTasks.prototype.addTask = function (taskName, func, delay, repeat) {
        if (repeat === void 0) { repeat = false; }
        if (repeat) {
            this.tasks[taskName] = -setInterval(func, delay);
        }
        else {
            this.tasks[taskName] = setTimeout(func, delay);
        }
    };
    DelayTasks.prototype.addRepeatTask = function (taskName, func, delay) {
        this.addTask(taskName, func, delay, true);
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
        Object.keys(this.tasks).forEach(function (taskName) { return _this.endTask(taskName); });
    };
    return DelayTasks;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DelayTasks;
//# sourceMappingURL=DelayTasks.js.map