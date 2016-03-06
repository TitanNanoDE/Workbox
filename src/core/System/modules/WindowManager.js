import Af from '../../../af/af.js';
import System from '../../System.js';

const NO_ZINDEX = 0;
const ZINDEX_IS_UNDEFINED = 0;
const BASIC_ZINDEX = 1;

let { Make } = Af.Util;
let { Application } = Af.Prototypes;

let templates = {
    mainWindow : './core/System/templates/mainWindow.html',
    fullScreen : './core/System/templates/fullScreenWindow.html',
    workSpaceBorderToolWindow : './core/System/templates/workSpaceBorderToolWindow.html',
};

let windowIndex = {};

let zStack = [];

let calculateZIndexLevel = function(window) {
    if ( window._stackMode === 'alwaysBehind') {
        return NO_ZINDEX;
    }else if (window._stackMode === 'alwaysOnTop') {
        return zStack.length + BASIC_ZINDEX;
    } else {
        return (zStack.indexOf(window) || ZINDEX_IS_UNDEFINED) + BASIC_ZINDEX;
    }
}

let ApplicationWindow = {
    viewPort : null,
    state : null,
    _view : null,
    _template : null,
    _stackMode : 'normal',

    _make : function(type, applicationName){
        this._view = {
            id : `${applicationName}#${windowIndex[applicationName].length}`,
            name : applicationName,
            _getZIndex : calculateZIndexLevel.bind(null, this),
        };

        this._template = templates[type];
    },

    /**
     * @todo implement this!
     * @return {void}
     */
    maximimize : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('ApplicationWindow');
    },

    /**
     * @todo implement this!
     * @return {void}
     */
    minimize : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('ApplicationWindow');
    },

    /**
     * @todo implement this!
     * @return {void}
     */
    close : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('ApplicationWindow');
    },

    get name(){
        return this._view.name;
    },

    set name(value) {
        this._view.name = value;
        this._view.__apply__();
    },

    apperanceMode : function(mode) {
        this._stackMode = mode;
    }
};

let WorkSpaceBorderToolWindow = Make({
    _make : function(type, applicationName){
        ApplicationWindow._make.apply(this, [type, applicationName]);
        this._view.side = 'unset';

        this._view.isVisible = function(){
            return this.side !== 'unset';
        }
    },

    dockTo : function(side) {
        this._view.side = side;
        this._view.__apply__();
    }

}, ApplicationWindow).get();

let WindowManager = Make({
    name : 'System::WindowManager',
    headless : false,
    rootView : true,
    view : null,

    icons : [{
        name : '32',
        src : './userSpace/theme/window-manager.svg',
    }],

    init : function(window) {
        System.ApplicationManager.updateWindowManager(this.createApplicationWindow.bind(this));

        let [core] = System.ApplicationManager.getInstances('System::Core');

        core.on('ready', () => {
            window.viewPort.destory();
            window.viewPort.bind({ template : './core/System/templates/WindowManager.html' });

            window.viewPort.scope.windowList = zStack;
            this.view = window.viewPort.scope;

            System.ApplicationManager.emit('WindowManager');
        });
    },

    createApplicationWindow : function(application, type='mainWindow') {
        let prototype = ApplicationWindow;

        if (!windowIndex[application.name]) {
            windowIndex[application.name] = [];
        }

        if (type == 'workSpaceBorderToolWindow') {
            prototype = WorkSpaceBorderToolWindow;
        }

        let window = Make(prototype)(type, application.name);

        windowIndex[application.name].push(window);
        zStack.push(window);

        this.view.__apply__();

        return System.ApplicationManager.getViewPortInstance(window._view.id).then(viewPort => {
            window.viewPort = viewPort;

            return window;
        });
    }
}, Application).get();

export default WindowManager;
