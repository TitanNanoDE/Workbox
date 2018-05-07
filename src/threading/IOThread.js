import Thread from './Thread';

const IS_WORKER = (!!self.importScripts && !self.document);

if (!IS_WORKER) {
    throw new Error('IOThread can\'t be used inside the io thread itself! Use Thread instead!');
}


const IOThread = {

    _worker: new BroadcastChannel('threads/io'),

    constructor() {
        this._worker.onmessage = this.onProcessMessage.bind(this);
        this._setupInterfaces();

        return this._createInterface();
    },

    __proto__: Thread,
};

export default IOThread.constructor();
