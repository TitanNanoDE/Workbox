import CurrentThread from './CurrentThread';
import { IOThread } from '../threading';

export const ViewController = {
    _id: null,
    _updateBuffer: null,

    constructor(templateId) {
        this._id = IOThread.createView(templateId);
        this._viewChanged = [];
        this.registerCallbacks();

        return this;
    },

    commit(update) {
        return this._id.then(id => {
            return IOThread.updateView(id, update);
        });
    },

    registerCallbacks() {
        if (!this.callbacks) {
            return;
        }

        this.callbacks.forEach((key) => {
            if (typeof this[key] !== 'function') {
                return;
            }

            this[key] = CurrentThread.registerCallback(this[key].bind(this));
        });
    },

    onViewChanged(cb) {
        this._id.then(id => IOThread.addListener(`ViewUpdate/${id}`, cb));
    }
};

export const ViewControllerProxied = {
    constructor(templateId, buffer = {}) {
        super.constructor(templateId);

        this._updateBuffer = buffer;

        this.onViewChanged(event => {
            let host = this._updateBuffer;

            event.path.forEach(item => {
                const tracker = item.match(/\{track:([^}]+)\}/);

                if (tracker) {
                    host = host.find(item => item.__tracker === tracker[1]);
                    return;
                }

                host = host[item];
            });

            host[event.property] = event.value;
        });

        return new Proxy(this, {
            set(target, key, value) {
                target._updateBuffer[key] = value;

                return true;
            },

            get(target, key) {
                if (key in target) {
                    return target[key];
                }

                return target._updateBuffer[key];
            }
        });
    },

    setProperty(key, value) {
        this._updateBuffer[key] = value;
    },

    update() {
        this.commit(this._updateBuffer);
    },

    __proto__: ViewController,
};

export default ViewController;
