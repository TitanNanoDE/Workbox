import { Make } from '../../util/make.js';
import { bindNode } from './Bind.js';
import { selectElement, selectAllElements, polyMask } from './Util.js';
import { importTemplate } from './TemplateLoader.js';
import ScopePrototype from './ScopePrototype.js';

let makeElementFromTemplate = function(template, scope, application, item) {
    let node = template.content.cloneNode(true);
    let placeholder = selectElement('bind-placeholder', node);

    item = polyMask(item);

    item.attributes.forEach(attr => {
        node.firstElementChild.setAttribute(attr.name, attr.value);
    });

    if (placeholder.bare) {
        let node = item.firstElementChild;
        placeholder.parentNode.replaceChild(item.firstElementChild, placeholder.bare);

        [].forEach.apply(item.children, [item => {
            node.parentNode.appendChild(item);
        }]);
    }

    node.firstElementChild.className = template.id + ' ' + node.firstElementChild.className;

    scope = scope();

    [].map.apply(node.firstElementChild.attributes, [item => {
        if (item.name.search(/^scope\-/) > -1 ) {
            scope[item.name.replace(/^scope\-/, '')] = item.value;
        }
    }]);

    if (template.hasAttribute('component')) {
        scope.element = node.firstElementChild;
    }

    scope = bindNode(node, scope);

    item.parentNode.replaceChild(node, item.bare);

    if (application) {
        application.emit(`newElement:${template.id}`, scope);
    }
};

/**
 * creates a new instance of an HTML template and applies the binding with
 * the given scope.
 *
 * @param {Node|string} template
 * @param {ScopePrototype} scope
 * @param {ApplicationScopeInterface} application
 * @return {Object}
 */
export let makeTemplate = function (template, scope, application) {
    template = (typeof template === 'string') ? selectElement(template) : polyMask(template);

    if (template.hasAttribute('src') && !template.processed) {
        let source = template.getAttribute('src');

        scope = Make(scope, ScopePrototype)();

        importTemplate(source, template)
            .then(template => {
                template.processed = true;
                makeTemplate(template, scope, application)
            });

        return scope;

    } else if (template.hasAttribute('bind-element')) {
        let makeElement = makeElementFromTemplate.bind(this, template, scope, application);
        let list = selectAllElements(template.id);

        [].forEach.apply(list, [makeElement]);

        (new MutationObserver(mutations => {
            mutations.forEach(item => {
                if (item.addedNodes.length > 0) {
                    let list = selectAllElements(template.id);

                    [].forEach.apply(list, [makeElement]);
                }
            });
        })).observe(document.body, {
            childList : true,
            subtree : true
        });

    } else {
        let node = template.content.cloneNode(true);

        scope = bindNode(node, scope);

        if (template.hasAttribute('replace')) {
            template.parentNode.replaceChild(node, template.bare);
        }

        return {　node : node, scope : scope };
    }
};
