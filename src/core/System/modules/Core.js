import { Make } from '../../../af/util/make';
import System from '../../System';
import Application from '../../../af/core/Application';
//import NetworkRequest from '../../../af/core/prototypes/NetworkRequest.js';
import SystemModules from '../modules';

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
        })
    },

    init : function(){
        this._logger = System.Log.use(this.name);
        this.loadModules();

        let [fileSystem] = System.ApplicationManager.getInstances('System::FileSystem');
        let volume = Make(fileSystem.volumePrototypes.IndexedDBVolume)();

        volume.ready.then(() => {
            let dirIndex = null;

            fileSystem.mount('/', volume);
            fileSystem.emit('ready');

            fileSystem.writeFile(`/tmp/${Date.now()}.log`, `system start!! ~ so wow!! ${new Date()}`);

            dirIndex = Object.keys(fileSystem.ls('/tmp/'));

            return fileSystem.readFile(`/tmp/${dirIndex[Math.round(Math.random() * dirIndex.length)]}`);
        }).then(file => {
            this._logger.log(file);
            this._logger.log('initializing...');
            setTimeout(() => this.emit('ready'), 3000);
        });
    },

    loadModules : function(){
        this._logger.log(`found ${SystemModules.length} modules!`);
        this._logger.log('loading system modules...');

        SystemModules.forEach(module => {
            System.ApplicationManager.register(module).launch(module.name);
        });
    }

}, Application).get();


export default SystemCore;
