import System from '../../System';
import { Make, hasPrototype } from 'application-frame/util/make';
import Application from 'application-frame/core/Application';
import EventTarget from 'application-frame/core/EventTarget';

const NO_ZINDEX = 0;
const ZINDEX_IS_UNDEFINED = 0;
const BASIC_ZINDEX = 1;
const REMOVE_ONE_ITEM = 1;

let windowIndex = {};

let zStack = [];

let calculateZIndexLevel = function(window) {
    if ( window._stackMode === 'alwaysBehind') {
        return NO_ZINDEX;
    }else if (window._stackMode === 'alwaysOnTop') {
        return zStack.length + BASIC_ZINDEX;
    } else {
        return (zStack.indexOf(window) || ZINDEX_IS_UNDEFINED) + BASIC_ZINDEX;
    }
};

/**
 * @extends Af.Prototypes.EventTarget
 */
const ApplicationWindow = {

    /**
     * @type {viewPortInstance}
     */
    viewPort : null,
    state : null,
    type : null,
    _view : null,
    _stackMode : 'normal',
    _blocksScreen: false,
    _app : null,

    /**
     * @constructs
     * @param {string} type - window type
     * @param {string} applicationName - name of the application
     * @return {void}
     */
    _make(type, applicationName){
        EventTarget._make.apply(this);

        this._view = Make(ApplicationWindowView)(this, applicationName);
        this._app = applicationName;
        this.type = type;
        this.viewPort = {
            _window: this,
            _dirty: false,
            bind: ({ template, view = {}, }) => {
                this._view._contentTemplate = template;
                this._view._contentView = view;
            },

            update() {
                this._dirty = true;
                this._window.emit('change', this);
            },

            get scope() { return this._window._view._contentView; },
        };
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
     * Closes the ApplicationWindow and destroys all scopes.
     * A `windowClose` event is emited
     *
     * @return {void}
     */
    close() {
        this._view._contentTemplate = null;
        this.emit('change');

        let index = zStack.indexOf(this);
        zStack.splice(index, REMOVE_ONE_ITEM);

        index = windowIndex[this._app].indexOf(this);
        windowIndex[this._app].splice(index, REMOVE_ONE_ITEM);

        this.emit('close');
    },

    /**
     * The window title
     *
     * @type {string}
     */
    get title() {
        return this._view.name;
    },

    set title(value) {
        this._view.name = value;

        this.emit('change', this);
    },

    get scope() {
        return this.viewPort.scope;
    },

    apperanceMode : function(mode) {
        this._blocksScreen = (mode === 'screenBlocking' && hasPrototype(this, WorkSpaceBorderToolWindow));
        this._stackMode = mode;

        this.emit('change', this);
    },

    setDimension : function(width, height) {
        this._view.dimension.height = height;
        this._view.dimension.width = width;

        this.emit('change', this);
    },

    setPosition : function(x, y) {
        this._view.position.x = x;
        this._view.position.y = y;

        this.emit('change', this);
    },

    __proto__: EventTarget,
};

/**
 * @lends ApplicationWindowView.prototype
 */
let ApplicationWindowView = {
    /** @type {string} */
    id : '',

    /** @type {string} */
    name : '',

    /**
     * @type {string}
     * @private
     */
    _getZIndex : null,

    /** @type {ApplicationWindow} */
    window: null,

    /** @borrows ApplicationWindow.prototype.close */
    closeWindow : null,

    /**
     * @type {{x: {number}, y: {number}}}
     */
    position : null,

    /**
     * @type {{height: {number}, width: {number}}}
     */
    dimension : null,

    _contentView: null,
    _contentTemplate: null,

    /**
     * @constructs
     * @param {ApplicationWindow} window - the window this view belongs to.
     * @param {string} applicationName - the application name.
     * @return {void}
     */
    _make : function(window, applicationName) {
        this.id = `${applicationName}#${windowIndex[applicationName].length}`;
        this.window = window,
        this.name = applicationName;
        this._getZIndex = calculateZIndexLevel.bind(null, window);
        this.closeWindow = window.close.bind(window);
        this.position = {
            _x: 150,
            _y: 150,

            get x() { return this._x; },
            set x(value) {
                this._x = value;
            },

            get y() { return this._y; },
            set y(value) {
                this._y = value;
            }
        };
        this.dimension = { height : 500, width : 600 };
        this.calculateStyle = this.calculateStyle;
    },
};

let WorkSpaceBorderToolWindow = Make({
    _make : function(type, applicationName){
        ApplicationWindow._make.apply(this, [type, applicationName]);

        this._view.side = 'unset';

        this._view.isVisible = function(){
            return this.side !== 'unset';
        };

        this._view.position.x = null;
        this._view.position.y = null;

        this._view.dimension.height = null;
        this._view.dimension.width = null;
    },

    dockTo : function(side) {
        this._view.side = side;
        this._localScope && this._localScope.update();
    }

}, ApplicationWindow).get();

let WindowManager = {
    name : 'System::WindowManager',
    headless : false,
    /**
     * [rootView description]
     * @type {Boolean}
     */
    rootView : true,
    viewPort: null,

    icons : [{
        name : '32',
        src : './userSpace/theme/window-manager.svg',
    }],

    /**
     * [windowList description]
     *
     * @type {string} [description]
     */
    get windowList() { return zStack; },

    init(window) {
        System.ApplicationManager.updateWindowManager(this.createApplicationWindow.bind(this));

        let [core] = System.ApplicationManager.getInstances('System::Core');

        core.on('ready', () => {
            window.viewPort.bind({ template: 'window-manager-template', view: this });

            this.viewPort = window.viewPort;
            System.ApplicationManager.emit('WindowManager');
            console.log('WindowManager is ready!');
        });
    },

    /**
     * [createApplicationWindow description]
     * @param  {Application} application         [description]
     * @param  {string} [type='mainWindow'] [description]
     * @return {Promise}                     [description]
     */
    createApplicationWindow(application, type='default') {
        let prototype = ApplicationWindow;

        if (!windowIndex[application.name]) {
            windowIndex[application.name] = [];
        }

        if (type == 'workSpaceBorderTool') {
            prototype = WorkSpaceBorderToolWindow;
        }

        const window = Make(prototype)(type, application.name);

        windowIndex[application.name].push(window);
        zStack.push(window);

        console.log('atempting to create new window!');

        window.on('change', () => this.viewPort.update());
        this.viewPort.update();

        return window;
    },

    __proto__: Application,
};

export default WindowManager;
