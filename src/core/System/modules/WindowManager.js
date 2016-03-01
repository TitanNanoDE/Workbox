import Af from '../../../af/af.js';
import System from '../../System.js';

let { Make } = Af.Util;
let { Application } = Af.Prototypes;

let templates = {
    mainWindow : './core/System/templates/MainWindow.html',
    fullScreen : './core/System/templates/fullScreenWindow.html',
};

let windowIndex = {};

let flattenWindowIndex = function() {
    let list = [];

    Object.keys(windowIndex).forEach(application => {
        list = list.concat(windowIndex[application]);
    });

    return list;
};

let ApplicationWindow = {
    viewPort : null,
    state : null,
    _view : null,
    _template : null,

    _make : function(type, applicationName){
        this._view = {
            id : `${applicationName}#${windowIndex[applicationName].length}`,
            name : applicationName,
        };

        if (type === 'fullscreen') {
            this._template = templates.fullScreen;
        } else {
            this._template = templates.mainWindow;
        }
    },

    /**
     * @todo implement this!
     */
    maximimize : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('ApplicationWindow');
    },

    /**
     * @todo implement this!
     */
    minimize : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('ApplicationWindow');
    },

    /**
     * @todo implement this!
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
    }
};

let WindowManager = Make({
    name : 'System::WindowManager',
    headless : false,
    rootView : true,
    view : null,

    init : function(window) {
        System.ApplicationManager.updateWindowManager(this.createApplicationWindow.bind(this));

        let [core] = System.ApplicationManager.getInstances('System::Core');

        core.on('ready', () => {
            window.viewPort.destory();
            window.viewPort.bind({ template : './core/System/templates/WindowManager.html' });

            window.viewPort.scope.windows = windowIndex;
            window.viewPort.scope.flattenWindowIndex = flattenWindowIndex;
            this.view = window.viewPort.scope;

            System.ApplicationManager.emit('WindowManager');
        });
    },

    createApplicationWindow : function(application, type='mainwindow') {
        if (!windowIndex[application.name]) {
            windowIndex[application.name] = [];
        }

        let window = Make(ApplicationWindow)(type, application.name);

        windowIndex[application.name].push(window);

        this.view.__apply__();

        return System.ApplicationManager.getViewPortInstance(window._view.id).then(viewPort => {
            window.viewPort = viewPort;

            return window;
        });
    }
}, Application).get();

export default WindowManager;
