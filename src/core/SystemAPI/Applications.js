import ApplicationManager from '../System/ApplicationManager.js';

/** @namespace **/
let Applications = {
    getActiveApplicationList : ApplicationManager.getActiveApplicationList,
    getApplication : ApplicationManager.getApplication,
    on : ApplicationManager.on.bind(ApplicationManager),
    emit : ApplicationManager.emit.bind(ApplicationManager),
    current: {
        instance(application) {
            const list = ApplicationManager.getInstances(application.name);

            return list[list.length - 1];
        }
    }
};

export default Applications;
