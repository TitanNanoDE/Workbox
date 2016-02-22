import Engine from '../objects/Engine.js';

// this prototype defines a new scope worker
export default {
    scope : null,
    thread : null,
    progressListeners : null,
    promise : null,

    _make : function(f, scope){
        var self= this;

        this.scope= scope;
        this.thread= new Worker(Engine.shared.threadLoader);
        this.thread.postMessage({ name : 'init', func : f });
        this.progressListeners= [];

        this.promise= new Promise(function(done){
            self.thread.addEventListener('message', function(e){
                if(e.data.name == 'af-worker-done')
                    done(e.data.data);
            }, false);
        });

        this.thread.addEventListener('message', function(e){
            if(e.data.name == 'af-worker-progress')
                self.progressListners.forEach(function(item){
                    item(e.data.data);
                });
        }, false);
    }
};
