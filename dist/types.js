"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = exports.VisibilityEventInvoker = exports.TrackingEvent = exports.ModalStatus = exports.Modal = exports.Color = exports.MessageType = exports.Event = exports.Command = void 0;
var Command;
(function (Command) {
    Command["SHOW_SNACKBAR"] = "show_snackbar";
    Command["SHOW_CONFIRMATION"] = "show_confirmation";
    Command["RESIZE"] = "resize";
    Command["INITIALIZE"] = "initialize";
    Command["OPEN_MODAL"] = "open_modal";
    Command["CLOSE_MODAL"] = "close_modal";
    Command["GET_SIGNED_TOKEN"] = "get_signed_token";
    Command["REDIRECT_TO"] = "redirect_to";
    Command["SHOW_FLOATING_WINDOW"] = "show_floating_window";
    Command["HIDE_FLOATING_WINDOW"] = "hide_floating_window";
    Command["MINIMIZE_FLOATING_WINDOW"] = "minimize_floating_window";
})(Command = exports.Command || (exports.Command = {}));
var Event;
(function (Event) {
    Event["VISIBILITY"] = "visibility";
    Event["CLOSE_CUSTOM_MODAL"] = "close_custom_modal";
    Event["MINIMIZE_FLOATING_WINDOW"] = "minimize_floating_window";
})(Event = exports.Event || (exports.Event = {}));
var MessageType;
(function (MessageType) {
    MessageType["COMMAND"] = "command";
    MessageType["LISTENER"] = "listener";
    MessageType["TRACK"] = "track";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var Color;
(function (Color) {
    Color["PRIMARY"] = "primary";
    Color["SECONDARY"] = "secondary";
    Color["NEGATIVE"] = "negative";
})(Color = exports.Color || (exports.Color = {}));
var Modal;
(function (Modal) {
    Modal["DEAL"] = "deal";
    Modal["ORGANIZATION"] = "organization";
    Modal["PERSON"] = "person";
    Modal["ACTIVITY"] = "activity";
    Modal["JSON_MODAL"] = "json_modal";
    Modal["CUSTOM_MODAL"] = "custom_modal";
})(Modal = exports.Modal || (exports.Modal = {}));
var ModalStatus;
(function (ModalStatus) {
    ModalStatus["CLOSED"] = "closed";
    ModalStatus["SUBMITTED"] = "submitted";
})(ModalStatus = exports.ModalStatus || (exports.ModalStatus = {}));
var TrackingEvent;
(function (TrackingEvent) {
    TrackingEvent["FOCUSED"] = "focused";
})(TrackingEvent = exports.TrackingEvent || (exports.TrackingEvent = {}));
var VisibilityEventInvoker;
(function (VisibilityEventInvoker) {
    VisibilityEventInvoker["USER"] = "user";
    VisibilityEventInvoker["COMMAND"] = "command";
})(VisibilityEventInvoker = exports.VisibilityEventInvoker || (exports.VisibilityEventInvoker = {}));
var View;
(function (View) {
    View["DEALS"] = "deals";
    View["LEADS"] = "leads";
    View["ORGANIZATIONS"] = "organizations";
    View["CONTACTS"] = "contacts";
    View["CAMPAIGNS"] = "campaigns";
    View["PROJECTS"] = "projects";
    View["SETTINGS"] = "settings";
})(View = exports.View || (exports.View = {}));
