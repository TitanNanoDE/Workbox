/**
 * @module ApplicationFrame
 * @version 0.1.0
 * @copyright by TitanNano / Jovan Gerodetti - {@link http://www.titannano.de}
 */

"use strict";

// import { Make } from './util/make.js';
import { objectExtend } from './util/functions.js';
import Engine from './core/objects/Engine.js';
import { Make, hasPrototype, Mixin } from './util/make.js';
import Application from './core/prototypes/Application.js';

var $$ = window || global;

/**
 * @param {navigator.userAgent} userAgentString
 * @return {UserAgent}
 */
var userAgentParser= function(userAgentString){
	var items= [];
	var current= '';
	var enabled= true;
	var version= '';
	var engines= ['Gecko', 'AppleWebKit', 'Firefox', 'Safari', 'Chrome', 'OPR', 'Trident'];
	var found= [];
	var record= {};

	for(var i= 0; i < userAgentString.length; i++){
		if(userAgentString[i] == ' ' && enabled){
			items.push(current);
			current= '';
		}else if(userAgentString[i] == '('){
			enabled= false;
		}else if(userAgentString[i] == ')'){
			enabled= true;
		}else{
			current+= userAgentString[i];
		}
	}
	items.push(current);

	items.forEach(function(item){
		if(item.indexOf(';') > -1){
			record.platform= item;
		}else if(item.indexOf('/') > -1){
			item= item.split('/');
			if(item[0] == 'Version'){
				version= item[1];
			}else{
				item.push(engines.indexOf(item[0]));
				found.push(item);
			}
		}
	});

	if(found.length == 1){
		record.engine= found[0][0];
		record.engineVersion= found[0][1];
	}else if(found.length > 1){
		found.sort(function(a, b){
			if(a[2] < b[2])
				return 0;
			else
				return 1;
		});
		record.engine= found[found.length-1][0];
		record.engineVersion= found[found.length-1][1];
	}else{
		record.engine= 'unknown';
		record.engineVersion= '1';
	}

	record.arch= 'x32';

	record.platform.substring(1, record.platform.length-2).split('; ').forEach(function(item){
		if(item.indexOf('OS X') > -1){
			record.platform= item;
			record.arch= 'x64';
		}else if(item.indexOf('Windows') > -1){
			record.platform= item;
		}else if(item.indexOf('Linux') > -1){
			record.platform= item;
		}else if(item.indexOf('WOW64') > -1 || item.indexOf('Win64') > -1 || item.indexOf('x64') > -1){
			record.arch= 'x64';
		}else if(item.indexOf('/') > -1){
			if(engines.indexOf(item.split('/')[0]) > -1){
				record.engine= item.split('/')[0];
				record.engineVersion= item.split('/')[1];
			}
		}else if(item.indexOf(':') < 0){
            record.platform = item;
        }
	});

	if(version !== ''){
		record.engineVersion= version;
	}

	return record;
};

// find out which engine is used
if ($$.navigator){
	Engine.info.type= 'Web';
	objectExtend.apply(Engine.info, [userAgentParser(navigator.userAgent)]);

//  check if touchscreen is supported
    $$.navigator.isTouch = 'ontouchstart' in $$;

// check if current platform is the Mozilla Add-on runtime
}else if($$.exports && $$.require && $$.module){
    var system= $$.require('sdk/system');
	objectExtend.apply(Engine.info, [{
		engine : system.name,
		engineVersion : system.version,
		platform : system.platform + ' ' + system.platformVersion,
		type : 'MozillaAddonSDK',
		arch : system.architecture
	}]);

// check if current platform is the Node.js runtime
}else if($$.process && $$.process.versions && $$.process.env && $$.process.pid){
    objectExtend.apply(Engine.info, [{
		engine : $$.process.name,
		engineVersion : $$.process.versions.node,
		platform : $$.process.platform,
		arch : $$.process.arch,
		type : 'Node'
	}]);
}

/**
 * @type {module:Engine~Engine.getLibraryItem}
 * @static
 */
export var $= Engine.getLibraryItem;

/**
 * @type {module:Engine~Engine.getScope}
 * @static
 */
export var $_= Engine.getScope;

export default {
    Util : {
        Make : Make,
        hasPrototype : hasPrototype,
        Mixin : Mixin
    },

    Prototypes : {
        Application : Application
    }
};
