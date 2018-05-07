import '@webcomponents/webcomponentsjs/webcomponents-sd-ce.js';

import { HTMLElement } from 'application-frame/core/nativePrototype';
import { DataBinding } from '@af-modules/databinding';

const invokeCallback = function(attribute, element, newValue, oldValue) {
    const callback = `_on${attribute[0].toUpperCase()}${attribute.substring(1)}Changed`;

    if (!element[callback] || typeof element[callback] !== 'function') {
        return;
    }

    return element[callback](newValue, oldValue);
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

    prepare(prototype) {
        prototype.constructor.prototype = prototype;

        for (let key in this) {
            Object.defineProperty(prototype.constructor, key, {
                get() {
                    return this[key].bind(this);
                }
            });
        }

        Object.entries(this.attributes).forEach(([attribute, config]) => {
            const privateAttributeStore = `_${attribute}`;

            if (typeof config === 'string') {
                config = { type: config };
            }

            config = Object.assign({ type: 'string', reflectChanges: false }, config);

            prototype[privateAttributeStore] = null;

            Object.defineProperty(prototype, attribute, {
                get() {
                    return this[privateAttributeStore];
                },

                set(value) {
                    const old = this[privateAttributeStore];

                    value = typeCast(value, config.type);

                    if (this._onPropertyChanged) {
                        this._onPropertyChanged(attribute, old, value);
                    }

                    const transformedValue = invokeCallback(attribute, this, value, old);

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
    }
};

export const CustomElement = {

    get observedAttributes() {
        return this.attributes && Object.keys(this.attributes) || undefined;
    },

    constructor: function CustomElement() {
        const instance = HTMLElement.constructor.apply(this);

        instance._create();

        return instance;
    },

    _create() {},

    _createBoundShadowTemplate(template) {
        const { scope, node } = DataBinding.createTemplateInstance({ template, scope: this });

        this._scope = scope;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(node);
    },

    attributeChangedCallback(attribute, oldValue, newValue) {
        if (attribute in this && this[`_${attribute}`] !== newValue) {
            this[attribute] = newValue;
        }
    },

    connectedCallback() {
        Array.from(this.attributes)
            .forEach(attribute => {
                if (!attribute.value) {
                    return;
                }

                this.attributeChangedCallback(attribute.name, undefined, attribute.value);
            });
    },

    __proto__: HTMLElement,
};
