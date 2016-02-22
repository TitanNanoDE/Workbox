import { Make } from '../../util/make.js';
import Extendables from '../objects/Extendables.js';

// this prototype defines a new service scope
export default {
	thread : null,
	isReady : false,
	messageQueue : null,
	public : null,

    _make : function(){
        this.public = Make(Extendables.ServiceScopeInterface)(this);
        this.messageQueue = [];

        this._make = null;
    }
};
