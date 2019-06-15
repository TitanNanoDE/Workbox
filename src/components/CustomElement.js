import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';

import { HTMLElement } from 'application-frame/core/nativePrototype';
import { DataBinding } from '@af-modules/databinding';

const symbolsStore = new WeakMap();
const metaObject = Symbol('CustomElement.meta');
const pCreate = Symbol('CustomElement.create');
const pCreateBoundShadowTemplate = Symbol('CustomElement.createBoundShadowTemplate');

const getAttributeCallbackName = function(attributeName) {
    return `on${attributeName[0].toUpperCase()}${attributeName.substring(1)}Changed`;

};

const invokeCallback = function(attributeSymbols, attribute, element, newValue, oldValue) {
    const callback = attributeSymbols[getAttributeCallbackName(attribute)];

    if (!element[callback] || typeof element[callback] !== 'function') {
        return;
    }

    return element[callback](newValue, oldValue);
};

const normalizeAttributeConfig = function(config) {
    if (typeof config === 'string') {
        config = { type: config };
    }

    config = Object.assign({ type: 'string', reflectChanges: false }, config);

    return config;
};

const typeCast = function(value, type) {
    if (type === 'string') {
        return value.toString();
    }

    if (type === 'boolean') {
        return !!value;
    }

    if (type === 'number') {
        return parseFloat(value) || 0;
    }

    if (type === 'int') {
        return parseInt(value) || 0;
    }

    return value;
};

const reflectToAttribute = function(attribute, element, value, type) {
    if (!value) {
        element.removeAttribute(attribute);
    }

    if (type === 'boolean') {
        element.setAttribute(attribute, '');

        return;
    }

    element.setAttribute(attribute, value);
};

export const CustomElementMeta = {

    attributes: {},

    name: 'unnamed-custom-element',

    prepare(prototype) {
        prototype.constructor.prototype = prototype;

        Object.defineProperty(prototype.constructor, 'observedAttributes', {
            get() {
                return this.attributes && Object.keys(this.attributes) || undefined;
            }
        });

        Object.defineProperty(prototype, metaObject, {
            value: this,
            writable: false,
        });

        const attributeSymbols = this.symbols;

        Object.entries(this.attributes).forEach(([attribute, config]) => {
            const privateAttributeStore = attributeSymbols[attribute];

            config = normalizeAttributeConfig(config);

            prototype[privateAttributeStore] = null;

            Object.defineProperty(prototype, attribute, {
                get() {
                    return this[privateAttributeStore];
                },

                set(value) {
                    const old = this[privateAttributeStore];

                    value = typeCast(value, config.type);

                    if (this[attributeSymbols.onPropertyChanged]) {
                        this[attributeSymbols.onPropertyChanged](attribute, old, value);
                    }

                    const transformedValue = invokeCallback(attributeSymbols, attribute, this, value, old);

                    if (transformedValue !== undefined) {
                        value = transformedValue;
                    }

                    this[privateAttributeStore] = value;

                    if (config.reflectChanges) {
                        reflectToAttribute(attribute, this, value, config.type);
                    }
                }
            });
        });
    },

    get symbols() {
        const store = symbolsStore.has(this) ? symbolsStore.get(this) : {};

        if (!store.onPropertyChanged) {
            store.onPropertyChanged = Symbol(`${this.name}.onPropertyChanged`);
        }

        if (!store.create) {
            store.create = pCreate;
        }

        if (!store.createBoundShadowTemplate) {
            store.createBoundShadowTemplate = pCreateBoundShadowTemplate;
        }

        Object.keys(this.attributes)
            .forEach(name => {
                if (store[name]) {
                    return;
                }

                const callbackName = getAttributeCallbackName(name);

                store[name] = Symbol(`${this.name}.${name}`);
                store[callbackName] = Symbol(`${this.name}.${callbackName}`);
            });

        symbolsStore.set(this, store);

        return Object.assign({}, store);
    }
};

export const CustomElement = {

    [metaObject]: null,

    constructor: function CustomElement() {
        const instance = HTMLElement.constructor.apply(this);

        instance[pCreate]();

        return instance;
    },

    [pCreate]() {},

    [pCreateBoundShadowTemplate](template) {
        const { scope, node } = DataBinding.createTemplateInstance({ template, scope: this });

        this._scope = scope;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(node);
    },

    attributeChangedCallback(attribute, oldValue, newValue) {
        const attributeSymbol = this[metaObject].symbols[attribute];

        if (attribute in this && this[attributeSymbol] !== newValue) {
            this[attribute] = newValue;
        }
    },

    connectedCallback() {
        const attributeSymbols = this[metaObject].symbols;

        Array.from(this.attributes)
            .forEach(attribute => {
                if (!attribute.value) {
                    return;
                }

                const oldValue = this[attributeSymbols[attribute]];
                const newValue = attribute.value;

                if (oldValue === newValue) {
                    return;
                }

                this.attributeChangedCallback(attribute.name, oldValue, newValue);
            });
    },

    __proto__: HTMLElement,
};

export { metaObject as meta };
