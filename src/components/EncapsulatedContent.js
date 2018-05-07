import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';
import { CustomElement, CustomElementMeta } from './CustomElement';

export const EncapsulatedContentMeta = {
    name: 'encapsulated-content',
    attributes: {},

    __proto__: CustomElementMeta,
};


export const EncapsulatedContent = {

    _content: null,

    get content() {
        return this._content;
    },

    set content(value) {
        if (!value || value === ''){
            return;
        }

        while (this.shadowRoot.childNodes.length) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        this.shadowRoot.appendChild(value);
        this._content = value;
    },

    constructor: function EncapsulatedContent() {
        return CustomElement.constructor.apply(this);
    },

    _create() {
        this.attachShadow({ mode: 'open' });
    },

    __proto__: CustomElement,
};

EncapsulatedContentMeta.prepare(EncapsulatedContent);

window.customElements.define(EncapsulatedContentMeta.name, EncapsulatedContent.constructor);
