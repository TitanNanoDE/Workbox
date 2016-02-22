import { DataBinding } from '../DataBinding.js';
import { Make } from '../../util/make.js';

let ViewPortInstance = {
    _scope : null,
    _bound : false,
    _innerScope : null,
    _originalTemplate : null,

    _make : function(scope) {
        this._scope = scope;
    },

    bind : function(context) {
        if (!this._bound) {
            this._scope.templateUrl = context.template;
            this._scope.__apply__();

            if (!this._originalTemplate) {
                this._originalTemplate = this._scope.element.firstElementChild;
            }

            this._innerScope = DataBinding.makeTemplate(this._originalTemplate, context.scope || {});
            this._bound = true;

            context.scope = this._innerScope;
        } else {
            console.error('ViewPort: viewport is already bound!');
        }

        return this;
    },

    update : function(...args) {
        return this._innerScope.__apply__(...args);
    },

    get scope() {
        return this._innerScope;
    },

    destory : function(){
        this._innerScope.__destroy__();

        while (this._scope.element.children) {
            this._scope.element.removeChild(this._scope.element.firstChild);
        }

        this._scope.element.appendChild(this._originalTemplate);
        this._bound = false;
    }
};

let ViewPort = {

    _elements : {},

    /** @type {Application} */
    _application : null,

    /**
     * @constructs
     * @param {Application} application
     */
    _make : function(application){
        let style = document.head.appendChild(document.createElement('style'));
        let template = document.createElement('template');

        style.innerHTML = `
            .view-port {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                right: 0;
                display: flex;
                flex-direction: column;
            }
        `;

        template.id = 'view-port';
        template.setAttribute('bind-element', '');
        template.setAttribute('component', '');

        template.innerHTML = `
            <div class="custom-element">
                <template src="{{templateUrl}}" replace></template>
            </div>
        `;

        application.on('newElement:view-port', scope => {
            this._elements[scope.name] = Make(ViewPortInstance)(scope);

            application.emit(`viewPort:ready:${scope.name}`);
        });

        this._application = application;

        DataBinding.makeTemplate(template, function(){ return {} }, application);
    },

    getInstance : function(name){
        return new Promise((success) => {
            if (this._elements[name]) {
                success(this._elements[name]);
            } else {
                this._application.on(`viewPort:ready:${name}`, () => success(this._elements[name]));
            }
        });
    }
};

export default ViewPort;
