import Application from '../../../af/core/Application';
import System from '../../System';
import SystemAPI from '../../SystemAPI';
import ScriptLoader from 'systemjs/dist/system-production.src';

const PackageLoader = {

    name: 'system.module.PackageLoader',

    headless: true,

    logger: null,

    constructor() {
        this.logger = System.Log.use('PackageLoader');
        this.scriptLoader = ScriptLoader;
    },

    init() {
        this.scriptLoader.register('System', [], ($export) => {
            $export('default', SystemAPI);
            $export('__esModule', true);

            return {};
        });

        System.SystemHandlers.registerHandler('error', 'applicationNotAvailable', this.onApplicationNotFound.bind(this));
    },

    onApplicationNotFound(name) {
        this.logger.log(`Trying to load Package ${name}`);

        return this.scriptLoader.import(`./packages/${name}.js`)
            .then(pack => {
                System.ApplicationManager.register(pack.default)
                    .launch(pack.default.name);
            });
    },

    __proto__: Application,
};

export default PackageLoader;
