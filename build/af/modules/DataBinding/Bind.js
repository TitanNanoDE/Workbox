import { Make, hasPrototype } from '../../util/make.js';
import { ObjectParser, parseExpression, assignExpression } from './Parser.js';
import { attributeNames } from './Mapping.js';
import { selectElement } from './Util.js';

import Binding from './Binding.js';
import ClassBinding from './ClassBinding.js';
import TwoWayBinding from './TwoWayBinding.js';
import ScopePrototype from './ScopePrototype.js';
import EnabledBinding from './EnabledBinding.js';
import TemplateRepeatBinding from './TemplateRepeatBinding.js';

/**
 * Contains all scope, scopeInfo pairs.
 *
 * @type {WeakMap}
 */
let scopeList = new WeakMap();

/**
 * @type {WeakMap[]}
 */
let scopeIndex = [];

/**
 * @type {Array[]}
 */
export let watcherList = new WeakMap();

/**
 * @type {Object}
 */
let expressionTracking = {};

/**
 * applies the binding to the node for the given scope.
 *
 * @param {Node|string} node
 * @param {Object} scope
 * @return {ScopePrototype}
 */
export let bindNode = function(node, scope, isolated) {
	scope = hasPrototype(scope, ScopePrototype) ? scope : Make(scope, ScopePrototype)();
    node = hasPrototype(node, Node) ? node : selectElement(node);

	scopeList.set(scope, {
		node : node,
		bindings : []
	});

    scopeIndex.push(scope);

	checkNode(node, scope);
    recycle(isolated ? scope : false);

	return scope;
};

/**
 * Travels through a node and it's children searching for binding expressions
 *
 * @param {Node} node
 * @param {ScopePrototype} scope
 * @param {Node} parentNode
 */
let checkNode = function(node, scope, parentNode) {
    let dataRegex = /{{[^{}]*}}/g;
    let scopeInfo = scopeList.get(scope);

	if (node.nodeName == '#text' || node.nodeType === 2) {
    	let text = node.value || node.textContent,
            variables = text.match(dataRegex),
            visibilityBinding = (node.name === attributeNames.get('visible')),
            transparencyBinding = (node.name === attributeNames.get('transparent')),
            enabledAttribute = node.name === attributeNames.get('enabled'),
            classes = (node.name === attributeNames.get('classes')),
            modelBinding = node.name === attributeNames.get('model'),
            twoWay = (node.name === attributeNames.get('value') || modelBinding);

        let singleBinding = visibilityBinding || transparencyBinding;

        if (twoWay) {
            bindTwoWay(text, scope, scopeInfo, node, parentNode, modelBinding);
        } else if (classes) {
            bindClasses(text, node, scopeInfo, parentNode);
        } else if (enabledAttribute) {
            bindEnabled(text, scopeInfo, parentNode);
        } else if (variables || singleBinding) {
            bindSimple(text, node, variables, scopeInfo, singleBinding, parentNode);
        }
    } else if(node.localName === 'template'){
        let repeatedTemplate = (node.hasAttribute('replace') && node.hasAttribute('repeat'));

        node.attributes.forEach(child => checkNode(child, scope, node));

        if (repeatedTemplate) {
            bindTemplateRepeat(node, scopeInfo);
        }
    } else {
        if (node.attributes) {
            node.attributes.forEach((child) => checkNode(child, scope, node));

            let events = node.getAttribute(attributeNames.get('events'));

        	if (events !== null) {
        		bindEvents(events, node, scope);

				node.removeAttribute(attributeNames.get('events'));
       		}
        }

        node.childNodes.forEach((node) => { return checkNode(node, scope); });
    }
};

/**
 * creates a two way binding
 *
 * @param {string} text
 * @param {ScopePrototype} scope
 * @param {Object} scopeInfo
 * @param {Node} node,
 * @param {Node} parentNode
 * @param {boolean} indirect
 */
let bindTwoWay = function(text, scope, scopeInfo, node, parentNode, indirect){
    let property = text.replace(/[{}]/g, '');
    let value = parseExpression(property, scope);
    let [event, viewBinding, eventBinding, preventDefault] = (parentNode.getAttribute(attributeNames.get('modelEvent')) || '').split(':');

    /** @type {TwoWayBinding} */
    let binding = Make({
        properties : [property],
        originalNodeValue : text,
        currentValue : value,
        node : node,
        parentNode : parentNode,
        indirect : indirect,
        viewBinding : viewBinding,
    }, TwoWayBinding).get();

    scopeInfo.bindings.push(binding);

    if (node.name === attributeNames.get('model')) {
        parentNode.addEventListener(event, e => {
            if (preventDefault === 'true') {
                e.preventDefault();
            }

            console.log(e);
            let value = parseExpression(eventBinding, e);
            compareTwoWay(value, scope, binding);
        });
    } else if(node.name === attributeNames.get('value')) {
        parentNode.addEventListener('keyup', e => {
            e.preventDefault();
            compareTwoWay(getElementValue(e.target), scope, binding);
        });
    }
};

