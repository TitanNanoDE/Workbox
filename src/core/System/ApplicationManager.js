'use strict';

import { Make } from '../../af/util/make.js';
import Log from '../System/Log.js';
import Application from '../../af/core/prototypes/Application.js';
import { DataBinding } from '../../af/modules/DataBinding.js';

let registeredApplications = {};
let logger = Log.use('ApplicationManager');
let viewPort = null;

let ApplicationManager = Make({

    _make : function(){
        Application._make.apply(this);

        this.on('updateWindowManager', newMethod => {
            this.requestApplicationMainWindow = newMethod;
        });
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

        if (!instance.headless) {
            this.requestApplicationMainWindow().then(window => {
                logger.log(`Application ${appName} loaded!`);

                instance.init(window);

                return instance;
            });
        } else {
            instance.init({});
        }
    }
}, Application)();

viewPort = Make(DataBinding.ViewPort)(ApplicationManager);

export default ApplicationManager;
