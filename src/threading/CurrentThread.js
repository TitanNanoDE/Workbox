import Thread from './Thread';

const IS_WORKER = (!!self.importScripts && !self.document);

const CurrentThread = {

    constructor: undefined,

    bootstrap(...args) {
        this._setupInterfaces();

        if (!IS_WORKER) {
            this._worker = new Worker(args[0]);
            this._worker.onmessage = this._onProcessMessage.bind(this);
            this._callbacks = {};
            this.call = undefined;
            this.publish('threads/io');

            return;
        }

        this._worker = self;
        this._worker.onmessage = this._onProcessMessage.bind(this);
        this._callbacks = {};

        if (args[0] && args[0].init) {
            return args[0].init();
        }
    },

    publish(identifier) {
        const channel = new BroadcastChannel(identifier);
        const oldPostMessage = this._postMessage;

        channel.onmessage = this._onProcessMessage.bind(this);

        this._postMessage = function(...args) {
            channel.postMessage(...args);

            return oldPostMessage.apply(this, args);
        };
    },

    __proto__: Thread,
};

export default CurrentThread._createInterface();
