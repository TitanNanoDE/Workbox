import Application from 'application-frame/core/Application';
import ScriptLoader from 'systemjs/dist/system-production.src';
import CurrentThread from './CurrentThread';
import { KernelThreadMeta } from './KernelThread';

const System = {
    Prototypes: {
        Application,
    },
};

CurrentThread.bootstrap({
    init() {
        KernelThreadMeta.inject(CurrentThread.parent);

        ScriptLoader.register('System', [], ($export) => {
            $export('default', System);
            $export('__esModule', true);

            return {};
        });
    }
});
