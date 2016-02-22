import { Make } from '../../util/make.js';
import Thread from './Thread.js';
import ApplicationInternal from './ApplicationInternal.js';

let Internal = new WeakMap();

let Application = {

    /**
     * Name of this application so other components can identify the application.
     *
     * @type {string}
     */
    name : '',

    /**
     * Some components may need to know the version of this applicaion.
     *
     * @type {string}
     */
    version : '0.0.0',

    /**
     * @type {string}
     */
    author : '',

    /**
     * @constructs
     */
    _make : function(){
        Internal.set(this, Make(ApplicationInternal)());
    },

    /**
     * Initializes this application, default interface for components and modules.
     */
    init : function(){
        console.log(`Initialzing Application "${this.name}"!`);
    },


    /**
     * Registers a new event listener for the given event type.
     *
     * @param {string} type
     * @param {function} listener
     */
    on : function(type, listener){
        var scope = Internal.get(this);

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
        let scope = Internal.get(this);

        if (scope.listeners[type]) {
            scope.listeners[type].forEach(f => {
                setTimeout(function(){
                    f(data);
                }, 0);
            });
        }
    },

    /**
     * Creates a new thread for this applicaion.
     *
     * @param {function} f
     * @return {ApplicationScopeInterface}
     */
    thread : function(f){
        var scope= Internal.get(this);

        scope.workers.push(Make(Thread)(f));

        return this;
    },

    /**
     * This function will try to terminate the application by emitting the termination event.
     *
     * @param {string} reason - the reason for the termination.
     */
    terminate : function(reason){
        this.emit('terminate', reason);
    }

};

export default Application;
