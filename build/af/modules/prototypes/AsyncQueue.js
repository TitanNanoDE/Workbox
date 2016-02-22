export default {
    queue : null,
    active : false,
    processor : null,

    _make : function(processor){
        this._processor = processor;

        this._make = null;
    },

    next : function(){
        if(this.queue.length > 0){
            this.integrate(...this.queue.shift());
            this.next();
        }else{
            this.active= false;
        }
    },

    push : function(...args){
		return new Promise(done => {
            args.push(done);
            this.queue.push(args);

            if(!this.active){
                this.active= true;
                this.next();
            }
		}).then(() => this.next());
	}
};
