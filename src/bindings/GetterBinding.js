import { BindingApi } from '@af-modules/databinding';

const GetterBinding = {
    name: 'bind-getter',

    constructor({ parameter, text, node }) {
        BindingApi(this).scheduleScopeUpdate((scope) => {
            let name = text;

            if (text.indexOf('.') > -1) {
                const expr = text.split('.');
                name = expr.pop();

                scope = BindingApi(this).parser.parseExpression(expr.join('.'), scope);
            }

            delete scope[name];

            Object.defineProperty(scope, name, {
                get: () => {
                    if (typeof node[parameter] === 'function') {
                        return node[parameter].bind(node);
                    }

                    return node[parameter];
                }
            });
        });

        return this;
    },

    _make(...args) {
        return this.constructor(...args);
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(GetterBinding);
