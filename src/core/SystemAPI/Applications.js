import ApplicationManager from '../System/ApplicationManager.js';

/** @namespace **/
let Applications = {
    getActiveApplicationList : ApplicationManager.getActiveApplicationList,
    getApplication : ApplicationManager.getApplication,
    on : ApplicationManager.on.bind(ApplicationManager),
    emit : ApplicationManager.emit.bind(ApplicationManager),
};

export default Applications;
