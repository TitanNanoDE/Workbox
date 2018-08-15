import { Make } from 'application-frame/util/make';
import Application from 'application-frame/core/Application';
import Log from '../Log';

let Terminal = Make({

    name : 'workbox.kernel.terminal',

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

        Log.connect(item => {
            this.cache.push(item);

            this.view.update();
        });

        return;
    }


}, Application).get();

export default Terminal;
