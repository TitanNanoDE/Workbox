export default function(SystemAPI){
    let { Application } = SystemAPI.Prototypes;

    let Terminal = {

        name : 'System::Terminal',

        cache : null,

        view : null,

        _make : function(){
            this.cache = [];
        },

        init : function(window) {
            const { cache } = this;

            this.view = {
                get lineBuffer() { return cache; }
            };

            window.viewPort.template = 'terminal-template';
            window.viewPort.view = this.view;

            SystemAPI.Log.connect(item => {
                this.cache.push(item);

                window.viewPort.update();
            });
        },

        __proto__: Application,
    };

    return Terminal;
}
