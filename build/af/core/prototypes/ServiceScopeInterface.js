import { Make } from '../../util/make.js';
import { createUniqueId } from '../../util/functions.js';
import Scopes from '../objects/Scopes.js';
import Interface from './Interface.js';
import Engine from '../objects/Engine.js';


// this prototype defines a new service scope loader
export default Make({

	talk : function(name, data){
		var scope= Scopes.get(this);

		if(name != 'init' && !scope.isReady){
			return new Promise(function(success){
				scope.messageQueue.push({ name : name, data : data, resolve : success });
			});

		}else{
			return new Promise(function(success){
				var id= createUniqueId();
				var listener= function(e){
					if(e.data.id == id){
						scope.thread.removeEventListener('message', listener);
						success(e.data.data);
					}
				};

                scope.thread.addEventListener('message', listener, false);
				scope.thread.postMessage({ name : name, id : id, data : data });
			});
		}
	},

	listen : function(name, callback){
		var scope= Scopes.get(this);

        scope.addEventListener('message', function(e){
        	if(e.data.name == name){
            	var id= e.data.id;
                var setAnswer= function(data){
                	scope.postMessage({ id : id, data : data });
				};
				callback(e.data.data, setAnswer);
			}
		}, false);

        return this;
	},

	main : function(source){
		var scope= Scopes.get(this);

		scope.thread= new ServiceWorker(Engine.shared.serviceLoader+'?'+scope.name);

        if(typeof source == "function"){
			source= '$$.main= ' + source.toString();
            source= new Blob([source], { type : 'text/javascript' });
			source= URL.createObjectURL(source);
		}

        scope.thread.talk('init', source).then(function(){
			scope.isReady= true;
			scope.messageQueue.forEach(function(item){
				scope.thread.talk(item.name, item.data).then(function(data){
					item.resolve(data);
				});
			});

            scope.messageQueue = null;
//			source= $$.URL.revokeObjectURL(source);
		});

        return this;
	}
}, Interface).get();
