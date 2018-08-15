import { Plugins } from '../../drivers/VirtualFileSystem';
import Application from 'application-frame/core/Application';
import Log from '../../Log';
import IndexedDBVolume from './IndexedDBVolume';
import StaticVolume from './StaticVolume';
import File from './File';

let fileTree = null;
const volumes = [];
let logger = null;

const buildSubTree = function(index, tree = {}) {
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

const FileSystem = {
    name : 'workbox.kernel.filesystem',
    headless : true,

    ls(path) {
        let cursor = fileTree;

        path = path.split('/');
        path.shift();

        while (path[0]) {
            cursor = cursor[path.shift()];

            if (cursor === undefined) {
                logger.log('ls ~ invalide path!');
                return null;
            }
        }

        return cursor;
    },

    mount(mountPoint, volume) {
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

    writeFile(path, content) {
        const volume = this.findMatchingVolume(path);

        //adjust path to be absolute to the volume
        path = path.replace(volume.mountPoint, '');
        path = (path[0] !== '/') ? ('/' + path) : path;

        //create file
        const file = {
            content : content,

            __proto__: File,
        };

        return volume._actual.writeFile(path, file).then(file => {
            buildSubTree([path], volume.subtree);

            return file;
        });
    },

    readFile(path) {
        const volume = this.findMatchingVolume(path);

        //adjust path to be absolute to the volume
        path = path.replace(volume.mountPoint, '');
        path = (path[0] !== '/') ? ('/' + path) : path;

        return volume._actual.readFile(path);

    },

    findMatchingVolume(path) {
        return volumes.sort((a, b) => {
            if (a.mountPoint.length > b.mountPoint.length) {
                return -1;
            }

            if (a.mountPoint.length === b.mountPoint.length) {
                return 0;
            }

            if (a.mountPoint.length < b.mountPoint.length) {
                return 1;
            }

        }).find(volume => path.indexOf(volume.mountPoint) === 0);
    },

    volumePrototypes: {
        IndexedDBVolume,
        StaticVolume,
    },

    File,

    init() {
        logger = Log.use('System::FileSystem');
        Plugins.logger = Log.use('AF::FileSystemDriver');
    },

    __proto__: Application,
};

export default FileSystem;
