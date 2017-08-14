'use strict';

import { Make } from '../../af/util/make.js';
import Log from '../System/Log.js';
import ViewPort from './ViewPort.js';
import Application from '../../af/core/prototypes/Application.js';

const IMEDIATE_INVOCE = 0;

let registeredApplications = {};
let logger = Log.use('ApplicationManager');
let instanceList = {};
let windowManagerReady = false;

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
        manager.requestApplicationMainWindow(instance).then(init);
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
    }
};

let ApplicationManager = Make({

    name: 'ApplicationManager',

    _make : function(){
        Application._make.apply(this);

        this.on('WindowManager', () => windowManagerReady = true);
    },

    updateWindowManager : function(newMethod){
        this.requestApplicationMainWindow = newMethod;
    },

    getApplication : function(){},

    /**
     * requests a new window from the window manager. The default method creates a fake window with the main viewport.
     *
     * @return {Promise<Window>} - a promise for the window creation.
     */
    requestApplicationMainWindow : function(){
        return ViewPort.getInstance('default').then(viewPort => {
            return {
                viewPort : viewPort
            };
        });
    },

    /**
     * Registers a new application in the system
     *
     * @param {Application} application - the application which should be registered.
     * @return {ApplicationManager} - The ApplicationManager it self
     */
    register : function(application){

        if (!registeredApplications[application.name]) {
            registeredApplications[application.name] = application;
            logger.log(`Application ${application.name} registered!`);
        } else {
            logger.error(`Application "${application.name}" already exists!`);
        }

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
        logger.log(`launching ${appName}...`);

        let instance = Make(registeredApplications[appName])(source);

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

    getViewPortInstance : function(...args){
        return ViewPort.getInstance(...args);
    },

    getApplication : function(name) {
        let application = Object.keys(registeredApplications).find(application => {
            return application.name === name;
        });

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
    }
}, Application)();

export default ApplicationManager;
