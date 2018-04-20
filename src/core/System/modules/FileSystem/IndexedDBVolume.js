import Volume from './Volume';
import FileSystemDriver from '../../drivers/VirtualFileSystem';
import File from './File';

const { create } = Object;

const IndexedDBVolume = {
    type : 'indexeddbvolume',
    store : '',
    ready : null,

    constructor(store) {
        super.constructor();

        this.store = store;

        this.ready = FileSystemDriver.getFileList({ system : this.store }).then(index => {
            this.index = index;
        });

        return this;
    },

    readFile(path) {
        return FileSystemDriver.openFile({ path : path, system : this.store })
            .then(dbFile => {
                const file = { type : dbFile.mimeType, content : dbFile.data, __proto__: File };

                return file;
            });
    },

    writeFile(path, file) {
        path = path.split('/');

        const [name, type] = path.pop().split('.');
        const dbFile = create(FileSystemDriver.DbFile).constructor(name, type, file.content);

        return FileSystemDriver.saveFileTo({ path : path.join('/') + '/', file : dbFile });
    },

    __proto__: Volume,
};

export default IndexedDBVolume;
