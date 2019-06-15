import {
    MESSAGE_TYPE_CALL, MESSAGE_TYPE_CALLBACK, MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_RETURN_VALUE, MESSAGE_TYPE_PARENT_INJECT
} from './messages';
import uuid from 'uuid';
import Thread from './Thread';
import CurrentThreadStore from './CurrentThreadStore';

const IS_WORKER = (!!self.importScripts && !self.document);
const { create } = Object;

const CurrentThread = {

    /** @type {Function[]} */
    _listeners: null,

    /** @type {Object.<string, Function>[]} */
    _callbacks: null,

    _parent: null,

    _worker: null,

    _config: null,

    _broadcastTargets: null,

    constructor: undefined,

    interfaces: [],

    /** @type {Thread} */
    mainThread: null,

    /** @type {Thread} */
    get parent() {
        if (!this._parent) {
            throw new Error('Thread has not been properly bootstrapped!');
        }

        return this._parent;
    },

    _setupInterfaces() {
        this.interfaces = this.interfaces.map(interfacce => create(interfacce)).reverse();
    },

    _onProcessMessage(event) {
        const { type } = event.data;

        if (type === MESSAGE_TYPE_CALL) {
            const { name, args, transaction } = event.data;

            return this._onCallHandler(name, args, transaction);
        }

        if (type === MESSAGE_TYPE_CALLBACK) {
            const { callbackId, args } = event.data;

            return this._onCallbackHandler(callbackId, args);
        }

        if (type === MESSAGE_TYPE_PARENT_INJECT) {
            const { parent } = event.data;

            return this._onParentInjectHandler(parent);
        }
    },

    _onCallHandler(name, params, transaction) {
        const responsibleInterface = this.interfaces.find(interfacce => !!interfacce[name]);

        if (!responsibleInterface) {
            throw new Error(`no interface declared the method ${name}!`);
        }

        return Promise.resolve(responsibleInterface[name](...params))
            .then(result => {
                this._postMessage({ type: MESSAGE_TYPE_RETURN_VALUE, return: result, transaction });
            }).catch(error => {
                this._postMessage({ type: MESSAGE_TYPE_RETURN_VALUE, error, transaction });
            });
    },

    _onCallbackHandler(id, args) {
        if (!this._callbacks[id]) {
            throw `unable to invoke ${id}!`;
        }

        this._callbacks[id].apply(null, args);
    },

    _onParentInjectHandler(parent) {
        this._parent = Thread.from(parent);

        if (this._config.init) {
            this._config.init();
        }
    },

    _postMessage(message, transfers) {
        this._broadcastTargets.forEach(target => target.port1.postMessage(message));

        return this._worker.postMessage(message, transfers);
    },

    registerCallback(callback) {
        const id = `Callback<${uuid()}>`;

        this._callbacks[id] = callback;

        return id;
    },

    dispatchEvent(name, data) {
        this._postMessage({
            type: MESSAGE_TYPE_EVENT,
            name, data
        });
    },

    bootstrap(...args) {
        this._setupInterfaces();
        this._callbacks = {};
        this._broadcastTargets = [];

        if (!IS_WORKER) {

            this._worker = new BroadcastChannel('threads/io');
            this._worker.onmessage = this._onProcessMessage.bind(this);
            this._worker.onerror = console.error.bind(console);

            CurrentThreadStore.set(this);

            const mainThread = Thread.new(args[0]);

            this.mainThread = mainThread;

            return mainThread;
        }

        this._worker = self;
        this._worker.onmessage = this._onProcessMessage.bind(this);
        this._worker.onerror = console.error.bind(console);
        this._config = args[0] || {};

        CurrentThreadStore.set(this);
        this.dispatchEvent('bootstrapping');
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
};

export default CurrentThread;
