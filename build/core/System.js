import ApplicationManager from './System/ApplicationManager.js';
import Log from './System/Log.js';
import PackageLoader from './System/PackageLoader.js';
import SystemCore from './System/modules/Core.js';
import systemjs from 'es6-module-loader';

/**
 * @namespace
 */
let System = {
    ApplicationManager : ApplicationManager,
    Log : Log,
    PackageLoader : PackageLoader,
    Core : ApplicationManager.register(SystemCore).launch('System::Core'),
    ScriptImporter : systemjs.System
};

export default System;
