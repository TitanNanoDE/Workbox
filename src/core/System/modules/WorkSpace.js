import SystemAPI from '../../SystemAPI.js';

let { Application } = SystemAPI.Prototypes;
let { Make } = SystemAPI.Tools;

let mapDirectoryIndex = function(index) {
    return Object.keys(index).map(key => {
        return {
            name : key,
            isDir : typeof index[key] === 'object',
            isFile : typeof index[key] === 'boolean',
        };
    });
};

let createFileMangerWindow = function(application){
    SystemAPI.Windows.createWindow(application, 'mainWindow').then(window => {
        window.viewPort.bind({ template : WorkSpace.templates.FileManagerWindow });

        window.scope.goToPath = function(path) {
            let scope = this.__parentScope__ || this;

            scope.currentPath = path;
            window.title = scope.currentPath;
            scope.currentDir = mapDirectoryIndex(SystemAPI.FileSystem.ls(scope.currentPath));

            scope.history.stack = scope.history.stack.slice(0, scope.history.cursor + 1);
            scope.history.stack.push(scope.currentPath);
            scope.history.cursor = scope.history.stack.length - 1;
        };

        window.scope.openDir = function() {
            if (this.item.isDir) {
                this.goToPath(`${this.currentPath}${this.item.name}/`);
            }
        }

        window.scope.moveToCursor = function() {
            let path = this.history.stack[this.history.cursor];

            this.currentPath = path;
            window.title = path;
            this.currentDir = mapDirectoryIndex(SystemAPI.FileSystem.ls(path));
        }

        window.scope.goBack = function() {
            if (this.history.canGoBack) {
                this.history.cursor -= 1;

                this.moveToCursor();
            }
        }

        window.scope.goForward = function() {
            if (this.history.canGoForward) {
                this.history.cursor += 1;

                this.moveToCursor();
            }
        }

        window.scope.addDirClass = function() {
            return this.item.isDir && 'dirType' ||　'';
        };

        window.scope.addFileClass = function() {
            return this.item.isFile && 'fileType' ||　'';
        }

        window.scope.history = {
            stack : [],
            cursor : 0,

            get canGoBack() {
                return this.cursor > 0;
            },

            get canGoForward() {
                return this.cursor > -1 && this.cursor < (this.stack.length - 1);
            }
        };

        window.scope.goToPath('/');
        window.scope.__apply__();
    });
};

let WorkSpace = Make({

    name : 'System::WorkSpace',

    displayName : 'File Manager',

    icons : [{ name : '32', src : './userSpace/theme/file-manager.svg'}],

    templates : {
        backgroundWindow : './core/System/templates/WorkSpaceBackground.html',
        FileManagerWindow : './core/System/templates/WorkSpaceFileManager.html',
        dock             : './core/System/templates/WorkSpaceDock.html',
    },

    windows : null,
    backgroundWindow : null,
    dock : null,

    init : function(window) {

        this.windows = {
            /** @type {ApplicationWindow} */
            backgroundWindow : null,
            dock : null,
        };

        window.close();

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

            createFileMangerWindow(this);

//            this.dock.__apply__();
        });

    }

}, Application).get();

export default WorkSpace;
