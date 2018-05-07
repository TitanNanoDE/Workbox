export const MultiThreadEvent = {

    _thread: null,
    _eventName: '',
    _listeners: null,

    broadcast: false,

    constructor(eventName, thread, broadcast = false) {
        this._thread = thread;
        this._eventName = eventName;
        this._listeners = [];
        this.broadcast = broadcast;

        this._thread.addListener(eventName, (data) => {
            this._listeners.forEach(cb => cb(data));
        });

        return this;
    },

    dispatch(event) {
        this._thread.dispatchEvent(this._eventName, event);
    },

    addListener(callback) {
        this._listeners.push(callback);
    },
};

export default MultiThreadEvent;
