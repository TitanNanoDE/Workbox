import Application from 'application-frame/core/Application';
import ScriptLoader from 'systemjs/dist/system-production.src';
import CurrentThread from './CurrentThread';

const System = {
    Prototypes: {
        Application,
    },
};

CurrentThread.bootstrap({
    
    init() {
        ScriptLoader.register('System', [], ($export) => {
            $export('default', System);
            $export('__esModule', true);

            return {};
        });
    }
});
