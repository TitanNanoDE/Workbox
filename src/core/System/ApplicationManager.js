import { Make } from '../../af/util/make';
import Log from '../System/Log';
import DataBinding from '@af-modules/databinding';
import Application from '../../af/core/Application';
import SystemHandlers from './SystemHandlers';
import UrlResolver from './UrlResolver';
import ApplicationMenuManager from './ApplicationMenuManager';

const IMEDIATE_INVOCE = 0;

let registeredApplications = {};
let logger = Log.use('ApplicationManager');
let instanceList = {};
let windowManagerReady = false;
const applicationSymbols = new WeakMap();

let initApplication = function(instance, manager) {
    let init = window => {
        logger.log(`Application ${instance.name} loaded!`);

        manager.emit('applicationLaunched', Make(ApplicationInfo)(instance));
        instance.init(window);

        return instance;
    };

    if (instance.noMainWindow) {
        init(null);
    } else {
        init(manager.requestApplicationMainWindow(instance));
    }
};

/**
 * @lends ApplicationInfo.prototype
 */
let ApplicationInfo = {
    name : null,
    displayName : null,
    icons : null,
    headless : false,

    /**
     * @constructs
     * @param {Application} application - the application from which the information should be extracted from.
     * @return {void}
     */
    _make : function(application) {
        this.name = application.name;
        this.displayName = application.displayName;
        this.icons = application.icons ? application.icons.slice() : [];
        this.headless = application.headless;
        this.symbol = applicationSymbols.get(application);
    }
};

const ApplicationManager = {

    name: 'ApplicationManager',

    _defaultViewTemplateRef: null,
    _defaultView: null,
    _fakeWindow: null,
    _scope: null,
    _viewPortUpdate() {},

    constructor() {
        super.constructor();
        const { scope } = DataBinding.createTemplateInstance({ template: '#main-view', scope: this });

        this._scope = scope;

        this.on('WindowManager', () => windowManagerReady = true);

        // fake window
        const fakeScope = () => this._defaultView;
        const fakeUpdate = () => this._viewPortUpdate;

        this._fakeWindow = {
            viewPort: {
                bind: ({ template, view = {} }) => {
                    this._defaultViewTemplateRef = template;
                    this._defaultView = view;
                    this._scope.update();
                },

                get scope() { return fakeScope(); },
                get update() { return fakeUpdate(); }
            }
        };

        return this;
    },

    updateWindowManager : function(newMethod){
        this.requestApplicationMainWindow = newMethod;
    },

    /**
     * requests a new window from the window manager. The default method creates a fake window with the main viewport.
     *
     * @return {Window} - a promise for the window creation.
     */
    requestApplicationMainWindow() {
        return this._fakeWindow;
    },

    /**
     * Registers a new application in the system
     *
     * @param {Application} application - the application which should be registered.
     * @return {ApplicationManager} - The ApplicationManager it self
     */
    register(application) {

        if (registeredApplications[application.name]) {
            logger.error(`Application "${application.name}" already exists!`);
            return;
        }

        registeredApplications[application.name] = application;
        applicationSymbols.set(application, Symbol(`ApplicationSymbol<${application.name}>`));

        if (application.resources) {
            Object.entries(application.resources)
                .forEach(([key, value]) => {
                    UrlResolver.packageResource(application.name, key, value);
                });
        }

        if (application.applicationMenu) {
            ApplicationMenuManager.registerMenu(applicationSymbols.get(application), application.applicationMenu);
        }

        logger.log(`Application ${application.name} registered!`);

        return ApplicationManager;
    },

    /**
     * launches an application by the given name
     *
     * @param {string} appName - the name of the application to launch.
     * @param {Application} source - the application which triggered the launch
     * @return {void}
     */
    launch : function(appName, source) {

        if (!registeredApplications[appName]) {
            return SystemHandlers.ErrorHandler.applicationNotAvailable(appName);
        }

        if (instanceList[appName] && instanceList[appName].length > 0) {
            logger.log(`Application ${appName} is already running!`);
            return;
        }

        const instance = Make(registeredApplications[appName])(source);

        logger.log(`launching ${appName}...`);

        if (!instanceList[appName]) {
            instanceList[appName] = [];
        }

        instanceList[appName].push(instance);

        if (!instance.headless && instance.rootView) {
            initApplication(instance, this);
        } else if(!instance.headless) {
            if (windowManagerReady) {
                initApplication(instance, this);
            } else {
                this.on('WindowManager', () => initApplication(instance, this));
            }
        } else {
            setTimeout(() => {
                logger.log(`Application ${appName} loaded!`);

                instance.init({});
            }, IMEDIATE_INVOCE);
        }
    },

    getInstances : function(appName) {
        return instanceList[appName];
    },

    getApplication : function(name) {
        const application = registeredApplications[name];

        return Make(ApplicationInfo)(application);
    },

    /**
     * @return {ApplicationInfo[]} - list of application info objects
     */
    getActiveApplicationList : function() {
        return Object.keys(instanceList).map(key => {
            let application = registeredApplications[key];

            return Make(ApplicationInfo)(application);
        });
    },

    __proto__: Application,
};

export default ApplicationManager.constructor();
