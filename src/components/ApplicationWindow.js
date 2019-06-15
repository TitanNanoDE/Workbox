import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';
import { DataBinding } from '@af-modules/databinding';
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

const meta = ApplicationWindowMeta;

const {
    top: pTop,
    left: pLeft,
    height: pHeight,
    width: pWidth,
    onTypeChanged,
    onPropertyChanged,
    create: pCreate,
} = meta.symbols;


const pLocalOffset = Symbol('ApplicationWindow.localOffset');
const pHeightOverride = Symbol('ApplicationWindow._height');
const pWidthOverride = Symbol('ApplicationWindow._width');
const pLeftOverride = Symbol('ApplicationWindow._left');
const pTopOverride = Symbol('ApplicationWindow._top');
const pScope = Symbol('ApplicationWindow.scope');
const pActive = Symbol('ApplicationWindow.active');
const pListener = Symbol('ApplicationWindow.listener');

export const ApplicationWindow = {

    [pScope]: null,

    [pActive] : false,
    [pLocalOffset] : { x: 0, y: 0},
    [pListener]: null,
    [pHeightOverride]: null,
    [pWidthOverride]: null,
    [pLeftOverride]: null,
    [pTopOverride]: null,

    get [pHeight]() {
        return this[pHeightOverride] || this.getBoundingClientRect().height;
    },

    set [pHeight](value) { this[pHeightOverride] = value; },

    get [pWidth]() {
        return this[pWidthOverride] || this.getBoundingClientRect().width;
    },

    set [pWidth](value) { this[pWidthOverride] = value; },

    get [pLeft]() {
        return this[pLeftOverride] || this.getBoundingClientRect().left;
    },

    set [pLeft](value) { this[pLeftOverride] = value; },

    get [pTop]() {
        return this[pTopOverride] || this.getBoundingClientRect().top;
    },

    set [pTop](value) { this[pTopOverride] = value; },

    get isWindow() { return true; },

    [onTypeChanged](value) {
        if (this[pScope]) {
            this[pScope].__destroy__();
            this[pScope] = null;
            this.childNodes.forEach(node => this.removeChild(node));
        }

        if (!value) {
            return;
        }

        const template = ApplicationWindowMeta.templates[value];
        const { scope, node } = DataBinding.createTemplateInstance({ template, scope: this });

        this[pScope] = scope;

        DataBinding.attachBindings(this[pScope], this, [
            { selector: 'root', name: 'bind-attr', parameter: 'style', value: 'view._calculateStyle()' }
        ]);

        this.shadowRoot.appendChild(node);
    },

    constructor: function ApplicationWindow() {
        return CustomElement.constructor.apply(this);
    },

    [pCreate]() {
        this.attachShadow({ mode: 'open' });
    },

    /**
     * calculates the current style attribute for the window.
     *
     * @return {string} the value of the style attribute.
     */
    _calculateStyle() {
        const position = (this.type === 'default') ? `transform: translate3D(${this.left}px, ${this.top}px, 0);` : '';
        const dimensions = (this.type === 'default') ? `height: ${this.height}px; width: ${this.width}px;` : '';
        const zIndex = `z-index: ${this.order};`;

        return `${position} ${dimensions} ${zIndex}`;
    },

    [onPropertyChanged]() {
        if (!this[pScope]) {
            return;
        }

        this[pScope].update();
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

        this[pActive] = true;
        this[pListener] = this._onWindowMove.bind(this);
        this[pLocalOffset] = { x: offsetX, y: offsetY };

        window.addEventListener('mousemove', this[pListener]);
    },

    /**
     * drops a window
     *
     * @return {void}
     */
    _onWindowDrop() {
        this[pActive] = false;
        window.removeEventListener('mousemove', this[pListener]);
    },

    /**
     * @param {MouseEvent} e - the event object
     *
     * @return {undefined}
     */
    _onWindowMove(e) {
        if (!this[pActive] || e.clientX <= 0 || e.clientY <= 0) {
            return;
        }

        const newX = e.pageX - this[pLocalOffset].x;
        const newY = e.pageY - this[pLocalOffset].y;

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
        this.dispatchEvent(new Event('close', { bubbles: true }));
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
        this[pScope].update();
    },

    __proto__: CustomElement,
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
