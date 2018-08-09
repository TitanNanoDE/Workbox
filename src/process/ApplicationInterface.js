import ScriptLoader from 'systemjs/dist/system-production.src';
import { KernelThread } from './KernelThread';
import IOThread from '../threading/IOThread';
import { Window } from './api/prototypes';

let applicationSource = null;
let applicationInstance = null;

const ApplicationInterface = {

    load(name) {
        if (!KernelThread) {
            throw new Error('a kernel thread has to be injected before any application code can be loaded!');
        }

        if (applicationSource) {
            return;
        }

        self.define = ScriptLoader.amdDefine;

        return ScriptLoader.import(`./packages/${name}.js`)
            .then(mod => {
                applicationSource = mod.default;

                self.define = undefined;

                if (!applicationSource.headless) {
                    return IOThread.loadViews(name);
                }
            });
    },

    init(mainWindow) {
        applicationInstance = Object.create(applicationSource);

        if (mainWindow) {
            mainWindow = Window.new(mainWindow);
        }

        return applicationInstance.init(mainWindow);
    },

    headless() {
        return !!applicationSource.headless;
    },

    noMainWindow() {
        return !!applicationSource.noMainWindow;
    },

    name() { return applicationSource.name; },

    displayName() { return (applicationInstance || applicationSource).displayName; },

    icons() { return applicationSource.icons; },
};

export default ApplicationInterface;
