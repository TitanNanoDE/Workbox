import { Make } from '../../util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';

let EnabledBinding = Make(/** @lends EnabledBinding.prototype*/{
    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @constructs
     * @extends {Binding}
     */
    _make : Binding._make,

    update : function(scope){
        let value = parseExpression(this.originalNodeValue, scope);

        if (!value) {
            this.parentNode.setAttribute('disabled', '');
        } else {
            this.parentNode.removeAttribute('disabled');
        }
    }

}, Binding).get();

export default EnabledBinding;
