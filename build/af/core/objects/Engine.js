/**
 * @module Engine
 * @author Jovan Gerodetti <jovan@titannao.de>
 * @copyright by TitanNano / Jovan Gerodetti - {@link http://www.titannano.de}
 * @role Inner
 */

import { Make } from '../../util/make.js';
import { objectExtend, cloneObject, createUniqueId } from '../../util/functions.js';
import ApplicationScope from '../prototypes/ApplicationScope.js';
import ServiceScope from '../prototypes/ServiceScope.js';
import Scopes from './Scopes.js';
import Extendables from './Extendables.js';

var $$ = window;

/**
 * The engine holds private flags, arrays and functions.
 *
 * @namespace
 * @inner
 */
var Engine = {

	/**
	 * @namespace
	 */
	shared : {

		/**
		 * @type {string}
		 */
		serviceLoader : '',

		/**
		 * @type {string[]}
		 */
		renderModes : ['default'],

		/**
		 * @type {Object}
		 */
		features : {
			chromeLevel : (location.protocol == 'chrome:' || location.protocol == 'resource:'),
//			storrage : !Engine.features.chromeLevel && (function(){try{ return sessionStorage && localStorage; }catch(e){ return false; }})(),
//			indexedDB : !Engine.features.chromeLevel && (function(){try{ return indexedDB; }catch(e){ return false; }})(),
        	notifications : (Notification) || false,
        	renderFrame : (requestAnimationFrame) || false,
        	audio : (Audio) || false,
        	indexOf : (Array.indexOf) || false,
        	forEach : (Array.forEach) || false,
        	geolocation : (navigator.geolocation) || false,
        	appCache : (applicationCache) || false,
        	xcom : ($$.postMessage) || false,
        	blobs : (Blob) || false,
        	clipBoard : ($$.ClipboardEvent) || false,
        	file : ($$.File) || false,
        	fileReader : (FileReader) || false,
        	hashchange : (typeof onhashchange != "undefined") || false,
        	json : (JSON) || false,
        	matchMedia : (matchMedia) || false,
        	timing : ($$.PerformanceTiming) || false,
        	pageVisibility : ((typeof document.hidden != "undefined") && document.visibilityState),
        	serverSentEvent : ($$.EventSource) || false,
        	webWorker : (Worker) || false,
			sharedWebWorker : (SharedWorker) || false,
        	arrayBuffer : (ArrayBuffer)|| false,
        	webSocket : (WebSocket) || false,
        	computedStyle : (getComputedStyle) || false,
        	deviceOrientation : ($$.DeviceOrientationEvent) || false,
		},

		/**
		 * @type {Object}
		 * @property {string} EXTENSION
		 */
        moduleTypes : {
            EXTENSION : 'extension'
        }
	},

	/**
	 * @namespace
	 */
	itemLibrary : {

		/**
		 * @type {module:Engine~LibraryItem}
		 */
		addon : (function(){
			var self= {};

			self.talk= function(type, message){
				if($$ != self){
					return new Promise(function(okay){
						var id= createUniqueId();
						var ready= function(e){
							self.port.removeListener(ready);
							okay(e);
						};
						console.log(id);
						self.port.on(id, ready, false);
						self.port.emit(type, { id : id, message : message });
					});
				}else{
					console.error('Not available in this context!!');
				}
			};

			self.listen= function(type, callback){
				if($$ != self){
					self.port.on(type, function(e){
						var id= e.id;
							callback(e.message, function(message){
								self.port.emit(id, message);
							});
                		});
				}else{
					console.error('Not available in this context!!');
				}
			};

			if($$ != self)
				return self;
			else
				return null;
		})(),

		/**
		 * @type module:Engine~LibraryItem
		 */
		applications : {
			'new' : function(name){
                var scope = Make(ApplicationScope)(name);

				Engine.pushScope(scope);

				return scope.public;
			}
		},

		/**
		 * @type module:Engine~LibraryItem
		 */
		services : {
			'new' : function(name){
				Engine.pushScope(Make(ServiceScope)(name));
			},
			setLoaderModule : function(url){
				Engine.shared.serviceLoader= url;
			}
		},

		/**
		 * @type {module:Engine~LibraryItem}
		 */
		wrap : function(source){
			return new Promise(function(done){
				done(source.apply({}));
			});
		},

		/**
		 * @type {module:Engine~LibraryItem}
		 */
		system : {
			settings : function(settings){
				objectExtend.apply(Engine.options, [settings]);
			},
			info : function(){
				return cloneObject(Engine.info);
			},
			shared : function(){
				return Engine.shared;
			},
			'import' : function(...modules){
                var { moduleTypes } = Engine.shared;

                Engine.ready= new Promise(function(ready){
					Promise.all(modules.map(m => System.import(m))).then(modules => modules.forEach(m => {
						if('config' in m){
							if(m.config.main){
                                if(m.config.type && m.config.type == moduleTypes.EXTENSION){
                                    m[m.config.main](Extendables, Scopes);

                                }else if(!(m.config.main in Engine.itemLibrary)){
									Engine.itemLibrary[m.config.main]= m[m.config.main];

								}else{
									console.warn('an other version of "'+ m.config.main +'" is already loaded!');
								}
							}else{
								console.error('couldn\'t find main in module config!');
							}
						}
					}));
				});
			}
		}
	},

	/**
	 * @type {Object}
	 * @property {string} applicationName
	 * @property {string} renderMode
	 * @property {string} override
	 */
	options : {
		applicationName : '',
		renderMode : 'default',
		override : 'false'
	},

	/**
	 * @type {Object}
	 * @property {string} engine
	 * @property {string} engineVersion
	 * @property {string} platform
	 */
	info : {
		engine : 'unknown',
    	engineVersion : '1',
    	platform : 'unknown',
    	arch : 'x32',
    	type : 'unknown'
	},

	/**
	 * @type {Object}
	 */
	scopeList : {},

	/**
	 * @param {string} name
	 *
	 *//**
	 * @param {object} name
	 */
	getLibraryItem : function(name){
		if(typeof name == 'string'){
			return Engine.itemLibrary[name];
		}else{
			return Engine.itemLibrary[name.name];
		}
	},

	/**
	 * @param {Scope} scope
	 */
	pushScope : function(scope){
		if(!this.scopeList[scope.name] && scope.name != "application")
			this.scopeList[scope.name]= scope;
		else
			console.error('a scope with this name does already exist!');
	},

	/**
	 * @param {string} name
     * @return {ApplicaionScopeInterface}
	 */
	getScope : function(name){
		if(name == 'application')
			name= Engine.settings.applicationName;

		if(Engine.scopeList[name])
			return Engine.scopeList[name].public;
		else
			console.error('scope does not exist!');
	},

	/**
	 * @type {external:System.Promise}
	 */
	ready : Promise.resolve()
};

/**
 * @member Engine
 * @type {module:Engine~Engine}
 * @memberof module:Engine
 */
export default Engine;
