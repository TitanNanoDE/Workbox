import '@webcomponents/webcomponentsjs';
import { HTMLElement, prepareConstructor } from 'application-frame/core/nativePrototype';
import { DataBinding } from '@af-modules/databinding';

const viewportTemplates = new WeakMap();
const viewportInstances = new WeakMap();

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

const ViewPort = {

    view: null,

    get template() {
        return this.getAttribute('template');
    },

    set template(value) {
        this.setAttribute('template', value);
    },

    constructor: function() {
        const instance = HTMLElement.constructor.apply(this);

        instance.view = {};
        viewportTemplates.set(instance, document.createElement('template'));

        return instance;
    },

    update() {
        if (viewportInstances.has(this)) {
            return viewportInstances.get(this).update();
        }

        return false;
    },


    get scope() {
        if (viewportInstances.has(this)) {
            return viewportInstances.get(this);
        }

        return {};
    },

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(document.importNode(template.content, true));

        if (window.ShadyCSS) {
            window.ShadyCSS.styleElement(this);
        }

        this._renderTemplate();
    },

    attributeChangedCallback(name) {
        if (name === 'template') {
            return this._renderTemplate();
        }
    },

    _renderTemplate() {
        if (!this.template) {
            return;
        }

        if (viewportInstances.has(this)) {
            const scope = viewportInstances.get(this);

            if ('__destroy__' in scope) {
                scope.__destroy__();
            }

            this.childNodes.forEach(child => this.removeChild(child));

            viewportInstances.delete(this);
        }

        const template = viewportTemplates.get(this);
        template.setAttribute('ref', this.template);

        const result = DataBinding.createTemplateInstance({ template, scope: this.view });

        viewportInstances.set(this, result.scope);
        this.appendChild(result.node);
    },

    __proto__: HTMLElement,
};

ViewPort.constructor.observedAttributes = ['template'];

prepareConstructor(ViewPort);

if (window.ShadyCSS) {
    window.ShadyCSS.prepareTemplate(template, 'view-port');
}

if (window.customElements) {
    window.customElements.define('view-port', ViewPort.constructor);
}
