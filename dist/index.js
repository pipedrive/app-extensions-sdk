"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisibilityEventInvoker = exports.View = exports.MessageType = exports.TrackingEvent = exports.Color = exports.ModalStatus = exports.Modal = exports.Event = exports.Command = void 0;
const utils_1 = require("./utils");
const types_1 = require("./types");
const commandKeys = Object.values(types_1.Command);
const eventKeys = Object.values(types_1.Event);
class AppExtensionsSDK {
    constructor(options = {}) {
        const { identifier, targetWindow } = options;
        this.initialized = false;
        this.window = targetWindow !== null && targetWindow !== void 0 ? targetWindow : window.parent;
        this.identifier = identifier !== null && identifier !== void 0 ? identifier : (0, utils_1.detectIdentifier)();
        if (!this.identifier) {
            throw new Error('Missing custom UI identifier');
        }
        (0, utils_1.detectIframeFocus)(() => {
            this.track(types_1.TrackingEvent.FOCUSED);
        });
    }
    postMessage(payload, targetOrigin = '*') {
        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            const message = {
                payload,
                id: this.identifier,
            };
            channel.port1.onmessage = ({ data: response }) => {
                channel.port1.close();
                const { error, data } = response;
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(data);
                }
            };
            this.window.postMessage(message, targetOrigin, [channel.port2]);
        });
    }
    execute(command, ...args) {
        if (!this.initialized) {
            throw new Error('SDK is not initialized');
        }
        if (!commandKeys.includes(command)) {
            throw new Error('Invalid command');
        }
        return this.postMessage({
            command,
            args: args[0],
            type: types_1.MessageType.COMMAND,
        });
    }
    track(event, targetOrigin = '*') {
        const message = {
            payload: {
                type: types_1.MessageType.TRACK,
                event,
            },
            id: this.identifier,
        };
        this.window.postMessage(message, targetOrigin);
    }
    listen(event, onEventReceived) {
        if (!eventKeys.includes(event)) {
            throw new Error('Invalid event');
        }
        const channel = new MessageChannel();
        const message = {
            payload: {
                type: types_1.MessageType.LISTENER,
                event,
            },
            id: this.identifier,
        };
        channel.port1.onmessage = ({ data }) => {
            if (data.error) {
                channel.port1.close();
            }
            onEventReceived(data);
        };
        this.window.postMessage(message, '*', [channel.port2]);
        return () => {
            channel.port1.close();
        };
    }
    setWindow(window) {
        this.window = window;
    }
    initialize(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.postMessage({
                command: types_1.Command.INITIALIZE,
                args: options,
                type: types_1.MessageType.COMMAND,
            });
            this.initialized = true;
            return this;
        });
    }
}
var types_2 = require("./types");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return types_2.Command; } });
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return types_2.Event; } });
Object.defineProperty(exports, "Modal", { enumerable: true, get: function () { return types_2.Modal; } });
Object.defineProperty(exports, "ModalStatus", { enumerable: true, get: function () { return types_2.ModalStatus; } });
Object.defineProperty(exports, "Color", { enumerable: true, get: function () { return types_2.Color; } });
Object.defineProperty(exports, "TrackingEvent", { enumerable: true, get: function () { return types_2.TrackingEvent; } });
Object.defineProperty(exports, "MessageType", { enumerable: true, get: function () { return types_2.MessageType; } });
Object.defineProperty(exports, "View", { enumerable: true, get: function () { return types_2.View; } });
Object.defineProperty(exports, "VisibilityEventInvoker", { enumerable: true, get: function () { return types_2.VisibilityEventInvoker; } });
exports.default = AppExtensionsSDK;
