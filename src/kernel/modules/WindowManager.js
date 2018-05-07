import ApplicationManager from '../ApplicationManager';
import SystemHandlers from '../SystemHandlers';
import { Make, hasPrototype } from 'application-frame/util/make';
import Application from 'application-frame/core/Application';
import EventTarget from 'application-frame/core/EventTarget';
import ViewId from '../../shared/ViewId';
import { ViewControllerProxied } from '../ViewController';

const { create } = Object;

const NO_ZINDEX = 0;
const ZINDEX_IS_UNDEFINED = 0;
const BASIC_ZINDEX = 1;
const REMOVE_ONE_ITEM = 1;
const STACK_MODE_ALWAYS_BEHIND = 'alwaysBehind';
const STACK_MODE_ALWAYS_ON_TOP = 'alwaysOnTop';
const STACK_MODE_DEFAULT = 'default';

const FORCE_WINDOW_FOCUS = Symbol('ForceWindowFocus');

let windowIndex = {};

let zStack = [];

const viewToWindowMap = new WeakMap();

let calculateZIndexLevel = function(window) {
    if ( window._stackMode === STACK_MODE_ALWAYS_BEHIND) {
        return NO_ZINDEX;
    }else if (window._stackMode === STACK_MODE_ALWAYS_ON_TOP) {
        return zStack.length + BASIC_ZINDEX;
    } else {
        return (zStack.indexOf(window) || ZINDEX_IS_UNDEFINED) + BASIC_ZINDEX;
    }
};

/**
 * Closes the ApplicationWindow and destroys all scopes.
 * A `windowClose` event is emited
 *
 * @param {number} index
 *
 * @return {void}
 */
const closeWindow = function(index) {
    const window = zStack[index];

    window.emit('change');

    zStack.splice(index, REMOVE_ONE_ITEM);

    index = windowIndex[window._app].indexOf(window);
    windowIndex[window._app].splice(index, REMOVE_ONE_ITEM);

    window.emit('close');
};

/**
 * @todo implement this!
 * @return {void}
 */
const maximizeWindow = function() {
    SystemHandlers.ErrorHandler.methodNotImplemented('WindowManager');
};

/**
 * @todo implement this!
 * @return {void}
 */
const minimizeWindow = function() {
    SystemHandlers.ErrorHandler.methodNotImplemented('WindowManager');
};

const focusWindow = function(viewId) {
    const window = zStack.find(window => window._view.viewId === viewId);

    window.focus();
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
    _stackMode: STACK_MODE_DEFAULT,
    _blocksScreen: false,
    _app : null,
    _contentView: null,
    _contentViewId: null,

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
            bind: ({ template, view = {}, }) => {
                const viewController = create(ViewControllerProxied).constructor(template, view);

                viewController._id.then((viewId) => {
                    this._contentViewId = viewId;
                    this.emit('change', this);
                });

                this._contentView = viewController;
            },

            update() {
                this._window._contentView.update();
            },

            get scope() { return this._window._contentView; },
        };
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

    get hasFocus() {
        return zStack[zStack.length - 1] === this;
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

    /**
     * [focus description]
     * @param  {Symbol.<ForceWindowFocus>} force [description]
     * @return {[type]}       [description]
     */
    focus(force) {
        force = force === FORCE_WINDOW_FOCUS;

        if (!force && (zStack[zStack.length - 1] === this || this._stackMode !== STACK_MODE_DEFAULT)) {
            return false;
        }

        const index = windowIndex[this._app].indexOf(this);
        const zIndex = zStack.indexOf(this);
        const currentFocus = zStack[zStack.length - 1];

        if (!force && (index === -1 || zIndex === -1)) {
            return false;
        }

        if (index > 1) {
            windowIndex[this._app].splice(index, 1);
        }

        windowIndex[this._app].push(this);

        if (zIndex > -1) {
            zStack.splice(zIndex, 1);
        }

        zStack.push(this);

        currentFocus.emit('blur');
        this.emit('focus');
        this.emit('change', this);

        return true;
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
    get zIndex() {
        return calculateZIndexLevel.apply(null, [viewToWindowMap.get(this)]);
    },

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

    get type() {
        return viewToWindowMap.get(this).type;
    },

    get blocksScreen() {
        return viewToWindowMap.get(this)._blocksScreen;
    },

    get hasFocus() {
        return viewToWindowMap.get(this).hasFocus;
    },

    get viewId() {
        return ViewId.create(viewToWindowMap.get(this));
    },

    get __tracker() {
        return this.viewId;
    },

    get contentViewId() {
        return viewToWindowMap.get(this)._contentViewId;
    },

    /**
     * @constructs
     * @param {ApplicationWindow} window - the window this view belongs to.
     * @param {string} applicationName - the application name.
     * @return {void}
     */
    _make(window, applicationName) {
        this.id = `${applicationName}#${windowIndex[applicationName].length}`;
        this.name = applicationName;
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
        this._make = null;

        viewToWindowMap.set(this, window);
    },
};

let WorkSpaceBorderToolWindow = Make({
    _make : function(type, applicationName){
        ApplicationWindow._make.apply(this, [type, applicationName]);

        this._view.side = 'unset';

        Object.defineProperty(this._view, 'isVisible', {
            get() {
                return this.side !== 'unset';
            }
        });

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

    view: {
        get windowList() { return zStack.map(window => window._view); },
    },

    icons : [{
        name : '32',
        src : './userSpace/theme/window-manager.svg',
    }],

    /**
     * [windowList description]
     *
     * @type {string} [description]
     */
    init(window) {
        ApplicationManager.updateWindowManager(this.createApplicationWindow.bind(this));

        let [core] = ApplicationManager.getInstances('System::Core');

        core.on('ready', () => {
            window.viewPort.bind({ template: 'window-manager-template', view: this.view });

            this.viewPort = window.viewPort;
            this.viewPort.scope.minimizeWindow = minimizeWindow;
            this.viewPort.scope.maximizeWindow = maximizeWindow;
            this.viewPort.scope.closeWindow = closeWindow;
            this.viewPort.scope.focusWindow = focusWindow;
            this.viewPort.scope.callbacks = ['minimizeWindow', 'maximizeWindow', 'closeWindow', 'focusWindow'];
            this.viewPort.scope.registerCallbacks();

            ApplicationManager.emit('WindowManager');
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
        window.on('focus', () => this.emit('focuschange', { application: ApplicationManager.getApplication(application.name) }));
        window.focus(FORCE_WINDOW_FOCUS);

        this.viewPort.update();

        return window;
    },

    _not(value) {
        return !value;
    },

    __proto__: Application,
};

export default WindowManager;
