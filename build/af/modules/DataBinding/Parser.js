
/**
 * Parses an object expression
 *
 * @param {string} source
 * @param {ScopePrototype} scope
 */
export let ObjectParser = function(source){
    let target = null;
    let key = false;
    let keyBuffer = '';
    let valueBuffer = '';
    let run = true;

    source.split('').forEach((char) => {
        if (run) {
            if (char === '{') {
                target = {};
                key = true;
            } else if(char === ':') {
                key = false;
            } else if(char === ',') {
                target[keyBuffer.trim()] = valueBuffer.trim();
                keyBuffer = valueBuffer = '';
                key = true;
            } else if(char === '}') {
                target[keyBuffer.trim()] = valueBuffer.trim();
                run = false;
            } else if(key) {
                keyBuffer += char;
            } else if(!key) {
                valueBuffer += char;
            }
        }
    });

    return target;
};

/**
 * Parses a given expression in the context of the given scope.
 *
 * @param {string} expression
 * @param {ScopePrototype} scope
 * @return {ScopePrototype}
 */
export let parseExpression = function(expression, scope){
	let chain = expression.split('.');

    chain.forEach(function(item){
        let pos = item.search(/\(\)$/);

        if (scope) {
            if (pos > 0) {
                let scopeChild = scope[item.substring(0, pos)];

                if (scopeChild) {
                    scope = scopeChild.apply(scope);
                } else {
                    return '';
                }
            } else {
                scope = scope[item];
            }
        }
    });

    return (typeof scope !== 'null' && typeof scope !== 'undefined') ? scope : '';
};

/**
 * Assings an value to an expression in an given scope
 *
 * @param {string} expression
 * @param {ScopePrototype} scope
 * @param {string} value
 */
export let assignExpression = function(expression, scope, value){
    let chain = expression.split('.');

    chain.forEach((property, index) => {
        if (chain.length -1 !== index) {
            scope = scope[property];
        } else {
            scope[property] = value;
        }
    });
}
