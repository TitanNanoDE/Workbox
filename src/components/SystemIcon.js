import { CustomElement, CustomElementMeta } from './CustomElement';


export const SystemIconMeta = {
    name: 'system-icon',

    template: document.querySelector('#system-icon-template'),

    attributes: {
        name: 'string',
    },

    __proto__: CustomElementMeta,
};

const meta = SystemIconMeta;

const {
    onPropertyChanged,
    create,
    createBoundShadowTemplate,
} = meta.symbols;

export const SystemIcon = {

    constructor: function SystemIcon() {
        return CustomElement.constructor.apply(this);
    },

    [create]() {
        this[createBoundShadowTemplate](SystemIconMeta.template);
    },

    [onPropertyChanged]() {
        this._scope.update();
    },

    __proto__: CustomElement,
};

if (window.ShadyCSS) {
    window.ShadyCSS.prepareTemplate(SystemIconMeta.template, SystemIconMeta.name);
}

SystemIconMeta.prepare(SystemIcon);

window.customElements.define(SystemIconMeta.name, SystemIcon.constructor);
