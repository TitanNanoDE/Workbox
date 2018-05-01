import Tools from './SystemAPI/Tools';
import Log from './System/Log';
import Windows from './SystemAPI/Windows';
import Application from '../af/core/Application';
import Applications from './SystemAPI/Applications';
import FileSystem from './SystemAPI/FileSystem';
import ApplicationMenu from './SystemAPI/ApplicationMenu';
import { ApplicationMenu as ApplicationMenuProto } from './System/ApplicationMenuManager';

let SystemAPI = {
    Tools,
    Log,
    Windows,
    Applications,
    FileSystem,
    ApplicationMenu,

    Prototypes: {
        Application,
        ApplicationMenu: ApplicationMenuProto,
    }
};

export default SystemAPI;
