import Tools from './SystemAPI/Tools';
import Log from './System/Log';
import Windows from './SystemAPI/Windows';
import Application from '../af/core/Application';
import Applications from './SystemAPI/Applications';
import FileSystem from './SystemAPI/FileSystem';

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
