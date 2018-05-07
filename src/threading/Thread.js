import 'subworkers';
import uuid from 'uuid';
import deepCopy from '../shared/deepCopy';
//const IS_WORKER = (!!self.importScript && !self.document);

const { create } = Object;
const MESSAGE_TYPE_CALL = 'THREAD_MESSAGE_CALL';
const MESSAGE_TYPE_RETURN_VALUE = 'THREAD_MESSAGE_RETURN_VALUE';
const MESSAGE_TYPE_CALLBACK = 'THREAD_MESSAGE_CALLBACK';
const MESSAGE_TYPE_EVENT = 'THREAD_MESSAGE_EVENT';

const Thread = {
    /** @type {Worker} */
    _worker: null,

    /** @type {Object.<string, Function>[]} */
    _callbacks: null,

    /** @type {Function[]} */
    _listeners: {},

    interfaces: [],

    _setupInterfaces() {
        this.interfaces = this.interfaces.map(interfacce => create(interfacce)).reverse();
    },

    _createInterface() {
        const proxy = new Proxy (this, {
            get(target, property, current) {
                if (target[property]) {

                    return target[property];
                }

                return (...args) => current.call(property, args);
            }
        });

        return proxy;
    },

    constructor(source) {
        this._worker = new Worker(source);
        this._setupInterfaces();
        this._worker.onmessage = this.onProcessMessage.bind(this);
        this._callbacks = {};

        return this._createInterface();
    },

    onProcessMessage(event) {
        const { type } = event.data;

        if (type === MESSAGE_TYPE_CALL) {
            const { name, args, transaction } = event.data;

            return this.onCallHandler(name, args, transaction);
        }

        if (type === MESSAGE_TYPE_CALLBACK) {
            const { callbackId, args } = event.data;

            return this.onCallbackHandler(callbackId, args);
        }

        if (type === MESSAGE_TYPE_EVENT) {
            const { name, data } = event.data;

            return this.onEventHandler(name, data);
        }
    },

    onCallHandler(name, params, transaction) {
        const responsibleInterface = this.interfaces.find(interfacce => !!interfacce[name]);

        if (!responsibleInterface) {
            throw `no interface declared the method ${name}!`;
        }

        return Promise.resolve(responsibleInterface[name](...params))
            .then(result => {
                this._worker.postMessage({ type: MESSAGE_TYPE_RETURN_VALUE, return: result, transaction });
            }).catch(error => {
                this._worker.postMessage({ type: MESSAGE_TYPE_RETURN_VALUE, error, transaction });
            });
    },

    call(name, args) {
        return new Promise((success, reject) => {
            const worker = this._worker;
            const transaction = uuid();

            args.forEach((item, index) => {
                args[index] = deepCopy(item);
            });

            this._worker.addEventListener('message', function returnHandler({ data }) {
                if (data.type !== MESSAGE_TYPE_RETURN_VALUE || data.transaction !== transaction) {
                    return;
                }

                worker.removeEventListener('message', returnHandler);

                if (data.error) {
                    return reject(data.error);
                }

                return success(data.return);
            });

            this._worker.postMessage({ type: MESSAGE_TYPE_CALL, name, args, transaction });
        });
    },

    registerCallback(callback) {
        const id = `Callback<${uuid()}>`;

        this._callbacks[id] = callback;

        return id;
    },

    onCallbackHandler(id, args) {
        if (!this._callbacks[id]) {
            throw `unable to invoke ${id}!`;
        }

        this._callbacks[id].apply(null, args);
    },

    invokeCallback(callbackId, args) {
        args.forEach((item, index) => {
            args[index] = deepCopy(item);
        });

        this._worker.postMessage({ type: MESSAGE_TYPE_CALLBACK, callbackId, args });
    },

    dispatchEvent(name, data) {
        this._worker.postMessage({
            type: MESSAGE_TYPE_EVENT,
            name, data
        });
    },

    addListener(name, cb) {
        if (!this._listeners) {
            this._listeners = {};
        }

        if (!this._listeners[name]) {
            this._listeners[name] = [];
        }

        this._listeners[name].push(cb);
    },

    onEventHandler(event, data) {
        if (!this._listeners || !this._listeners[event]) {
            return;
        }

        this._listeners[event].forEach(cb => cb(data));
    }
};

export default Thread;
