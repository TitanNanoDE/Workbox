import { recycle, watcherList, destoryScope } from './Bind.js';

/**
 * Prototype for data binding scopes.
 */
let ScopePrototype = {

    /**
     * will apply the current state of the bound model.
     *
     * @param {function} fn
     */
	__apply__ : function(fn, localRecycle){
        if (fn) {
            fn();
        }

		return recycle(localRecycle ? this : null);
	},

    __watch__ : function(expression, cb) {
        if (!watcherList.has(this)) {
            watcherList.set(this, []);
        }

        watcherList.get(this).push({
            expression : expression,
            cb : cb
        });
    },

    __destroy__ : function() {
        destoryScope(this);
    }
};

export default ScopePrototype;
