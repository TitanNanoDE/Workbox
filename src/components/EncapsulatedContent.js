import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';
import { DataBinding } from '@af-modules/databinding';
import { HTMLElement, prepareConstructor } from 'application-frame/core/nativePrototype';

export const EncapsulatedContentMeta = {
    name: 'encapsulated-content',
    observedAttributes: ['dirty'],
};

export const EncapsulatedContent = {

    /** @type {ScopePrototype} */
    contentscope: null,

    contentview: null,

    _alwaysFalse: false,

    get dirty() {
        return this.hasAttribute('dirty');
    },

    set dirty(value) {
        value ? this.setAttribute('dirty', '') : this.removeAttribute('dirty');
    },

    get template() {
        return this.getAttribute('template');
    },

    set template(value) {
        value ? this.setAttribute('template', value) : this.removeAttribute('template');

        if (this.contentscope) {
            this.contentscope.__destroy__();
        }

        if (!value) {
            return;
        }

        const template = document.querySelector(`#${this.template}`);

        if (window.ShadyCSS) {
            window.ShadyCSS.prepareTemplate(template, EncapsulatedContentMeta.name);
        }

        this.contentview = this.contentview || {};

        const { scope, node } = DataBinding.createTemplateInstance({ template, scope: this.contentview });

        this.contentscope = scope;
        this.shadowRoot.appendChild(node);
    },

    constructor: function ApplicationWindow() {
        const instance = HTMLElement.constructor.apply(this);

        instance._create();

        return instance;
    },

    _create() {
        this.attachShadow({ mode: 'open' });
    },

    connectedCallback() {
    },

    attributeChangedCallback(name) {
        if (name === 'dirty' && this.dirty) {
            this.contentscope.update();
            this.dirty = false;
            this.dispatchEvent(new Event('clean'));
        }
    },

    __proto__: HTMLElement,
};

prepareConstructor(EncapsulatedContent);

EncapsulatedContent.constructor.observedAttributes = EncapsulatedContentMeta.observedAttributes;

window.customElements.define(EncapsulatedContentMeta.name, EncapsulatedContent.constructor);
