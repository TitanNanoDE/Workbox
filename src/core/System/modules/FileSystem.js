import FileSystemDriver from '../drivers/VirtualFileSystem';
import { Plugins } from '../drivers/VirtualFileSystem';
import System from '../../System';
import { Make } from '../../../af/util/make';
import Application from '../../../af/core/Application';

let fileTree = null;
let volumes = [];
let logger = null;

let Volume = {
    type : 'volume',
    index : null,

    _make : function(){
        this.index = [];
    },

    /**
     * @param {string} path
     */
    readFile : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('Volume');
    },

    /**
     * @param {string} path
     * @param {string|Blob} content
     */
    writeFile : function(){
        System.SystemHandlers.ErrorHandler.methodNotImplemented('Volume');
    }
};

let IndexedDBVolume = Make({
    type : 'indexeddbvolume',
    store : '',
    ready : null,

    _make : function(store) {
        Volume._make.apply(this);

        this.store = store;

        this.ready = FileSystemDriver.getFileList({ system : this.store }).then(index => {
            this.index = index;
        });
    },

    readFile : function(path) {
        return FileSystemDriver.openFile({ path : path, system : this.store })
            .then(dbFile => {
                let file = Make({ type : dbFile.mimeType, content : dbFile.data }, File)();

                return file;
            });
    },

    writeFile : function(path, file) {
        path = path.split('/');
        let [name, type] = path.pop().split('.');

        let dbFile = Make(FileSystemDriver.DbFile)(name, type, file.content);

        return FileSystemDriver.saveFileTo({ path : path.join('/') + '/', file : dbFile });
    }
}, Volume).get();

let File = {
    type : '',
    content : '',
};

let buildSubTree = function(index, tree = {}) {
    index.forEach(filePath => {
        let treeCursor = tree;
        filePath = filePath.split('/');

        filePath.shift();
        filePath.forEach((dir, index) => {

            if (index === filePath.length - 1) {
                treeCursor[dir] = true;
            } else if (!treeCursor[dir]) {
                treeCursor = treeCursor[dir] = {};
            } else {
                treeCursor = treeCursor[dir];
            }
        });
    });

    return tree;
};

let FileSystem = Make({
    name : 'System::FileSystem',
    headless : true,

    ls : function(path){
        let cursor = fileTree;

        path = path.split('/');
        path.shift();

        while (path[0]) {
            cursor = fileTree[path.shift()];

            if (cursor === undefined) {
                logger.log('ls ~ invalide path!');
                return null;
            }
        }

        return cursor;
    },

    mount : function(mountPoint, volume){
        let rawPoint = mountPoint.split('/');
        let tree = buildSubTree(volume.index);

        rawPoint.shift();

        let localVolumeInfo = {
            name : `\\V${volumes.length}`,
            subtree : tree,
            mountPoint : mountPoint,
            _actual : volume,
        };

        volumes.push(localVolumeInfo);

        if (rawPoint.length === 1 && rawPoint[0] === '') {
            fileTree = tree;
        } else {
            let entry = fileTree;
            let mountName = rawPoint.pop();

            rawPoint.forEach(item => entry = entry[item]);

            entry[mountName] = tree;
        }
    },

    writeFile : function(path, content) {
        let file = null;
        // find the volume to write on
        let volume = volumes.sort((a, b) => a.mountPoint.length > b.mountPoint.length)
            .find(volume => path.indexOf(volume.mountPoint) === 0);

        //adjust path to be absolute to the volume
        path = path.replace(volume.mountPoint, '');
        path = (path[0] !== '/') ? ('/' + path) : path;

        //create file
        file = Make({
            content : content
        }, File)();

        return volume._actual.writeFile(path, file).then(file => {
            buildSubTree([path], volume.subtree);

            return file;
        });
    },

    readFile : function(path) {
        // find the volume
        let volume = volumes.sort((a, b) => a.mountPoint.length > b.mountPoint.length)
            .find(volume => path.indexOf(volume.mountPoint) === 0);

        //adjust path to be absolute to the volume
        path = path.replace(volume.mountPoint, '');
        path = (path[0] !== '/') ? ('/' + path) : path;

        return volume._actual.readFile(path);

    },

    volumePrototypes : {
        IndexedDBVolume : IndexedDBVolume
    },

    File : File,

    init : function(){
        logger = System.Log.use('System::FileSystem');
        Plugins.logger = System.Log.use('AF::FileSystemDriver');
    }
}, Application).get();

export default FileSystem;
