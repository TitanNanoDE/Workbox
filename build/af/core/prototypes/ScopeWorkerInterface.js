import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';
import Interface from './Interface.js';

// this prototype defines a new scope worker interface
export default Make({
	then : function(f){
		return Scopes.get(this).promise.then(f);
	},

	onprogress : function(f){
		Scopes.get(this).progressListeners.push(f);
	}
}, Interface).get();
