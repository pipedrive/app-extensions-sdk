"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIdentifier = exports.detectIframeFocus = void 0;
function detectIframeFocus(cb) {
    let isFocused = false;
    window === null || window === void 0 ? void 0 : window.addEventListener('focus', () => {
        if (!isFocused) {
            cb();
        }
        isFocused = true;
    });
    window === null || window === void 0 ? void 0 : window.addEventListener('blur', () => {
        isFocused = false;
    });
}
exports.detectIframeFocus = detectIframeFocus;
function detectIdentifier() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
exports.detectIdentifier = detectIdentifier;
