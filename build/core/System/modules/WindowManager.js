import Af from '../../../af/af.js';
import System from '../../System.js';

let { Make } = Af.Util;
let { Application } = Af.Prototypes;

let templates = {
    normalMainWindow : './core/System/templates/MainWindow.html',
    fullScreen : './core/System/templates/fullScreenWindow.html',
}

let ApplicationWindow = {
    viewPort : null,
    name : null,
    state : null,
    _template : null,

    _make : function(type){
        if (type === 'fullscreen') {
            this._template = templates.fullScreen;
        } else {
            this._template = templates.normalMainWindow;
        }
    },

    /**
     * @todo implement this!
     */
    maximimize : function(){
        throw new Error('Not Implemented! ~ ApplicationWindow.maximimize()');
    },

    /**
     * @todo implement this!
     */
    minimize : function(){
        throw new Error('Not Implemented! ~ ApplicationWindow.minimize()');
    },
};

let WindowManager = Make({
    headless : true,

    init : function() {
        System.ApplicationManager.emit('updateWindowManager', this.createApplicationWindow.bind(this));
    },

    createApplicationWindow : function() {

    }
}, Application).get();

export default WindowManager;
