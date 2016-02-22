export default function(SystemAPI){
    let { Make } = SystemAPI.Tools;
    let { Application } = SystemAPI.Prototypes;

    let Terminal = Make({

        name : 'System::Terminal',

        cache : null,

        view : null,

        _make : function(){
            this.cache = [];
        },

        init : function(window){
            this.view = window.viewPort.bind({
                template : './packages/Terminal/Template.html'
            });

            this.view.scope.lineBuffer = this.cache;

            SystemAPI.Log.connect(item => {
                this.cache.push(item);

                this.view.update();
            });
        }


    }, Application).get();

    return Terminal;
};
