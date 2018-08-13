import SystemHandlers from '../../SystemHandlers';

const Volume = {
    type : 'volume',
    index : null,
    get ready() { return Promise.reject('volume not initialized'); },

    constructor() {
        this.index = [];

        return this;
    },

    _make(...args) { return this.constructor(...args); },

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
    writeFile() {
        SystemHandlers.ErrorHandler.methodNotImplemented('Volume');
    }
};

export default Volume;
