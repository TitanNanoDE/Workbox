// core extensions for the default ApplicationFrame modules - copyright by TitanNano / Jovan Gerodetti - http://www.titannano.de

import { Make } from 'util/make';

var apply= function($$){
	"use strict";

	var ListExtension = Make({
        last : function(){
            return this[this.length -1];
        },

        find : $$.Array.prototype.find,
        indexOf : $$.Array.prototype.indexOf,
        map : $$.Array.prototype.map
    });

    ['Array', 'NodeList', 'TouchList'].forEach(function(type){
        if($$[type]){
            $$[type].prototype = Make(ListExtension, $$[type].prototype);
        }
    });

};

export var coreExtension = {
    apply : apply
};

export var config = {
    main : 'coreExtensions',
    author : 'Jovan Gerodetti',
    version : '0.2'
};
