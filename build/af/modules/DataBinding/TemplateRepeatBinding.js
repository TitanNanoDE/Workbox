import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { bindNode } from './Bind.js';
import { polyMask, getPolyParent } from './Util.js';

let TemplateRepeatBinding = Make(/** @lends TemplateRepeatBinding.prototype*/{

    /**
     * @type {WeakMap<Node>}
     */
    itemNodeList : null,

    /**
     * @type {WeakMap<ScopePrototype>}
     */
    itemScopeList : null,

    /**
     * @type {Node}
     */
    template : null,

    /**
     * @type {Node}
     */
    marker : null,

    /**
     * @type {Array}
     */
    modelBackup : null,

    /**
     * @constructs
     * @extends {Binding}
     */
    _make : function(){
        Binding._make.apply(this);

        this.itemNodeList = new WeakMap();
        this.itemScopeList = new WeakMap();
        this.modelBackup = [];
    },

    renderItem : function(model, scope, itemName, cursor, polyParent, item, index){
        let node = null;

        if (this.itemNodeList.has(item)) {
            node = this.itemNodeList.get(item);
            let childScope = this.itemScopeList.get(item);

            childScope.$first = index === 0;
            childScope.$last = model.length -1 === index;
            childScope.$index = index;
        } else {
            let childScope = Make({
                $first : index === 0,
                $last : model.length-1 === index,
                $index : index
            }, scope).get();

            childScope[itemName] = item;

            node = this.template.content.cloneNode(true).firstElementChild;
            bindNode(node, childScope, true);

            this.itemNodeList.set(item, node);
            this.itemScopeList.set(item, childScope);
        }

        if (cursor.value && cursor.value.parentNode) {
            if (node !== cursor.value) {
                if (polyParent) {
                    getPolyParent(cursor.value.parentNode, polyParent).insertBefore(node, cursor);
                } else {
                    polyMask(cursor.value.parentNode).insertBefore(node, cursor);
                }
            } else {
                cursor.value = cursor.value.nextElementSibling;
            }
        } else {
            if (polyParent) {
                getPolyParent(this.marker.parentNode, polyParent).appendChild(node);
            } else {
                polyMask(this.marker.parentNode).appendChild(node);
            }
        }
    },

    update : function(scope){
        let [itemName, link, expression] = this.originalNodeValue.split(' ');
        let model = parseExpression(expression, scope);
        let polyParent = this.template.getAttribute('bind-polymer-parent');

        if (link !== 'in') {
            console.console.error('DataBinding: invalide expression', this.originalNodeValue);
            return;
        }

        if (Array.isArray(model)) {

            this.modelBackup.forEach(item => {
                if (model.indexOf(item) < 0) {
                    if (polyParent) {
                        getPolyParent(this.marker, polyParent).removeChild(this.itemNodeList.get(item));
                    } else {
                        polyMask(this.marker.parentNode).removeChild(this.itemNodeList.get(item));
                        this.itemNodeList.delete(item);
                    }
                }
            });

            this.modelBackup = model.slice();

            if (window.Polymer) {
                window.Polymer.dom.flush();
            }

            let cursor = {
                value : this.marker.nextElementSibling
            };

            model.forEach(this.renderItem.bind(this, model, scope, itemName, cursor, polyParent));
        }
    }

}, Binding).get();

export default TemplateRepeatBinding;
