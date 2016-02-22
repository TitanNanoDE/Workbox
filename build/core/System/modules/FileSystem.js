import Af from '../../../af/af.js';

let { Make } = Af.Util;
let { Application } = Af.Prototypes;
let fileTree = null;
let volumes = [];

let FileSystem = Make({
    name : 'FileSystem',
    headless : true,

    ls : function(path){

    },

    mount : function(mountPoint, volume){
        let rawPoint = mountPoint.split('/');
        let tree = this._buildSubTree(volume.index);

        rawPoint.shift();

        let localVolumeInfo = {
            name : `\\V${volumes.length}`,
            subtree : tree,
            mountPoint : mountPoint,
            _access : volume.access,
        };

        volumes.push(localVolumeInfo);

        if (rawPoint.length === 1 && rawPoint === '') {
            fileTree = tree;
        } else {
            let entry = fileTree;
            let mountName = rawPoint.pop();

            rawPoint.forEach(item => entry = entry[item]);

            entry[mountName] = tree;
        }
    },

    _buildSubTree : function(volume) {
        let tree = {};

        Object.keys(volume).forEach(filePath => {
            let treeCursor = tree;
            filePath = filePath.split('/');

            filePath.shift();
            filePath.forEach((dir, index) => {
                if (index !== filePath.length) {
                    treeCursor = treeCursor[dir] = {};
                } else {
                    treeCursor[dir] = true;
                }
            });
        });

        return tree;
    }
}, Application).get();

export default FileSystem;
