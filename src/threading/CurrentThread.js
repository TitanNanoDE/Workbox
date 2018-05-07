import Thread from './Thread';

const IS_WORKER = (!!self.importScripts && !self.document);

const CurrentThread = {

    constructor: undefined,

    bootstrap(...args) {
        this._setupInterfaces();

        if (!IS_WORKER) {
            this._worker = new Worker(args[0]);
            this._worker.onmessage = this.onProcessMessage.bind(this);
            this._callbacks = {};
            this.call = undefined;
            this.publish('threads/io');

            return;
        }

        this._worker = self;
        this._worker.onmessage = this.onProcessMessage.bind(this);
        this._callbacks = {};

        if (args[0] && args[0].init) {
            return args[0].init();
        }
    },

    publish(identifier) {
        const channel = new BroadcastChannel(identifier);

        channel.onmessage = this.onProcessMessage.bind(this);
    },

    __proto__: Thread,
};

export default CurrentThread._createInterface();
