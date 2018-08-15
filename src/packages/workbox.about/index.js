import System from 'System';

const AboutSystemJS = {

    name: 'workbox.about',

    displayName: 'About Workbox',

    icons: [{
        name: '32',
        src: 'package://workbox.about/icons/about-icon.png',
    }],

    constructor() {
        return this;
    },

    init(window) {
        window.title = this.displayName;
        window.attachView('main-template');
        window.setDimension(550, 370);
    },

    __proto__: System.Prototypes.Application,
};

export default AboutSystemJS;
