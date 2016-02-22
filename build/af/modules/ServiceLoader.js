/*****************************************************************
 * serviceLoader v0.1  part of the ApplicationFrame              *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

var $$= this;

(() => {

	'use strict';

	var createUniqueId= function(){
		var time = Date.now();
		while (time == Date.now());
		return Date.now();
	};

	$$.listen= function(name, callback){
		$$.addEventListener('message', function(e){
			if(e.data.name == name){
				var id= e.data.id;
				var setAnswer= function(data){
					$$.postMessage({ name : id, data : data });
				};
				callback(e.data.data, setAnswer);
			}
		}, false);
	};

	$$.talk= function(name, data){
		return new $$.Promise(function(success){
			var id= createUniqueId();
			var listener= function(e){
				if(e.data.name == id){
					$$.removeEventListener('message', listener);
					success(e.data.data);
				}
			};
			$$.addEventListener('message', listener, false);
			$$.postMessage({ name : name, id : id, data : data });
		});
	};
})();
