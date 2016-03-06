import SystemAPI from '../../SystemAPI.js';

let { Application } = SystemAPI.Prototypes;
let { Make } = SystemAPI.Tools;

let WorkSpace = Make({

    name : 'System::WorkSpace',

    displayName : 'File Manager',

    icons : [{ name : '32', src : './userSpace/theme/file-manager.svg'}],

    templates : {
        backgroundWindow : './core/System/templates/WorkSpaceBackground.html',
        infoWindow       : './core/System/templates/WorkSpaceInfo.html',
        dock             : './core/System/templates/WorkSpaceDock.html',
    },

    windows : null,
    backgroundWindow : null,
    infoWindow : null,
    dock : null,

    init : function(window) {

        this.windows = {
            /** @type {ApplicationWindow} */
            infoWindow : window,
            backgroundWindow : null,
            dock : null,
        };

        this.windows.infoWindow.viewPort.bind({ template : this.templates.infoWindow });
        this.infoWindow = this.windows.infoWindow.viewPort.scope;

        SystemAPI.Windows.createWindow(this, 'fullScreen').then(window => {
            this.windows.backgroundWindow = window;
            this.windows.backgroundWindow.viewPort.bind({ template : this.templates.backgroundWindow });
            this.windows.backgroundWindow.apperanceMode('alwaysBehind');
            this.backgroundWindow = this.windows.backgroundWindow.viewPort.scope;

            // Load the wallpaper
            this.backgroundWindow.wallpaper = './userSpace/prairie_mountains-1366x768.jpg';
        });

        SystemAPI.Windows.createWindow(this, 'workSpaceBorderToolWindow').then(window => {
            this.windows.dock = window;
            this.windows.dock.viewPort.bind({ template : this.templates.dock });
            this.dock = this.windows.dock.viewPort.scope;

            this.windows.dock.dockTo('left');
            this.windows.dock.apperanceMode('alwaysOnTop');
            this.windows.dock.viewPort.alowOverflow();

            let applications = SystemAPI.Applications.getActiveApplicationList();

            this.dock.itemList = applications.filter(application => !application.headless)
                .map(application => {
                    let icon = application.icons.find(icon => icon.name === '32');

                    return {
                        displayName : application.displayName || application.name,
                        name : application.name,
                        icon : icon && icon.src,
                    };
                });

            SystemAPI.Applications.on('applicationLaunched', application => {
                if (!application.headless) {
                    let isNew = !!this.dock.itemList.find(item => item.name === application.name);

                    if (isNew) {
                        let icon = application.icons.find(icon => icon.name === '32')

                        application = {
                            displayName : application.displayName || application.name,
                            name : application.name,
                            icon : icon && icon.src
                        };

                        this.dock.itemList.push(application);
                    }
                }
            });

            this.dock.__apply__();
        });

    }

}, Application).get();

export default WorkSpace;
