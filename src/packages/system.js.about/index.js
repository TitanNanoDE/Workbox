import System from 'System';

const AboutSystemJS = {

    name: 'system.js.about',

    icons: [{
        name: '32',
        src: 'package://system.js.about/icons/about-icon.png',
    }],

    constructor() {
        return this;
    },

    init(window) {
        window.title = 'About SystemJS';
        window.attachView('main-template');
        window.setDimension(400, 200);
    },

    __proto__: System.Prototypes.Application,
};

export default AboutSystemJS;
