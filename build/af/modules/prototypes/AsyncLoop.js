'use strict';

export default {
    _l : null,
	busy : false,
	step : 0,
	status : 'notstarted',

    _make : function(loop){
        this._l = loop;

        this._make = null;
    },

    run : function(){
        this.busy= true;
        var loop= this;
        return new Promise(function(success){
            var next= function(){
                loop.step++;
                loop.status= 'running';
                loop._l(next, exit);
            };

            var exit= function(status){
                if(status === 0)
                    loop.status= 'canceled';
                else if(status > 0)
                    loop.status= 'completed';
                else
                    loop.status= 'error';
                loop.busy= false;
                loop.step= 0;
                success(loop);
            };

            next();
        });
    }
};
