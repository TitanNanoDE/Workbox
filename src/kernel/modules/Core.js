import { Make } from 'application-frame/util/make';
import Log from '../Log';
import ApplicationManager from '../ApplicationManager';
import Application from 'application-frame/core/Application';
//import NetworkRequest from '../../../af/core/prototypes/NetworkRequest.js';
import * as SystemModules from '../modules';

const { create } = Object;

let SystemCore = Make({

    name : 'System::Core',

    /**
     * @type {LogInterface}
     */
    _logger : null,

    _parent : null,

    headless : true,

    _make : function(parent){
        Application._make.apply(this);

        this._parent = parent;

        this.on('terminate', reason => {
            this._logger.error(`Died -> ${reason}`);
        });
    },

    init : function(){
        this._logger = Log.use(this.name);
        this.loadModules();

        let [fileSystem] = ApplicationManager.getInstances('System::FileSystem');
        const systemVolume = create(fileSystem.volumePrototypes.StaticVolume).constructor();
        const volume = create(fileSystem.volumePrototypes.IndexedDBVolume).constructor();

        Promise.all([systemVolume.ready, volume.ready]).then(() => {
            let dirIndex = null;

            fileSystem.mount('/', systemVolume);
            fileSystem.mount('/local', volume);
            fileSystem.emit('ready');

            fileSystem.writeFile(`/local/tmp/${Date.now()}.log`, `system start!! ~ so wow!! ${new Date()}`);

            dirIndex = Object.keys(fileSystem.ls('/local/tmp/'));

            return fileSystem.readFile(`/local/tmp/${dirIndex[Math.round(Math.random() * dirIndex.length)]}`);
        }).then(file => {
            this._logger.log(file);
            this._logger.log('initializing...');
            setTimeout(() => this.emit('ready'), 3000);
        });
    },

    loadModules : function(){
        const SystemModulesList = Object.values(SystemModules);

        this._logger.log(`found ${SystemModulesList.length} modules!`);
        this._logger.log('loading system modules...');

        SystemModulesList.forEach(module => {
            ApplicationManager.register(module).launch(module.name);
        });
    }

}, Application).get();


export default SystemCore;
