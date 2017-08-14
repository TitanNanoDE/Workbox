import Af from '../../../af/af.js';
import System from '../../System.js';

const NO_ZINDEX = 0;
const ZINDEX_IS_UNDEFINED = 0;
const BASIC_ZINDEX = 1;
const REMOVE_ONE_ITEM = 1;

let { Make, hasPrototype } = Af.Util;
let { Application, EventTarget } = Af.Prototypes;

let templates = {
    mainWindow : './core/System/templates/mainWindow.html',
    fullScreen : './core/System/templates/fullScreenWindow.html',
    workSpaceBorderToolWindow : './core/System/templates/workSpaceBorderToolWindow.html',
};

let windowIndex = {};

let zStack = [];

let blockingWindows = [];

let calculateZIndexLevel = function(window) {
    if ( window._stackMode === 'alwaysBehind') {
        return NO_ZINDEX;
    }else if (window._stackMode === 'alwaysOnTop') {
        return zStack.length + BASIC_ZINDEX;
    } else {
        return (zStack.indexOf(window) || ZINDEX_IS_UNDEFINED) + BASIC_ZINDEX;
    }
};

const CollisionTypes = { HORIZONTAL : 0, VERTICAL : 1 };

/**
 * @param {Object} window - rect representation of a window
 * @param {number} type - the direction type
 * @param {number} newValue - the new value which should be applied
 * @return {boolean} - when ever the new value will cause the window to collide
 */
let checkCollision = function(window, type, newValue) {
    let result = blockingWindows.find(item => {
        let willEnterX = (item.x <= newValue && newValue <= (item.x + item.width))
                         || (item.x >= newValue && item.x <= (newValue + window.width));

        let isInX = (item.x <= window.x && window.x <= (item.x + item.width))
                    || (item.x >= window.x && item.x <= (window.x + window.width));

        let willEnterY = (item.y <= newValue && newValue <= (item.y + item.height))
                         || (item.y >= newValue && item.y <= (newValue + window.height));

        let isInY = (item.y <= window.y && window.y <= (item.y + item.height))
                    || (item.y >= window.y && item.y <= (window.y + window.height));

        if (type === CollisionTypes.HORIZONTAL && willEnterX && isInY) {
            return true;
        }

        if (type === CollisionTypes.VERTICAL && willEnterY && isInX) {
            return true;
        }

        return false;
    });

    return !!result;
};

let getViewBoxFromWindow = function(window) {
    return {
        get x() { return window._view.position.x },
        get y() { return window._view.position.y },
        get height() { return window._view.dimension.height },
        get width() { return window._view.dimension.width },
    };
};

/**
 * @extends Af.Prototypes.EventTarget
 */
let ApplicationWindow = Make(/** @lends ApplicationWindow.prototype */{

    /**
     * @type {viewPortInstance}
     */
    viewPort : null,
    state : null,
    _view : null,
    _template : null,
    _stackMode : 'normal',
    _app : null,

    /**
     * @constructs
     * @param {string} type - window type
     * @param {string} applicationName - name of the application
     * @return {void}
     */
    _make : function(type, applicationName){
        EventTarget._make.apply(this);

        this._view = Make(ApplicationWindowView)(this, applicationName);
        this._app = applicationName;
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
     * Closes the ApplicationWindow and destroys all scopes.
     * A `windowClose` event is emited
     *
     * @return {void}
     */
    close : function(){
        this.emit('windowClose');

        this.viewPort.destory();
        System.ViewPort.free(this.viewPort);

        this._view.__destroy__();
        this._view.__cleanElements__();

        let index = zStack.indexOf(this);
        zStack.splice(index, REMOVE_ONE_ITEM);

        index = windowIndex[this._app].indexOf(this);
        windowIndex[this._app].splice(index, REMOVE_ONE_ITEM);


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
        this._view.__apply__();
    },

    get scope() {
        return this.viewPort.scope;
    },

    apperanceMode : function(mode) {
        if (mode === 'screenBlocking' && hasPrototype(this, WorkSpaceBorderToolWindow)) {
            blockingWindows.push(getViewBoxFromWindow(this));
        }

        this._stackMode = mode;
    },

    setDimension : function(width, height) {
        this._view.dimension.height = height;
        this._view.dimension.width = width;
    },

    setPosition : function(x, y) {
        this._view.position.x = x;
        this._view.position.y = y;
    },
}, EventTarget).get();

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

    /**
     * calculates the current style attribute for the window.
     *
     * @return {string} the value of the style attribute.
     */
    calculateStyle: function() {
        let position = `transform: translate3D(${this.position.x}px, ${this.position.y}px, 0);`;
        let dimensions = `height: ${this.dimension.height}px; width: ${this.dimension.width}px;`;
        let zIndex = `z-index: ${this._getZIndex()};`;

        return `${position} ${dimensions} ${zIndex}`;
    },

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
        this.closeWindow = window.close.bind(this);
        this.position = { x : 150, y : 150 };
        this.dimension = { height : 500, width : 300 };
        this.windowDrag =  Make({}, this.windowDrag).get();
        this.calculateStyle = this.calculateStyle;
    },

    windowDrag : {
        active : false,
        localOffset : { x: 0, y: 0},
        listener: null,

        /**
         * picks up a window
         *
         * @this ApplicationWindow#_view
         * @param  {MouseEvent} e the current mouse event
         *
         * @return {void}
         */
        grab : function(e) {
            let offsetX = e.pageX - this.position.x;
            let offsetY = e.pageY - this.position.y;

            this.windowDrag.active = true;
            this.windowDrag.listener = this.windowDrag.move.bind(this);
            this.windowDrag.localOffset = { x: offsetX, y: offsetY };
            window.addEventListener('mousemove', this.windowDrag.listener);
        },

        /**
         * drops a window
         *
         * @this ApplicationWindow#_view
         * @return {void}
         */
        drop : function() {
            this.windowDrag.active = false;
            window.removeEventListener('mousemove', this.windowDrag.listener);
        },

        /**
         * @this ApplicationWindow._view
         * @param {MouseEvent} e - the event object
         *
         * @return {void}
         */
        move : function(e) {
            if (this.windowDrag.active && e.clientX > 0 && e.clientY > 0) {
                let newX = e.pageX - this.windowDrag.localOffset.x;
                let newY = e.pageY - this.windowDrag.localOffset.y;

                if (!checkCollision(getViewBoxFromWindow(this.window), CollisionTypes.HORIZONTAL, newX)) {
                    this.position.x = newX;
                }

                if (!checkCollision(getViewBoxFromWindow(this.window), CollisionTypes.VERTICAL, newY)) {
                    this.position.y = newY;
                }

                this.__apply__(null, true);
            }
        }
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
            window.viewPort.bind({ template : './core/System/templates/WindowManager.html' }).then(() => {

                console.log('WindowManager is ready!');

                window.viewPort.scope.windowList = zStack;
                this.view = window.viewPort.scope;

                System.ApplicationManager.emit('WindowManager');
            });
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

        console.log('atempting to create new window!');

        this.view.__apply__();

        return System.ApplicationManager.getViewPortInstance(window._view.id).then(viewPort => {
            window.viewPort = viewPort;

            return window;
        });
    }
}, Application).get();

export default WindowManager;
