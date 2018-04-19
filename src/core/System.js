import '../bindings/GetterBinding';
import '../components/ViewPort';
import '../components/ApplicationWindow';
import '../components/EncapsulatedContent';
import '../components/WindowManager';
import '../components/SystemIcon';
import ApplicationManager from './System/ApplicationManager.js';
import Log from './System/Log.js';
import PackageLoader from './System/PackageLoader.js';
import SystemCore from './System/modules/Core.js';
import SystemHandlers from './System/SystemHandlers';
import ViewPort from './System/ViewPort.js';

/**
 * @namespace
 */
let System = {
    ApplicationManager : ApplicationManager,
    Log : Log,
    PackageLoader : PackageLoader,
    Core : ApplicationManager.register(SystemCore).launch('System::Core'),
    //ScriptImporter : systemjs.System,
    SystemHandlers : SystemHandlers,
    ViewPort : ViewPort,
};

export default System;
