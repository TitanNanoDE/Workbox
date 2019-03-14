import ScriptLoader from 'systemjs/dist/system-production.src';
import TemplateRegistry from './TemplateRegistry';
import { DataBinding } from '@af-modules/databinding';
import uuid from 'uuid';
import deepAssign from '../shared/deepAssign';
import CurrentThread from './Thread';

const viewInstances = {};
const viewNodes = new WeakMap();
const views = new WeakMap();
const viewProxies = new WeakMap();

const getViewProxy = function(viewData, viewId, ...parents) {
    if (!viewProxies.has(viewData)) {
        viewProxies.set(viewData, new Proxy(viewData, {
            get(target, property) {
                if (!target[property] || typeof target[property] !== 'object') {
                    return target[property];
                }

                const tracker = target[property].__tracker && `{track:${target[property].__tracker}}`;

                return getViewProxy(target[property], viewId, (tracker || property), ...parents);
            },

            set(target, property, value) {
                target[property] = value;

                CurrentThread.dispatchEvent(`ViewUpdate/${viewId}`, {
                    path: parents.slice().reverse(),
                    property,
                    value,
                });

                return true;
            }
        }));
    }

    return viewProxies.get(viewData);
};

export const ViewInterface = {
    createView(template) {
        const view = {};
        const viewId = uuid();
        const { scope, node } = DataBinding.createTemplateInstance({
            scope: getViewProxy(view, viewId),
            template: TemplateRegistry.get(template)
        });

        scope.Handoff = function(callbackId, ...staticArgs) {
            return () => {
                CurrentThread.mainThread.invokeCallback(callbackId, staticArgs);
            };
        };

        scope.getView = function(viewId) {
            return viewNodes.get(viewInstances[viewId]);
        };

        viewInstances[viewId] = scope;
        viewNodes.set(scope, node);
        views.set(scope, view);

        return viewId;
    },

    loadViewModule(url) {
        return ScriptLoader.import(url)
            .then(module => {
                if ('templates' in module) {
                    Object.entries(module.templates).forEach(([key, value]) => {
                        TemplateRegistry.register(key, value);
                    });
                }
            });
    },

    updateView(viewId, update) {
        deepAssign(views.get(viewInstances[viewId]), update);

        viewInstances[viewId].update();
    },

    attachView(parentViewId, viewId) {
        if (!viewInstances[viewId]) {
            throw `view ${viewId} does no longer exists!`;
        }

        const node = viewNodes.get(viewInstances[viewId]);
        const parentScope = viewInstances[parentViewId];

        parentScope.viewPortContent = node;
        parentScope.update();
    }
};

export default ViewInterface;
