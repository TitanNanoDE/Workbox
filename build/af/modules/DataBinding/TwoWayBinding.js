import { Make } from '../../util/make.js';
import { parseExpression, assignExpression } from './Parser.js';
import { attributeNames } from './Mapping.js';
import Binding from './Binding.js';

let TwoWayBinding = Make(/** @lends TwoWayBinding.prototype*/{
    /**
     * @type {string}
     */
    currentValue : '',

    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @type {boolean}
     */
    indirect : false,

    /**
     * @type {string}
     */
    viewBinding : '',

    update : function(scope){
        let value = parseExpression(this.properties[0], scope);
        let attribute = attributeNames.rename(this.node.name);

        if (!this.indirect) {
            this.parentNode.setAttribute(attribute, value);
        } else {
            let oldValue = parseExpression(this.viewBinding, this.parentNode);

            if (value !== oldValue) {
                assignExpression(this.viewBinding, this.parentNode, value);
                this.currentValue = value;
            }
        }
    }
}, Binding).get();

export default TwoWayBinding;
