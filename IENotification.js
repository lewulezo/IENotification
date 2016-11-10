/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(12);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var utils_1 = __webpack_require__(2);
	var _1 = __webpack_require__(8);
	//-------------------------------------------------------------------------------
	exports.EVENT_OPEN = 'OPEN';
	exports.EVENT_DISPOSE = 'DISPOSE';
	var IENotification = (function (_super) {
	    __extends(IENotification, _super);
	    function IENotification(title, options) {
	        _super.call(this);
	        var self = this;
	        self.title = title;
	        if (options) {
	            self.body = options.body || '';
	            self.icon = options.icon || '';
	            self.data = options.data || '';
	        }
	        self._delayTasks = new utils_1.DelayTasks();
	        self.closed = false;
	        _1.IENotificationQueue.add(self);
	    }
	    IENotification.prototype.show = function () {
	        var self = this;
	        var height = IENotification.notificationHeight;
	        var width = IENotification.notificationWidth;
	        var left = screen.width - width;
	        var top = screen.height - height;
	        var bridge = window.open(IENotification.notificationPath + "bridge.html", self.title, "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left + ",center=0,resizable=0,scroll=0,status=0,location=0");
	        self._bridge = bridge;
	        self._delayTasks.addTask('initBridge', function () {
	            self._initBridge(bridge);
	        }, 10);
	        self.fire(exports.EVENT_OPEN);
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
	    IENotification.prototype._dispose = function () {
	        var self = this;
	        if (self.closed) {
	            return;
	        }
	        this._delayTasks.endAllTasks();
	        if (self._bridge) {
	            self._bridge.close();
	        }
	        self.fire(exports.EVENT_DISPOSE);
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
	        _1.WindowUtils.setDialogPosition(popup, _1.WindowUtils.getDialogPosition(popup));
	        self._delayTasks.addAwaitingTask('unloadBridge', function () { return bridge.addEventListener('unload', function () { return self.close(); }); }, function () { return bridge.addEventListener instanceof Function; }, 100);
	        self._delayTasks.addRepeatTask('fixBridgePosition', function () { return _1.WindowUtils.hideWindowBehindDialog(bridge, popup); }, 100);
	        self._delayTasks.addRepeatTask('hideDialogAfterMove', function () { return _1.WindowUtils.onDialogMoved(popup, function () { return self.close(); }); }, 100);
	        self._delayTasks.addTask('closePopup', function () { return self.close(); }, IENotification.timeout);
	    };
	    IENotification.prototype._initPopupContent = function (popup) {
	        var self = this;
	        var titleDiv = popup.document.getElementById('title-div');
	        titleDiv.innerHTML = self.title;
	        var bodyDiv = popup.document.getElementById('body-div');
	        bodyDiv.innerText = self.body;
	        var iconImg = popup.document.getElementById('icon-img');
	        popup.document.title = appendBlankForTitle('');
	        iconImg.src = self.icon.indexOf('data:image/png;base64') == 0 ? self.icon : IENotification.basePath + self.icon;
	    };
	    IENotification.prototype.initPopup = function (popup) {
	        var self = this;
	        self._initPopupContent(popup);
	        popup.addEventListener('click', function (event) { return self._doClick(event); });
	        popup.addEventListener('unload', function () { return self._dispose(); });
	        popup.focus();
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
	        _1.WindowUtils.forceFocus();
	    };
	    IENotification.timeout = 20000;
	    IENotification.basePath = '';
	    IENotification.notificationPath = '';
	    IENotification.notificationHeight = 90;
	    IENotification.notificationWidth = 360;
	    IENotification.edgeX = 5;
	    IENotification.edgeY = 20;
	    return IENotification;
	}(utils_1.Observable));
	exports.IENotification = IENotification;
	function appendBlankForTitle(title) {
	    var ret = [title];
	    for (var i = 0; i < 40; i++) {
	        ret.push('\u00A0\u00A0\u00A0\u00A0\u00A0');
	    }
	    return ret.join('');
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(3));
	__export(__webpack_require__(6));
	__export(__webpack_require__(7));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var SerializerRegistry_1 = __webpack_require__(4);
	var uuid_1 = __webpack_require__(5);
	var SerializeContext = (function () {
	    function SerializeContext() {
	        this._items = [];
	    }
	    SerializeContext.prototype.putOrigObj = function (id, origObj) {
	        var item = this.getById(id);
	        if (item) {
	            item.origObj = origObj;
	        }
	        else {
	            this._items.push({ id: id, origObj: origObj });
	        }
	    };
	    SerializeContext.prototype.putConvObj = function (id, convObj) {
	        var item = this.getById(id);
	        if (item) {
	            item.convObj = convObj;
	        }
	        else {
	            this._items.push({ id: id, convObj: convObj });
	        }
	    };
	    SerializeContext.prototype.forEach = function (callback) {
	        this._items.forEach(function (item) { return callback(item.id, item.origObj, item.convObj); });
	    };
	    SerializeContext.prototype.getById = function (id) {
	        var result = null;
	        this._items.some(function (item) {
	            if (item.id == id) {
	                result = item;
	                return true;
	            }
	        });
	        return result;
	    };
	    SerializeContext.prototype.getByOrigObj = function (obj) {
	        var result = null;
	        this._items.some(function (item) {
	            if (item.origObj === obj) {
	                result = item;
	                return true;
	            }
	        });
	        return result;
	    };
	    return SerializeContext;
	}());
	var Serializer = (function () {
	    function Serializer() {
	    }
	    Serializer.serialize = function (object) {
	        var context = new SerializeContext();
	        var mainId = serializeSingleObject(object, context);
	        var outputObj = { main: mainId };
	        context.forEach(function (id, srcObj, tgtObj) {
	            outputObj[id] = tgtObj;
	        });
	        return JSON.stringify(outputObj);
	    };
	    Serializer.deserialize = function (str) {
	        var context = new SerializeContext();
	        var inputObj = JSON.parse(str);
	        var refArray = [];
	        var mainObjId = inputObj.main;
	        delete inputObj.main;
	        Object.keys(inputObj).forEach(function (key) {
	            var serialObj = inputObj[key];
	            context.putConvObj(key, serialObj);
	            var obj = deserializeSingleObj(serialObj, refArray);
	            context.putOrigObj(key, obj);
	        });
	        refArray.forEach(function (ref) {
	            ref.self[ref.field] = context.getById(ref.refId).origObj;
	        });
	        return (context.getById(mainObjId).origObj);
	    };
	    return Serializer;
	}());
	exports.Serializer = Serializer;
	//functions for serialize -----------------------------------------------------------
	function serializeSingleObject(object, context) {
	    if (!isSerializable(object)) {
	        return '';
	    }
	    var objId = genId(context);
	    context.putOrigObj(objId, object);
	    var dataObj;
	    if (object['serialize'] instanceof Function) {
	        var serialStr = object['serialize']();
	        dataObj = JSON.parse(serialStr);
	    }
	    else {
	        dataObj = {};
	        Object.keys(object).forEach(function (field) {
	            if (!isFieldSerializable(object, field)) {
	                return;
	            }
	            dataObj[field] = convertValueForSerialize(object[field], context);
	        });
	    }
	    var reg = SerializerRegistry_1.SerializerRegistry.getClassRegistration(object.constructor);
	    var tgtObj = { "class": reg.name, "data": dataObj };
	    context.putConvObj(objId, tgtObj);
	    return objId;
	}
	function genId(context) {
	    var id;
	    while (!id || context.getById(id) != null) {
	        id = uuid_1.uuid();
	    }
	    return id;
	}
	function convertValueForSerialize(value, context) {
	    if (typeof value == 'object') {
	        var contextItem = context.getByOrigObj(value);
	        if (contextItem) {
	            return { refId: contextItem.id };
	        }
	        else {
	            return { refId: serializeSingleObject(value, context) };
	        }
	    }
	    else {
	        return value;
	    }
	}
	function isFieldSerializable(object, field) {
	    var value = object[field];
	    var reg = SerializerRegistry_1.SerializerRegistry.getClassRegistration(object.constructor);
	    if (value === null || value === undefined) {
	        return false;
	    }
	    if (reg.ignoredFields.indexOf(field) != -1) {
	        return false;
	    }
	    if (typeof value === 'function') {
	        return false;
	    }
	    if (typeof value === 'object') {
	        if (value instanceof Array) {
	            return true;
	        }
	        if (value.constructor === Object) {
	            return true;
	        }
	        if (!isSerializable(value)) {
	            return false;
	        }
	    }
	    return true;
	}
	function isSerializable(object) {
	    return SerializerRegistry_1.SerializerRegistry.getClassRegistration(object.constructor) != null;
	}
	function deserializeSingleObj(serialObj, refArray) {
	    var reg = SerializerRegistry_1.SerializerRegistry.getClassRegistration(serialObj['class']) || SerializerRegistry_1.defaultClassRegistration;
	    var obj;
	    if (serialObj.class == 'Object') {
	        obj = {};
	    }
	    else if (serialObj.class == 'Array') {
	        obj = [];
	    }
	    else {
	        obj = createObject(reg.clazz);
	    }
	    if (obj['deserialize'] instanceof Function) {
	        obj.deserialize(JSON.stringify(serialObj.data));
	    }
	    else {
	        Object.keys(serialObj.data).forEach(function (field) {
	            var value = serialObj.data[field];
	            if (typeof value == 'object') {
	                refArray.push({ self: obj, field: field, refId: value.refId });
	            }
	            else {
	                obj[field] = value;
	            }
	        });
	    }
	    return obj;
	}
	function createObject(clazz) {
	    var obj = Object.create(clazz.prototype);
	    Object.defineProperty(obj, 'constructor', {
	        value: clazz,
	        enumerable: false
	    });
	    return obj;
	}
	//functions for decorators ---------------------------------------------------------
	function Serializable(name, ignoreFields) {
	    return function (constructor) {
	        SerializerRegistry_1.SerializerRegistry.registerClass(constructor, name, ignoreFields);
	    };
	}
	exports.Serializable = Serializable;
	function transiant(target, fieldName) {
	    SerializerRegistry_1.SerializerRegistry.registerTransiantField(target.constructor, fieldName);
	}
	exports.transiant = transiant;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Serializer;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var uuid_1 = __webpack_require__(5);
	var classRegistry = {};
	var SerializerRegistry = (function () {
	    function SerializerRegistry() {
	    }
	    SerializerRegistry.registerClass = function (clazz, name, ignoreFields) {
	        return registerClass(clazz, name, ignoreFields);
	    };
	    SerializerRegistry.registerTransiantField = function (clazz, fieldName) {
	        return registerTransiantField(clazz, fieldName);
	    };
	    SerializerRegistry.getClassRegistration = function (clazz) {
	        return getClassRegistration(clazz);
	    };
	    return SerializerRegistry;
	}());
	exports.SerializerRegistry = SerializerRegistry;
	var ClassRegistration = (function () {
	    function ClassRegistration(name, clazz, ignoredFields) {
	        if (ignoredFields === void 0) { ignoredFields = []; }
	        this.name = name;
	        this.clazz = clazz;
	        this.ignoredFields = ignoredFields;
	        this.anonymous = false;
	    }
	    return ClassRegistration;
	}());
	function registerClass(clazz, name, ignoredFields) {
	    var reg = getClassRegistration(clazz);
	    if (!reg) {
	        var anonymous = false;
	        if (!name) {
	            name = generateAnonymousClassRegName(clazz);
	            anonymous = true;
	        }
	        reg = new ClassRegistration(name, clazz, ignoredFields);
	        reg.anonymous = anonymous;
	        classRegistry[name] = reg;
	    }
	    else if (reg.anonymous) {
	        if (name) {
	            var tempName = reg.name;
	            reg.name = name;
	            classRegistry[name] = reg;
	            delete classRegistry[tempName];
	        }
	    }
	    mergeArrayField(reg, 'ignoreFields', ignoredFields);
	    return reg;
	}
	function registerTransiantField(clazz, fieldName) {
	    var reg = getClassRegistration(clazz);
	    if (!reg) {
	        reg = registerClass(clazz);
	    }
	    if (reg.ignoredFields.indexOf(fieldName) == -1) {
	        reg.ignoredFields.push(fieldName);
	    }
	}
	function getClassRegistration(clazz) {
	    if (typeof clazz == 'string') {
	        var className = clazz;
	        return classRegistry[className];
	    }
	    else {
	        var retVal_1 = null;
	        Object.keys(classRegistry).some(function (name) {
	            var reg = classRegistry[name];
	            if (reg.clazz === clazz) {
	                retVal_1 = reg;
	                return true;
	            }
	        });
	        return retVal_1;
	    }
	}
	function generateAnonymousClassRegName(clazz) {
	    var funcName = clazz['name'];
	    if (!funcName) {
	        var funcName_1 = clazz.toString();
	        funcName_1 = funcName_1.substr(9);
	        funcName_1 = funcName_1.substr(0, funcName_1.indexOf('('));
	    }
	    return [funcName, Date.now(), uuid_1.uuid()].join('-');
	}
	function mergeArrayField(obj, field, arr) {
	    if (!arr) {
	        return;
	    }
	    var tgtArr = obj[field];
	    if (!tgtArr) {
	        tgtArr = [];
	        obj[field] = tgtArr;
	    }
	    arr.forEach(function (item) {
	        if (tgtArr.indexOf(item) == -1) {
	            tgtArr.push(item);
	        }
	    });
	}
	exports.defaultClassRegistration = new ClassRegistration('Object', Object);
	classRegistry[exports.defaultClassRegistration.name] = exports.defaultClassRegistration;
	classRegistry['Object'] = new ClassRegistration('Object', Object);
	classRegistry['Array'] = new ClassRegistration('Array', Array);


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	function uuid() {
	    var s = [];
	    var hexDigits = "0123456789abcdef";
	    for (var i = 0; i < 5; i++) {
	        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	    }
	    return s.join("");
	}
	exports.uuid = uuid;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var Observable = (function () {
	    function Observable() {
	        var self = this;
	        self.listeners = {};
	        self.fire = self.dispatchEvent.bind(self);
	        self.un = self.removeEventListener.bind(self);
	        self.on = self.addEventListener.bind(self);
	    }
	    Observable.prototype.addEventListener = function (eventName, handler) {
	        var handlers = this.listeners[eventName];
	        if (handlers) {
	            handlers.push(handler);
	        }
	        else {
	            handlers = [handler];
	            this.listeners[eventName] = handlers;
	        }
	        return this;
	    };
	    Observable.prototype.removeEventListener = function (eventName, handler) {
	        var handlers = this.listeners[eventName];
	        if (handlers) {
	            var index = handlers.indexOf(handler);
	            if (index > -1) {
	                handlers.splice(index, 1);
	            }
	        }
	        return this;
	    };
	    Observable.prototype.dispatchEvent = function (eventName) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var self = this;
	        var handlers;
	        handlers = self.listeners[eventName];
	        var evt = new ObjectEvent(eventName);
	        if (handlers) {
	            handlers.some(function (handler) {
	                try {
	                    var dispatchArgs = [evt].concat(args);
	                    handler.apply(self, dispatchArgs);
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
	    return Observable;
	}());
	exports.Observable = Observable;
	var ObjectEvent = (function () {
	    function ObjectEvent(name) {
	        this.name = name;
	        this.stop = false;
	        this.stopWhenError = true;
	    }
	    return ObjectEvent;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Observable;


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	var DelayTasks = (function () {
	    function DelayTasks() {
	        this.logError = false;
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
	            try {
	                func();
	            }
	            catch (error) {
	                if (self.logError) {
	                    console.log("running simple task " + taskName + " throws error:" + error);
	                }
	            }
	        }, delay);
	    };
	    DelayTasks.prototype.addRepeatTask = function (taskName, func, delay) {
	        var self = this;
	        self.tasks[taskName] = -setInterval(function () {
	            try {
	                func();
	            }
	            catch (error) {
	                if (self.logError) {
	                    console.log("running repeat task " + taskName + " throws error:" + error);
	                }
	            }
	        }, delay);
	    };
	    DelayTasks.prototype.addAwaitingTask = function (taskName, func, waitingFunc, delay) {
	        var self = this;
	        self.addRepeatTask(taskName, function () {
	            var waitingFinished = false;
	            try {
	                waitingFinished = waitingFunc();
	            }
	            catch (error) {
	                if (self.logError) {
	                    console.log("check awaiting task " + taskName + " condition throws error:" + error);
	                }
	            }
	            if (waitingFinished) {
	                self.endTask(taskName);
	                try {
	                    func();
	                }
	                catch (error) {
	                    if (self.logError) {
	                        console.log("running awaiting task " + taskName + " throws error:" + error);
	                    }
	                }
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
	exports.DelayTasks = DelayTasks;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = DelayTasks;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(1));
	__export(__webpack_require__(9));
	__export(__webpack_require__(10));
	__export(__webpack_require__(11));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var _1 = __webpack_require__(8);
	var IENotificationQueue;
	(function (IENotificationQueue) {
	    var maxQueueSize = 20;
	    var popupQueue = [];
	    var currentNoti;
	    function add(noti) {
	        if (popupQueue.length > maxQueueSize) {
	            return;
	        }
	        noti.on(_1.EVENT_OPEN, function () { return currentNoti = noti; });
	        noti.on(_1.EVENT_DISPOSE, function () {
	            currentNoti = null;
	            remove(noti);
	        });
	        if (isEmpty() && !currentNoti) {
	            noti.show();
	        }
	        else {
	            popupQueue.push(noti);
	        }
	        //avoid if a notification throw exception and never fire dispose event, it will block all other notifications.
	        window.setTimeout(function () {
	            if (currentNoti == noti && !noti.closed) {
	                currentNoti = null;
	                remove(noti);
	            }
	        }, _1.IENotification.timeout);
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Position_1 = __webpack_require__(11);
	var WindowUtils;
	(function (WindowUtils) {
	    function getDialogPosition(dialog) {
	        return new Position_1.default({
	            x: pxToNumber(dialog.dialogLeft),
	            y: pxToNumber(dialog.dialogTop),
	            w: pxToNumber(dialog.dialogWidth),
	            h: pxToNumber(dialog.dialogHeight)
	        });
	    }
	    WindowUtils.getDialogPosition = getDialogPosition;
	    function setDialogPosition(dialog, pos) {
	        if (getDialogPosition(dialog).equals(pos)) {
	            return;
	        }
	        dialog.dialogLeft = numberToPx(pos.x);
	        dialog.dialogTop = numberToPx(pos.y);
	        dialog.dialogWidth = numberToPx(pos.w);
	        dialog.dialogHeight = numberToPx(pos.h);
	    }
	    WindowUtils.setDialogPosition = setDialogPosition;
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
	    WindowUtils.fixDialogPosition = fixDialogPosition;
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
	    WindowUtils.onDialogMoved = onDialogMoved;
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
	    WindowUtils.hideWindowBehindDialog = hideWindowBehindDialog;
	    function forceFocus() {
	        window.open("about:blank").close();
	        window.focus();
	    }
	    WindowUtils.forceFocus = forceFocus;
	    function pxToNumber(str) {
	        if (str.length < 2) {
	            return 0;
	        }
	        return Number(str.substring(0, str.length - 2));
	    }
	    function numberToPx(num) {
	        return num + 'px';
	    }
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
	})(WindowUtils = exports.WindowUtils || (exports.WindowUtils = {}));


/***/ },
/* 11 */
/***/ function(module, exports) {

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


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	var IENotificationContentWindow;
	(function (IENotificationContentWindow) {
	    function initContentInPopup() {
	        var popup = window;
	        popup.dialogArguments.initPopup(popup);
	    }
	    IENotificationContentWindow.initContentInPopup = initContentInPopup;
	})(IENotificationContentWindow = exports.IENotificationContentWindow || (exports.IENotificationContentWindow = {}));
	if (window.IENotification && window.dialogArguments) {
	    window.IENotificationContentWindow = IENotificationContentWindow;
	}


/***/ }
/******/ ]);
//# sourceMappingURL=IENotification.js.map