"use strict";
var Position = (function () {
    function Position(_a) {
        var _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.w, w = _d === void 0 ? 0 : _d, _e = _a.h, h = _e === void 0 ? 0 : _e;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    Position.prototype.equals = function (pos) {
        return this.x == pos.x && this.y == pos.y && this.w == pos.w && this.h == pos.h;
    };
    return Position;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Position;
//# sourceMappingURL=Position.js.map