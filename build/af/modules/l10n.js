
import { $, $$ } from '../af';

var instance= Date.now() + '::' + Math.round(Math.random() * 200);
	
var localize= function(element){
    if(element.dataset.l10nId){
        if(!element.dataset.l10nInstance || element.dataset.l10nInstance === '' || element.dataset.l10nInstance == instance){
            $('addon').talk('l10n', element.dataset.l10nId).then(function(string){
                if(element.dataset.l10nContent !== null)
                    element.dataset.l10nContent= string;
                else
                    element.textContent= string;
            });
            return true;
        }
        return false;
    }
    return false;
};
	
var translate= function(stringID, element){
    if(element){
        element.dataset.l10nInstance= instance;
        element.dataset.l10nId= stringID;
    }
};
	
var observer= new $$.MutationObserver(function(records){
    records.forEach(function(item){
        if(item.type == "attributes"){
            localize(item.target);
        }else if(item.type == "childList"){
            for(var i= 0; i < item.addedNodes.length; i++){
                var element= item.addedNodes[i];
//		        localize this element
                if(element.dataset)
                    localize(element);
//				search for localizable children
                if(element.querySelectorAll){
                    var children= element.querySelectorAll('[data-l10n-id]');
                    for(var y= 0; y < children.length; y++){
                        localize(children[y]);
                    }
                }
            }
        }
    });
});
	
var onready= function(){
//	create observer
    observer.observe($$.document.body, {
        childList : true,
        attributes : true,
        subtree : true,
        attributeFilter : ['data-l10n-id', 'data-l10n-instance']
    });
//	localizing existing elements
    var elements= $('dom').selectAll('[data-l10n-id]');
    for(var i= 0; i < elements.length; i++){
        if(localize(elements[i]))
            console.log('element localized!!');
    }
};
	
if($$.document.readyState == 'complete')
    onready();
else
    $$.addEventListener('load', onready, false);

export var l10n = {
    _ : translate
};

export var config = {
    author : 'Jovan Gerodetti',
    main : 'l10n',
    version : 'v1.0',
    name : 'Localisation Module'
};
