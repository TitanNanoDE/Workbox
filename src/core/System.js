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
import ApplicationMenuManager from './System/ApplicationMenuManager';

/**
 * @namespace
 */
let System = {
    ApplicationManager : ApplicationManager,
    Log : Log,
    PackageLoader : PackageLoader,
    Core : ApplicationManager.register(SystemCore).launch('System::Core'),
    SystemHandlers : SystemHandlers,
    ViewPort : ViewPort,
    ApplicationMenuManager,
};

export default System;
