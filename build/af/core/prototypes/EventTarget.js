let EventTarget = {

    /** @type {Object} */
    _listeners : null,

    /**
     * @constructs
     */
    _make : function(){
        this._listeners = {};
    },

    /**
     * registers a new listener for the given event.
     *
     * @param {string} type
     * @param {function} listener
     */
    on : function(type, listener){
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },

    /**
     * emmits a new event on this object
     *
     * @param {string} type
     * @param {*} data
     */
    emit : function(type, data){
        if (this._listeners[type]) {
            this._listeners[type].forEach(listener => {
                setTimeout(() => {
                    listener.apply(this, [data]);
                }, 0);
            });
        }
    }
};

export default EventTarget;
