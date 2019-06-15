import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';
import { CustomElement, CustomElementMeta } from './CustomElement';

export const EncapsulatedContentMeta = {
    name: 'encapsulated-content',
    attributes: {},

    get object() {
        return EncapsulatedContent;
    },

    __proto__: CustomElementMeta,
};

const meta = EncapsulatedContentMeta;
const pContent = Symbol('EncapsulatedContent.content');
const {
    create: pCreate
} = meta.symbols;


export const EncapsulatedContent = {

    [pContent]: null,

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
        this[pContent] = value;
    },

    constructor: function EncapsulatedContent() {
        return CustomElement.constructor.apply(this);
    },

    [pCreate]() {
        this.attachShadow({ mode: 'open' });
    },

    __proto__: CustomElement,
};

meta.prepare(EncapsulatedContent);

window.customElements.define(meta.name, meta.object.constructor);
