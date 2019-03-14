import 'subworkers';
import uuid from 'uuid';
import deepCopy from '../shared/deepCopy';
import { MessagePortTrait } from './traits';
import {
    MESSAGE_TYPE_CALL, MESSAGE_TYPE_CALLBACK, MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_RETURN_VALUE, MESSAGE_TYPE_PARENT_INJECT
} from './messages';
import validateTrait from 'application-frame/core/validateTrait';
import CurrentThreadStore from './CurrentThreadStore';

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

const constructThread = function(_worker, prototype) {
    const instance = { _worker, __proto__: prototype };

    instance.ready = new Promise((resolve) => {
        instance.addListener('bootstrapping', instance._onBootstrapping.bind(instance, resolve));
    });

    instance._worker.onmessage = instance._onEventHandler.bind(instance);
    instance._worker.onerror = console.error.bind(console);

    return instance._createInterface();
};

const Thread = {
    /** @type {Worker} */
    _worker: null,

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

    _postMessage(message, transfers) {
        return this._worker.postMessage(message, transfers);
    },

    _onEventHandler(event) {
        const { type, name, data } = event.data;

        if (type !== MESSAGE_TYPE_EVENT || !this._listeners || !this._listeners[name]) {
            return;
        }

        this._listeners[name].forEach(cb => cb(data));
    },

    _onBootstrapping(setReady) {
        /** @type {CurrentThread} */
        const parentThread = CurrentThreadStore.get();
        const channel = new MessageChannel();

        channel.port1.onmessage = parentThread._onProcessMessage.bind(parentThread);
        channel.port1.onerror = parentThread._onProcessMessage.bind(parentThread);

        parentThread._broadcastTargets.push(channel);

        this._postMessage({ type: MESSAGE_TYPE_PARENT_INJECT, parent: channel.port2 }, [channel.port2]);
        setReady();
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

    invokeCallback(callbackId, args) {
        args.forEach((item, index) => {
            args[index] = deepCopy(item);
        });

        this._postMessage({ type: MESSAGE_TYPE_CALLBACK, callbackId, args });
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

        return constructThread(_worker, this);
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

        return constructThread(_worker, this);
    }
};

export default Thread;
