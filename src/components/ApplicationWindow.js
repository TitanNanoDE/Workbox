import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';
import { DataBinding } from '@af-modules/databinding';
import { HTMLElement } from 'application-frame/core/nativePrototype';
import { CustomElementMeta, CustomElement } from './CustomElement';

export const ApplicationWindowMeta = {
    name: 'application-window',
    templates: {
        default: '#application-window-template',
        fullScreen: '#full-screen-window-template',
        workSpaceBorderTool: '#work-space-border-tool-window-template',
    },
    attributes: {
        'order': 'int',
        'top': 'number',
        'left': 'number',
        'height': 'number',
        'width': 'number',
        'type': {
            type: 'string',
            reflectChanges: true,
        },
        'blocking': 'boolean',
    },

    __proto__: CustomElementMeta,
};

export const ApplicationWindow = {

    _scope: null,

    _pickedUp : false,
    _localOffset : { x: 0, y: 0},
    _listener: null,
    __height: null,
    __width: null,
    __left: null,
    __top: null,

    get _height() {
        return this.__height || this.getBoundingClientRect().height;
    },

    set _height(value) { this.__height = value; },

    get _width() {
        return this.__width || this.getBoundingClientRect().width;
    },

    set _width(value) { this.__width = value; },

    get _left() {
        return this.__left || this.getBoundingClientRect().left;
    },

    set _left(value) { this.__left = value; },

    get _top() {
        return this.__top || this.getBoundingClientRect().top;
    },

    set _top(value) { this.__top = value; },

    get isWindow() { return true; },

    _onTypeChanged(value) {
        if (this._scope) {
            this._scope.__destroy__();
            this._scope = null;
            this.childNodes.forEach(node => this.removeChild(node));
        }

        if (!value) {
            return;
        }

        const template = ApplicationWindowMeta.templates[value];
        const { scope, node } = DataBinding.createTemplateInstance({ template, scope: this });

        this._scope = scope;

        DataBinding.attachBindings(this._scope, this, [
            { selector: 'root', name: 'bind-attr', parameter: 'style', value: 'view._calculateStyle()' }
        ]);

        this.shadowRoot.appendChild(node);
    },

    constructor: function ApplicationWindow() {
        return CustomElement.constructor.apply(this);
    },

    _create() {
        this.attachShadow({ mode: 'open' });
    },

    /**
     * calculates the current style attribute for the window.
     *
     * @return {string} the value of the style attribute.
     */
    _calculateStyle() {
        const isDefault = (this.type === 'default');
        const left = isDefault ? this.left : null;
        const top = isDefault ? this.top : null;
        const position = this._pickedUp ?
            `transform: translate3D(${this.left}px, ${this.top}px, 0);` :
            `left: ${left}px; top: ${top}px;`;
        const dimensions = isDefault ? `height: ${this.height}px; width: ${this.width}px;` : '';
        const zIndex = `z-index: ${this.order};`;

        return `${position} ${dimensions} ${zIndex}`;
    },

    _onPropertyChanged() {
        if (!this._scope) {
            return;
        }

        this._scope.update();
    },

    /**
     * picks up a window
     *
     * @this ApplicationWindow#_view
     * @param  {MouseEvent} e the current mouse event
     *
     * @return {void}
     */
    _onWindowGrab(e) {
        let offsetX = e.pageX - this.left;
        let offsetY = e.pageY - this.top;

        this._pickedUp = true;
        this._listener = this._onWindowMove.bind(this);
        this._localOffset = { x: offsetX, y: offsetY };

        window.addEventListener('mousemove', this._listener);
    },

    /**
     * drops a window
     *
     * @return {void}
     */
    _onWindowDrop() {
        this._pickedUp = false;
        window.removeEventListener('mousemove', this._listener);
    },

    /**
     * @param {MouseEvent} e - the event object
     *
     * @return {undefined}
     */
    _onWindowMove(e) {
        if (!this._pickedUp || e.clientX <= 0 || e.clientY <= 0) {
            return;
        }

        const newX = e.pageX - this._localOffset.x;
        const newY = e.pageY - this._localOffset.y;

        if (this.parentElement && this.parentElement.isWindowController) {
            this.dispatchEvent(new CustomEvent('moverequest', {
                bubbles: true,
                detail: {
                    oldX: this.left, newX,
                    oldY: this.top, newY
                }
            }));

            return;
        }

        return this.moveTo(newX, newY);
    },

    _onWindowClose() {
        this.classList.add('leave');

        this.addEventListener('animationend', () => {
            this.dispatchEvent(new Event('close', { bubbles: true }));
            this.classList.remove('leave');
        }, { once: true });
    },

    _onWindowMinimize() {
        this.dispatchEvent(new Event('minimize', { bubbles: true }));
    },

    _onWindowMaximize() {
        this.dispatchEvent(new Event('maximize', { bubbles: true }));
    },

    /**
     * Moves the window to a specific position
     *
     * @param  {number} x
     * @param  {number} y
     *
     * @return {undefined}
     */
    moveTo(x, y) {
        this.left = x;
        this.top = y;

        this.dispatchEvent(new Event('move'), { x, y });
        this._scope.update();
    },

    connectedCallback() {
        this.classList.add('enter');
        this.addEventListener('animationend', () => this.classList.remove('enter'), { once: true });
    },

    __proto__: HTMLElement,
};

ApplicationWindowMeta.prepare(ApplicationWindow);

if (window.ShadyCSS) {
    Object.values(ApplicationWindowMeta.templates)
        .forEach(template => {
            template = document.querySelector(template);

            window.ShadyCSS.prepareTemplate(template, ApplicationWindowMeta.name);
        });
}

window.customElements.define(ApplicationWindowMeta.name, ApplicationWindow.constructor);
