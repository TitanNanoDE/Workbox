import Shared from '../objects/Shared.js';

/**
 * this prototype defines a new scope worker
 */
let Thread = {

    /**
     * The parent application of this thread.
     *
     * @type {Application}
     */
    parent : null,

    /**
     * The Worker Object for this thread.
     *
     * @type {Worker}
     * @private
     */
    _thread : null,

    _promise : null,

    then : null,

    catch : null,

    /**
     * @constructs
     * @param {function} f
     * @param {Application} parent
     */
    _make : function(f, parent){
        this.parent= parent;
        this.thread= new Worker(Shared.threadLoader);
        this.thread.postMessage({ name : 'init', func : f });
        this.progressListeners= [];

        this._promise = new Promise((done) => {
            this._thread.addEventListener('message', function(e){
                if(e.data.name == 'af-worker-done')
                    done(e.data.data);
            }, false);
        });

        this._thread.addEventListener('message', e => {
            if(e.data.name == 'af-worker-progress') {
                this.emit('progress', e.data.data);
            }
        }, false);

        this.then = this._promise.then.bind(this._promise);
        this.catch = this._promise.catch.bind(this._promise);
    }
};

export default Thread;
