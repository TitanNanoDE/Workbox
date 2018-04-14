const ApplicationMenuManager = {

    registry : new WeakMap(),

    active : null,

    registerMenu : function(application, menu){
        this.registry.set(application, menu);
    },

    getActiveMenu : function() {
        return this.registry.get(this.active);
    }


};

export default ApplicationMenuManager;
