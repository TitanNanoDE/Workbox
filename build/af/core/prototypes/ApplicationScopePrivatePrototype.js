import Interface from './Interface.js';
import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';

let ApplicationScopePrivatePrototype = Make(/** @lends ApplicationScopePrivatePrototype.prototype */{
    /**
     * Reference to the public interface of this application.
     *
     * @type {ApplicationScopeInterface}
     */
    public : null,

    /**
     * A dictionary of all the available modules in the application.
     *
     * @type {Object}
     */
    modules : null,

    /**
     * The private prototype for the application. Only the application and
     * it's modules have access to the properties of this prototype.
     *
     * @constructs
     * @param {ApplicationScope} scope - The [{ApplicationScope}]{@link ApplicationScope} this object belongs to.
     * @extends {Interface}
     */
    _make : function(scope){
        Interface._make(scope);

        this.public = scope.public;
        this.modules = {};

        this._make = null;
    },

    /**
     * @param {function} f
     */
    onprogress : function(f){
        Scopes.get(this).listeners.push({ type : 'progress', listener : f });
    },

}, Interface).get();

export default ApplicationScopePrivatePrototype;
