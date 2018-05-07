import Log from '../../Log';
import SystemHandlers from '../../SystemHandlers';
import Volume from './Volume';
import fileIndex from '../../static-volume.json';

const StaticVolume = {
    type : 'staticvolume',
    logger: null,
    ready: null,

    constructor() {
        this.index = fileIndex.map(path => `/${path}`);
        this.ready = Promise.resolve();
        this.logger = Log.use('FileSystem:StaticVolume');

        return this;
    },

    /**
     * @param {string} path
     */
    readFile() {
        SystemHandlers.ErrorHandler.methodNotImplemented('Volume');
    },

    /**
     * @param {string} path
     * @param {string|Blob} content
     */
    writeFile(path) {
        this.logger.error(`static volumes are read only! Unable to write file ${path}!`);

        return Promise.reject('not supported');
    },

    __proto__: Volume,
};

export default StaticVolume;
