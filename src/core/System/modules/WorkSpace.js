import SystemAPI from '../../SystemAPI.js';

let { Application } = SystemAPI.Prototypes;
let { Make } = SystemAPI.Tools;

let WorkSpace = Make({

    name : 'System::WorkSpace',

    templates : {
        backgroundWindow : './core/System/templates/WorkSpaceBackground.html',
        infoWindow : './core/System/templates/WorkSpaceInfo.html'
    },

    windows : null,
    backgroundWindow : null,
    infoWindow : null,

    init : function(window) {

        this.windows = {
            /** @type {Window} */
            infoWindow : window,
            backgroundWindow : null,
        };

        this.windows.infoWindow.viewPort.bind({ template : this.templates.infoWindow });
        this.infoWindow = this.windows.infoWindow.viewPort.scope;

        SystemAPI.Windows.createWindow(this, 'fullscreen').then(window => {
            this.windows.backgroundWindow = window;
            this.windows.backgroundWindow.viewPort.bind({ template : this.templates.backgroundWindow });
            this.backgroundWindow = this.windows.backgroundWindow.viewPort.scope;

            // Load the wallpaper
            this.backgroundWindow.wallpaper = './userSpace/prairie_mountains-1366x768.jpg';
        });

    }

}, Application).get();

export default WorkSpace;
