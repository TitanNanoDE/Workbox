import { Make } from '../../../af/util/make.js';
import Application from '../../../af/core/prototypes/Application.js';
import System from '../../System.js';

let Terminal = Make({

    name : 'System::Terminal',

    displayName : 'Terminal',

    icons : [{
        name : '32',
        src : './userSpace/theme/terminal.svg',
    }],

    rootView : true,

    cache : null,

    view : null,

    _make : function(){
        this.cache = [];
    },

    init : function(window){
        this.view = window.viewPort.bind({
            template : './core/System/templates/Terminal.html'
        });

        this.view.scope.lineBuffer = this.cache;

        System.Log.connect(item => {
            this.cache.push(item);

            this.view.update();
        });
    }


}, Application).get();

export default Terminal;
