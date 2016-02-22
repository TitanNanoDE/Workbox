'use strict';

import { Make, hasPrototype } from 'util/make.js';
import ErrorUtil from 'util/error.js';

var select = function(selector){
    if(selector[0] == '@'){
        return document.querySelectorAll(selector.substr(1));
    } else {
        return document.querySelector(selector);
    }
};

export var main = function(Prototypes, Scopes) {
    var { ApplicationScopeInterface } = Prototypes;
    var { error } = ErrorUtil;

    Prototypes.ControllerTreeNode = {
        _make : function(queryTree){
            var node = null;
            var listeners = [];
            var construct = null;

            if(hasPrototype(queryTree, String)){
                node = select(queryTree);

            } else if(hasPrototype(queryTree, Object)) {
                Object.keys(queryTree).forEach(key => {
                    if(key == 'selector'){
                        node = select(queryTree[key]);

                    }else if (key[0] == '$'){
                        listeners.push({ name : key.substr(1), f : queryTree[key] });

                    }else if(key == 'c'){
                        construct = queryTree[key];

                    }else{
                        this[key] = Make(Prototypes.ControllerTreeNode)(queryTree[key]);
                    }
                });

                if(construct !== null)
                    construct.apply(this);

                listeners.forEach(item => {
                    if(hasPrototype(node, NodeList)){
                        [].forEach.apply(node, [node => {
                            node.addEventListener(item.name, item.f);
                        }]);
                    }else{
                        node.addEventListener(item.name, item.f);
                    }
                });
            }

            Scopes.set(this, node);
        },

        attribute : function(){

        },

        dataset : function(name, value){
            var node = Scopes.get(this);

            if(value)
                node.dataset[name] = value;
            else
                return node.dataset[name];
        }
    };

    Prototypes.ApplicationScopeInterface = Make({

        controller : function(tree){

        }

    }, ApplicationScopeInterface).get();
};

export var config = {
    main : 'main',
    version : 'v1.0',
    author : 'Jovan Gerodetti',
    type : 'extension'
};

/*
query tree

{
    'body' {
        name : 'body',
        header : '.header',
        content : {
            c : function(){},
            selector : 'div.content',
            $click : function(){},
            title : '.title span',
            main : '.main',
            articles : {
                selector : '@.main .article',
                $click : function(){},
            },
            'footer' : {
                selector : 'footer',
                left : '.left',
                right : {
                    $mouseover : function(){}
                }
            }
        }
    }
}

*/
