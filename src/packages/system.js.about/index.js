import System from 'System';
import template from './template';

document.body.appendChild(template);

const AboutSystemJS = {

    name: 'system.js.about',

    resources: {
        'icons/about-icon.png': 'theme://about.svg',
    },

    icons: [{
        name: '32',
        src: 'package://system.js.about/icons/about-icon.png',
    }],

    constructor() {
        return this;
    },

    init(window) {
        window.title = 'About SystemJS';
        window.viewPort.bind({ template: template.id });
        window.setDimension(400, 200);
    },

    __proto__: System.Prototypes.Application,
};

export default AboutSystemJS;
