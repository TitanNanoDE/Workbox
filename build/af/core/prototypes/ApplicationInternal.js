let ApplicationInternal = {
    /**
     * @type {Thread}
     */
    thread : null,

    /**
     * @type {Worker[]}
     */
    workers : null,

    /**
     * @type {Array}
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
    _make : function(){
        this.workers= [];
        this.listeners= [];

        this._make = null;
    }
};

export default ApplicationInternal;
