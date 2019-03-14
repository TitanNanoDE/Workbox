import Application from 'application-frame/core/Application';
import NetworkRequest from 'application-frame/core/NetworkRequest';
import SystemHandlers from '../SystemHandlers';
import Thread from '../../threading/Thread';
import ApplicationManager from '../ApplicationManager';
import Log from '../Log';

const PackageLoader = {

    name: 'workbox.kernel.packageloader',

    headless: true,

    logger: null,

    constructor() {
        this.logger = Log.use('PackageLoader');
    },

    init() {
        SystemHandlers.registerHandler('error', 'applicationNotAvailable', this.onApplicationNotFound.bind(this));
        SystemHandlers.registerHandler('application', 'remoteLaunch', this.onRemoteLaunchApplication.bind(this));
    },

    onApplicationNotFound(name) {
        this.logger.log(`Trying to load Package ${name}`);

        return Object.create(NetworkRequest).constructor(`./packages/${name}.json`).send()
            .then(applicationMeta => {

                applicationMeta.remote = true;

                return ApplicationManager
                    .register(applicationMeta)
                    .launch(applicationMeta.name);
            });
    },

    onRemoteLaunchApplication(name) {
        const instance = Thread.new(`./process.js?${name}`);

        return instance.ready.then(() => instance.load(name)).then(() => instance);
    },

    __proto__: Application,
};

export default PackageLoader;
