'use strict';

import { Make } from '../../af/util/make.js';
import Log from '../System/Log.js';
import Application from '../../af/core/prototypes/Application.js';
import { DataBinding } from '../../af/modules/DataBinding.js';

let registeredApplications = {};
let logger = Log.use('ApplicationManager');
let viewPort = null;
let instanceList = {};
let windowManagerReady = false;

let initApplication = function(instance, manager) {
    manager.requestApplicationMainWindow(instance).then(window => {
        logger.log(`Application ${instance.name} loaded!`);

        instance.init(window);

        return instance;
    });
}

let ApplicationManager = Make({

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
     * @return Promise<Window>
     */
    requestApplicationMainWindow : function(){
        return viewPort.getInstance('default').then(viewPort => {
            return {
                viewPort : viewPort
            };
        });
    },

    /**
     * Registers a new application in the system
     *
     * @param {Application} application
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
     * @param {string} appName
     * @return {Application}
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
            }, 0);
        }
    },

    getInstances : function(appName) {
        return instanceList[appName];
    },

    getViewPortInstance : function(...args){
        return viewPort.getInstance(...args);
    }
}, Application)();

viewPort = Make(DataBinding.ViewPort)(ApplicationManager);

export default ApplicationManager;
