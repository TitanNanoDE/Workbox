import { Make } from '../../util/make.js';
import Extendables from '../objects/Extendables.js';

// this prototype defines a new mozilla addon scope
export default {
    name : 'addon',
    type : 'addon',
	public : null,

    _make : function(){
        this.public = Make(Extendables.MozillaAddonScopeInterface)(this);

        var self = this;
        this.private=  {
            public : this.public,
            onprogress : function(f){
                self.listeners.push({ type : 'progress', listener : f });
            }
        };

        this._make = null;
    }
};
