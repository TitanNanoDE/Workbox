import ApplicationManager from '../System/ApplicationManager.js';

let FileSystem = new Proxy({}, {
    get : function(target, property){
        return ApplicationManager.getInstances('System::FileSystem')[0][property];
    }
});

export default FileSystem;
