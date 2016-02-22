
/** @lends Accessor.prototype */
let Accessor = {

    /**
     * @type {WeakMap}
     */
    privateMap : null,

    /**
     * @constructs
     */
    _make : function(){
        this.privateMap = new WeakMap();
    },

    /**
     * @deprecated
     * @param {Object} target
     * @param {Object} [object]
     */
    attributes : function(target, object){
        if(!object){
            return { public : target, private : this.privateMap.get(target) };
        }else{
            this.privateMap.set(target, object);
            return { public : target, private : object };
        }
    },

    /**
     * @param {Object} target
     * @param {Object} [properties]
     */
    properties : function(target, properties){
        if (!properties) {
            return this.privateMap.get(target);
        } else {
            return this.privateMap.set(target, properties);
        }
    }
};

export default Accessor;
