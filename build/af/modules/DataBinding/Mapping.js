/**
 * Contains all the attribute names
 *
 * @type {Object}
 */
export let attributeNames = {
    events : 'events',
    visible : 'display',
    transparent : 'visible',
    classes : 'class',
    value : 'value',
    prefix : 'bind',
    enabled : 'enabled',
    model : 'model',
    modelEvent : 'model-event',

    get : function(key){
        return `${this.prefix}-${this[key]}`;
    },

    rename : function(name){
        return name.replace(`${this.prefix}\-`, '');
    }
};
