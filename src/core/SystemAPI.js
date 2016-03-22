import Tools from './SystemAPI/Tools.js';
import Log from './System/Log.js';
import Windows from './SystemAPI/Windows.js';
import Application from '../af/core/prototypes/Application.js';
import Applications from './SystemAPI/Applications.js';
import FileSystem from './SystemAPI/FileSystem.js';

let SystemAPI = {
    Tools : Tools,
    Log : Log,
    Windows : Windows,
    Applications : Applications,
    FileSystem : FileSystem,

    Prototypes : {
        Application : Application,
    }
};

export default SystemAPI;
