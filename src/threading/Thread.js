import 'subworkers';
import uuid from 'uuid';
import deepCopy from '../shared/deepCopy';
import { MessagePortTrait } from './traits';
import validateTrait from 'application-frame/core/validateTrait';
//const IS_WORKER = (!!self.importScript && !self.document);

const { create } = Object;
const MESSAGE_TYPE_CALL = 'THREAD_MESSAGE_CALL';
const MESSAGE_TYPE_RETURN_VALUE = 'THREAD_MESSAGE_RETURN_VALUE';
const MESSAGE_TYPE_CALLBACK = 'THREAD_MESSAGE_CALLBACK';
const MESSAGE_TYPE_EVENT = 'THREAD_MESSAGE_EVENT';

const getPropertyValue = function(source, property, target) {
    do {
        if (!source.hasOwnProperty(property)) {
            continue;
        }

        const desc = Object.getOwnPropertyDescriptor(source, property);

        if (desc.get) {
            return desc.get.apply(target);
        }

        return desc.value;
    } while ((source = Object.getPrototypeOf(source)));
};

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

                // make it clear that we are not a promise
                if (property === 'then') {
                    return null;
                }

                // we have to call a potential getter on the current object and not the target,
                // otherwise the `this` inside the getter will point to the
                // target and not to our actual current object
                if (property in target) {
                    return getPropertyValue(target, property, current);
                }

                if (property[0] === '_') {
                    return;
                }

                return (...args) => current.call(property, args);
            }
        });

        return proxy;
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

        if (type === MESSAGE_TYPE_EVENT) {
            const { name, data } = event.data;

            return this._onEventHandler(name, data);
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

    _onEventHandler(event, data) {
        if (!this._listeners || !this._listeners[event]) {
            return;
        }

        this._listeners[event].forEach(cb => cb(data));
    },

    _postMessage(message, transfers) {
        return this._worker.postMessage(message, transfers);
    },

    get handle() {
        if (!this._handle) {
            this._handle = new MessageChannel();
            this._handle.port1.onmessage = this._onProcessMessage.bind(this);
        }

        return this._handle.port2;
    },

    call(name, args, transfers = []) {
        return new Promise((success, reject) => {
            const worker = this._worker;
            const transaction = uuid();

            args.forEach((item, index) => {
                if (transfers.includes(item)) {
                    return;
                }

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

            this._postMessage({ type: MESSAGE_TYPE_CALL, name, args, transaction }, transfers);
        });
    },

    registerCallback(callback) {
        const id = `Callback<${uuid()}>`;

        this._callbacks[id] = callback;

        return id;
    },

    invokeCallback(callbackId, args) {
        args.forEach((item, index) => {
            args[index] = deepCopy(item);
        });

        this._postMessage({ type: MESSAGE_TYPE_CALLBACK, callbackId, args });
    },

    dispatchEvent(name, data) {
        this._postMessage({
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

    new(source) {
        const _worker = new Worker(source);
        const _callbacks = {};
        const instance = { _worker, _callbacks, __proto__: this };

        _worker.onmessage = instance._onProcessMessage.bind(instance);
        instance._setupInterfaces();

        return instance._createInterface();
    },

    from(port) {
        let _worker = null;

        if (typeof port === 'string') {
            _worker = new BroadcastChannel(port);
        } else if (validateTrait(port, MessagePortTrait)) {
            _worker = port;
        } else {
            throw new Error(`unable to create Thread from ${port.toString()}`);
        }

        const _callbacks = {};
        const instance = { _worker, _callbacks, __proto__: this };

        _worker.onmessage = instance._onProcessMessage.bind(instance);

        return instance._createInterface();
    }
};

export default Thread;