/**
 * Compares for changes in the UI in a two way binding
 *
 * @param {string} newValue
 * @param {ScopePrototype} scope
 * @param {TwoWayBinding} binding
 */
let compareTwoWay = function(newValue, scope, binding){
    if (binding.currentValue !== newValue) {
        assignExpression(binding.properties[0], scope, newValue);
        binding.currentValue = newValue;

        console.log('update from view:', scope);

        recycle();
    }
}

/**
 * creates a simple binding
 *
 * @type {string} text
 * @type {Node} node
 * @type {string[]} variables
 * @type {ScopePrototype} scope
 * @type {ScopeInfo} scopeInfo
 */
let bindSimple = function(text, node, variables, scopeInfo, singleExpression, parentNode){
    /** @type {Binding} */
    let binding = Make({
        originalNodeValue : text,
        node : node,
        parentNode : parentNode,
        singleExpression : singleExpression,
        properties : variables ? variables.map(item => item.replace(/[{}]/g, '')) : []
    }, Binding).get();

    scopeInfo.bindings.push(binding);
}

let bindClasses = function(text, node, scopeInfo, parentNode) {
    let binding = Make({
        originalNodeValue : text,
        node : node,
        classes : ObjectParser(text),
        parentNode : parentNode
    }, ClassBinding).get();

    scopeInfo.bindings.push(binding);
};

let bindEnabled = function(text, scopeInfo, parentNode) {
    let binding = Make({
        originalNodeValue : text,
        parentNode : parentNode
    }, EnabledBinding)();

    scopeInfo.bindings.push(binding);
};

let bindTemplateRepeat = function(template, scopeInfo) {
    let marker = document.createComment(`repeat ${template.id} with ${template.getAttribute('repeat')}`);
    let binding = Make({
        originalNodeValue : template.getAttribute('repeat'),
        template : template,
        marker : marker,
    }, TemplateRepeatBinding)();

    template.parentNode.replaceChild(marker, template);
    scopeInfo.bindings.push(binding);
};

/**
 * binds the events specified for a Node
 *
 * @param {string[]} events
 * @param {Node} node
 * @param {ScopePrototype} scope
 */
let bindEvents = function(events, node, scope){
	let eventRegex = /{[A-Za-z0-9\-_\.: \(\)]*}/g;

	events = events.match(eventRegex);

	events.forEach(function(event){
		console.log(event);
		event = event.replace(/[{}]/g, '');
		let [name, method] = event.split(':');

        if (scope.$methods && scope.$methods[method.trim()]) {
            node.addEventListener(name.trim(), e => {
                scope.$methods[method.trim()].apply(scope, [e]);

                scope.__apply__();
            });
        }
	});
};

let executeWatchers = function(scope) {
    watcherList.get(scope) && watcherList.get(scope).forEach(watcher => {
        let value = parseExpression(watcher.expression, scope);

        expressionTracking[watcher.expression] = expressionTracking[watcher.expression] || { value : '', newValue : '' };

        if (expressionTracking[watcher.expression].value !== value) {
            watcher.cb.apply(scope, [value]);

            expressionTracking[watcher.expression].newValue = value;
        }
    });
}

/**
 * Checks every binding for the given scope and updates every value.
 *
 * @param {ScopePrototype} scope
 * @param {ScopeInfo} scopeInfo
 */
export let recycle = function (scope) {
    let t0 = window.performance.now();

    if (scope) {
        executeWatchers(scope);
        scopeList.get(scope).bindings.forEach(binding => binding.update(scope));

    } else {
        scopeIndex.forEach(scope => {
            executeWatchers(scope);
	        scopeList.get(scope).bindings.forEach(binding => binding.update(scope));
        });
    }

    Object.keys(expressionTracking).forEach(expr => {
        expr = expressionTracking[expr];

        expr.value = expr.newValue;
    });

    let t1 = window.performance.now();
    let duration = ((t1 - t0) / 1000).toFixed(2);

    if (scope) {
        console.log(`scope recycled in ${duration}s`, scope);
    } else {
        console.log(`full recycle in ${duration}s`);
    }
};

export let destoryScope = function(scope) {
    scopeList.delete(scope);
    scopeIndex.splice(scopeIndex.indexOf(scope), 1);
    watcherList.delete(scope);
};

/**
 * Returns the value of an DOM Node
 *
 * @param {Node} node
 */
let getElementValue = function(node){
    if (node.localName === 'input') {
        return node.value;
    } else {
        return 'UNKNOWN NODE!';
    }
}
