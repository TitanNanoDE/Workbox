import Tools from './SystemAPI/Tools.js';
import Log from './System/Log.js';
import Windows from './SystemAPI/Windows.js';
import Application from '../af/core/prototypes/Application.js';

let SystemAPI = {
    Tools : Tools,
    Log : Log,
    Windows : Windows,

    Prototypes : {
        Application : Application,
    }
};

export default SystemAPI;
