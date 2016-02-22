import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';
import ApplicationScopePrivatePrototype from './ApplicationScopePrivatePrototype.js';
import Interface from './Interface.js';
import Extendables from '../objects/Extendables.js';
import Engine from '../objects/Engine.js';

/**
 * this prototype defines a new application scope interface
 *
 * @class ApplicationScopeInterface
 * @extends {Interface}
 */


let ApplicationScopeInterface = Make(
    /** @lends ApplicationScopeInterface.prototype */
    {

    /**
     * @param {string} type
     * @param {function} listener
     */
    on : function(type, listener){
        var scope = Scopes.get(this);

        if (!scope.listeners[type]) {
            scope.listeners[type] = [];
        }

        scope.listeners[type].push(listener);

        return this;
    },

    /**
     * Emmits a new event on this application.
     *
     * @param {string} type
     * @param {Object} data
     */
    emit : function(type, data){
        let scope = Scopes.get(this);

        if (scope.listeners[type]) {
            scope.listeners[type].forEach(f => {
                setTimeout(function(){
                    f(data);
                }, 0);
            });
        }
    },

    /**
     * @param {function} f
     * @return {ApplicationScopeInterface}
     */
    thread : function(f){
        var scope= Scopes.get(this);

        scope.workers.push(Make(Extendables.ScopeWorker)(f));

        return this;
    },

    /**
     * Creates the prototype for the application. The properties then
     * can be accessed inside the applications main routine and it's modules.
     *
     * @param {Object} object
     * @return {ApplicationScopeInterface}
     */
    prototype : function(object){
        Scopes.get(this).private = Make(object, ApplicationScopePrivatePrototype)(Scopes.get(this));

        return this;
    },

    /**
     * Sets the main routine for the application. It will be invoced after all modules are loaded.
     *
     * @param {function} f
     * @return {ApplicationScopeInterface}
     */
    main : function(f){
        var scope= Scopes.get(this);

        if(scope.private === null)
            scope.private = Make(ApplicationScopePrivatePrototype)(scope);

        scope.thread= f.bind(scope.private);

        Engine.ready.then(scope.thread);

        return this;
    },

    /**
     * Defines a module for the application.
     *
     * @param {string} name - The name of the new module. Other modules and the main routine can reference to the module with this name.
     * @param {string[]} dependencies - The names of all the modules on which this module depends.
     * @param {function} f - the main routine of this module.
     * @return {ApplicationScopeInterface}
     */
    module : function(name, dependencies, f){
        var scope = Scopes.get(this);

        scope.modules.on('available', dependencies).then(function(){
            scope.modules.add(new Promise(function(ready){
                f(scope, ready);
            }));
        });

        return this;
    },

    /**
     * This function will try to terminate the application by emitting the termination event.
     *
     * @param {string} reason - the reason for the termination.
     */
    terminate : function(reason){
        this.emmit('terminate', reason);
    }

}, Interface).get();

export default ApplicationScopeInterface;
