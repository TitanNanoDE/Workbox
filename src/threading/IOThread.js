import Thread from './Thread';

const IS_WORKER = (!!self.importScripts && !self.document);

if (!IS_WORKER) {
    throw new Error('IOThread can\'t be used inside the io thread itself! Use Thread instead!');
}


const IOThread = {

    _worker: new BroadcastChannel('threads/io'),

    constructor() {
        // we can't let all IOThread interfaces listen to message events they
        // can't handle. We have to perform some kind of filtering here.

        return this._createInterface();
    },

    __proto__: Thread,
};

export default IOThread.constructor();
