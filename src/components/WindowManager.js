import { CustomElement, CustomElementMeta } from './CustomElement';

export const WindowManagerMeta = {
    name: 'window-manager',

    __proto__: CustomElementMeta,
};

export const template = document.querySelector('#window-manager-ce-template');

const CollisionTypes = { HORIZONTAL : 0, VERTICAL : 1 };

/**
 * Checks when ever a window can moved to a new position
 *
 * @param {Object} window - a window DOM element
 * @param {number} type - the direction type
 * @param {number} newValue - the new value which should be applied
 *
 * @return {boolean} - when ever the new value will cause the window to collide
 */
const checkCollision = function(blockingWindows, window, type, newValue) {
    let result = blockingWindows.find(item => {
        let willEnterX = (item.left <= newValue && newValue <= (item.left + item.width))
                         || (item.left >= newValue && item.left <= (newValue + window.width));

        let isInX = (item.left <= window.left && window.left <= (item.left + item.width))
                    || (item.left >= window.left && item.left <= (window.left + window.width));

        let willEnterY = (item.top <= newValue && newValue <= (item.top + item.height))
                         || (item.top >= newValue && item.top <= (newValue + window.height));

        let isInY = (item.top <= window.top && window.top <= (item.top + item.height))
                    || (item.top >= window.top && item.top <= (window.top + window.height));

        if (type === CollisionTypes.HORIZONTAL && willEnterX && isInY) {
            return true;
        }

        if (type === CollisionTypes.VERTICAL && willEnterY && isInX) {
            return true;
        }

        return false;
    });

    return !!result;
};

export const WindowManager = {

    /** @type {MutationObserver} */
    _observer: null,

    _windows: null,

    get isWindowController() { return true; },

    constructor: function WindowManager() {
        return CustomElement.constructor.apply(this);
    },

    _create() {
        this._createBoundShadowTemplate(template);
        this._observer = new MutationObserver(this._onChildrenChanged.bind(this));
        this._observer.observe(this, { childList: true, });
        this._windows = Array.from(this.children).filter(child => child.isWindow);
        this.addEventListener('moverequest', this._onMoveRequest.bind(this));
    },

    /**
     * Callback for when new windows have been added to the WindowManager
     *
     * @param  {MutationRecord[]} records
     * @return {undefined}
     */
    _onChildrenChanged(records) {
        records.forEach((record) => {
            this._windows.push(...Array.from(record.addedNodes).filter(child => child.isWindow));
        });
    },

    _onMoveRequest(event) {
        let x = event.detail.oldX;
        let y = event.detail.oldY;

        const blockingWindows = this._windows.filter(window => window.blocking);

        if (!checkCollision(blockingWindows, event.target, CollisionTypes.HORIZONTAL, event.detail.newX)) {
            x = event.detail.newX;
        }

        if (!checkCollision(blockingWindows, event.target, CollisionTypes.VERTICAL, event.detail.newY)) {
            y = event.detail.newY;
        }

        event.target.moveTo(x, y);
    },

    __proto__: CustomElement,
};

WindowManagerMeta.prepare(WindowManager);

if (window.ShadyCSS) {
    window.ShadyCSS.prepareTemplate(template, WindowManagerMeta.name);
}

window.customElements.define(WindowManagerMeta.name, WindowManager.constructor);
