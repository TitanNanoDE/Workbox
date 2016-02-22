/*****************************************************************
 * dom.js v1.1  part of the ApplicationFrame                     *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

"use strict";

var apply= function(target, features){
	Object.keys(features).forEach(function(key){
		target[key]= features[key];
	});
};

var append= function(element){
    return this.appendChild(element);
};

var classes= function(...classes){
    var list= this.className.split(' ');
    var add= [];
    var remove= [];
    classes.forEach(item => {
        if(item.substr(0, 1) == '-')
            remove.push(item.substr(1));
        else if(item.substr(0, 1) == '+')
            add.push(item.substr(1));
        else
            add.push(item);
    });

    remove.forEach(item => {
        if(list.indexOf(item) > -1)
            list.splice(list.indexOf(item), 1);
    });

    add.forEach(item => {
        if(list.indexOf(item) < 0)
            list.push(item);
    });

    this.className= list.join(' ');
};

var css= function(properties, extend){
    if(extend){
        var current= {};
        properties.split(';').forEach(item => {
            var [key, value] = item.split(':');
            current[key]= value;
        });

        Object.keys(properties).forEach(key => {
            if(properties[key] === null)
                delete current[key];
            else
                current[key]= properties[key];
        });

        this.style.cssText= Object.keys(current).map(key => key + ':' + current[key]).join(';');
    }else{
        this.style.cssText= Object.keys(properties).map(key => key + ':' + properties[key]).join(';');
    }
};

var replace= function(node){
    if(node instanceof Node){
        this.parentNode.replaceChild(node, this);
    }
};

var transition= function(...items){
    return new Promise(function(setValue){
//     		set event listener
        this.addEventListener('transitionend', function x(e){
            this.removeEventListener('transitionend', x);
            setValue(this, e);
        });

        classes.apply(this, items);
    }.bind(this));
};

var remove= function(){
    this.parentNode.removeChild(this);
};

export var dom= function(item){

	var features= {
		append : append,
		classes : classes,
		css : css,
		replace : replace,
		remove : remove,
		transition : transition
	};

	if(item instanceof String){
		item= document.querySelector(item);
	}

	if(item && item instanceof Node){
		apply(item, features);
	}else if(item && (item instanceof Array || item instanceof NodeList)){
		item.map(element => apply(element, features));
	}else{
		item= null;
	}

	return item;
};

dom.selectAll= function(query){
	return dom(document.querySelectorAll(query));
};

dom.create= function(elementName){
	return dom(document.createElement(elementName));
};

export var config = {
    author : 'Jovan Gerodetti',
    main : 'dom',
    version : 'v1.0',
    name : 'DOM manipulation Module'
};
