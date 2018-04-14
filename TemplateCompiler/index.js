const { JSDOM } = require('jsdom');
const fs = require('fs');


const generateCodeFromHtml = function(content) {
    let generated =
        'if (!HTMLElement.prototype.__tcA) { HTMLElement.prototype.__tcA = function(c) { c.apply(this); return this; }};';


    const template = new JSDOM(content).window.document.head.firstElementChild;

    if (template.localName !== 'template') {
        console.error('invalid template file!');
        process.exit();
    }

    generated += 'const template = document.createElement(\'template\')';

    if (template.id) {
        generated += `.__tcA(function() { this.id = ${template.id} })`;
    }

    const processNode = function(node) {

        if (node.nodeType === 3) {
            const cleanValue = node.nodeValue.split('\n').map(line => line.trim())
                .join('').replace(/\t/g, '').replace(/'/g, '\\\'');

            if (cleanValue != '') {
                generated += `.appendChild(document.createTextNode('${cleanValue}'))`;
                generated += '.parentNode';
            }

            return;
        }

        generated += `.appendChild(document.createElement('${node.localName}'))`;
        generated += '.__tcA(function(){';

        Array.prototype.forEach.apply(node.attributes, [attribute => {
            const attributeName = attribute.name.replace(/[()]+/g, '_');
            generated += `this.setAttribute('${attributeName}', '${attribute.value}');`;
        }]);

        generated += '})';

        node.childNodes.forEach(node => processNode(node));
        generated += '.parentNode';
    };

    generated += '.__tcA(function(){this.content';

    template.content.childNodes.forEach(node => processNode(node));

    generated += '}); export default template; export { template };';

    return generated;
};

const htmlContent = fs.readFileSync('./src/core/System/templates/mainWindow.html', 'utf8');
const generated = generateCodeFromHtml(htmlContent);

fs.writeFileSync('./template.js', generated, 'utf8');
