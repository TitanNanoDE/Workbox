import ApplicationManager from '../System/ApplicationManager.js';

let Windows = {
    createWindow : function(application, type){
        return ApplicationManager.requestApplicationMainWindow(application, type);
    }
};

export default Windows;
