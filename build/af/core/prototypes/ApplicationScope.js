import { Make } from '../../util/make.js';
import Catalog from './Catalog.js';
import Extendables from '../objects/Extendables.js';


/**
 * @lends ApplicationScope.prototype
 */
let ApplicationScope = {
    /**
     * @type {string}
     */
    name : null,

    /**
     * @type {string}
     */
    type : 'application',

    /**
     * @type {ApplicationScopeInterface}
     */
    public : null,

    /**
     * @type {ApplicationScopePrivatePrototype}
     */
    private : null,

    /**
     * @type {Thread}
     */
    thread : null,

    /**
     * @type {Worker[]}
     */
    workers : null,

    /**
     * @type {Object}
     */
    listeners : null,

    /**
     * @type {Catalog}
     */
    modules : null,

    /**
     * this prototype defines a new application scope
     *
     * @constructs
     * @param {string} name
     * @implements {Scope}
     */
    _make : function(name){
        this.name= name;
        this.public= Make(Extendables.ApplicationScopeInterface)(this);

        this.workers= [];
        this.listeners= {};
        this.modules = Make(Catalog)();

        this._make = null;
    }
};

export default ApplicationScope;
