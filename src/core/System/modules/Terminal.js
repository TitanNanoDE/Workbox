import { Make } from '../../../af/util/make';
import Application from '../../../af/core/Application';
import System from '../../System';

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

    init(window) {
        window.viewPort.bind({
            template : 'terminal-template',
        });

        this.view = window.viewPort;
        this.view.scope.lineBuffer = this.cache;

        System.Log.connect(item => {
            this.cache.push(item);

            this.view.update();
        });

        return;
    }


}, Application).get();

export default Terminal;
