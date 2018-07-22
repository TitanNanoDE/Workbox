import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';
import { CustomElement, CustomElementMeta } from './CustomElement';

const template = document.createElement('template');
template.content.appendChild(document.createElement('style'))
    .textContent = `
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }`;
template.content.appendChild(document.createElement('slot'));

const ViewPortMeta = {
    name: 'view-port',
    template,

    attributes: {},

    __proto__: CustomElementMeta,
};

const ViewPort = {

    _content: null,

    constructor: function ViewPort() {
        return CustomElement.constructor.apply(this);
    },

    get content() {
        return this._content;
    },

    set content(value) {
        if (!value || value === ''){
            return;
        }

        while (this.childNodes.length) {
            this.removeChild(this.firstChild);
        }

        this.appendChild(value);
        this._content = value;
    },

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(document.importNode(ViewPortMeta.template.content, true));
    },

    __proto__: CustomElement,
};

ViewPortMeta.prepare(ViewPort);

if (window.ShadyCSS) {
    window.ShadyCSS.prepareTemplate(ViewPortMeta.template, ViewPortMeta.name);
}

if (window.customElements) {
    window.customElements.define(ViewPortMeta.name, ViewPort.constructor);
}
