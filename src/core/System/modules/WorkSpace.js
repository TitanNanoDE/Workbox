import SystemAPI from '../../SystemAPI';

const { Application } = SystemAPI.Prototypes;

const mapDirectoryIndex = function(index) {
    return Object.keys(index).map(key => {
        return {
            name : key,
            isDir : typeof index[key] === 'object',
            isFile : typeof index[key] === 'boolean',
        };
    });
};

const createFileMangerWindow = function(application) {
    const window = SystemAPI.Windows.createWindow(application, 'default');
    window.viewPort.bind({ template : WorkSpace.templates.FileManagerWindow });
    window.scope.goToPath = function(path) {
        let scope = this.__parentScope__ || this;

        scope.currentPath = path;
        window.title = scope.currentPath;
        scope.currentDir = mapDirectoryIndex(SystemAPI.FileSystem.ls(scope.currentPath));

        scope.history.stack = scope.history.stack.slice(0, scope.history.cursor + 1);
        scope.history.stack.push(scope.currentPath);
        scope.history.cursor = scope.history.stack.length - 1;
    };

    window.scope.openDir = function(event, scope) {
        if (scope.item.isDir) {
            this.goToPath(`${this.currentPath}${scope.item.name}/`);
        }

        scope.__parentScope__.update();
    };

    window.scope.moveToCursor = function() {
        let path = this.history.stack[this.history.cursor];

        this.currentPath = path;
        window.title = path;
        this.currentDir = mapDirectoryIndex(SystemAPI.FileSystem.ls(path));
    };

    window.scope.goBack = function() {
        if (this.history.canGoBack) {
            this.history.cursor -= 1;

            this.moveToCursor();
        }
    };

    window.scope.goForward = function() {
        if (this.history.canGoForward) {
            this.history.cursor += 1;

            this.moveToCursor();
        }
    };

    window.scope.addDirClass = function(item) {
        return item.isDir && 'dirType' || '';
    };

    window.scope.addFileClass = function(item) {
        return item.isFile && 'fileType' || '';
    };

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
    window.viewPort.update();
};

let createMainMenuWindow = function(application) {
    const window = SystemAPI.Windows.createWindow(application, 'workSpaceBorderTool');

    window.viewPort.bind({ template: WorkSpace.templates.MainMenuWindow });
    window.scope.currentMainMenu = {};
    window.scope.primaryEntryClick = function() {};
    window.scope.subEntryClick = function(){};
    window.dockTo('top');
    window.apperanceMode('screenBlocking');
};

const WorkSpace = {

    name: 'System::WorkSpace',
    displayName: 'File Manager',
    noMainWindow: true,
    icons: [{ name : '32', src : './userSpace/theme/file-manager.svg'}],
    windows: null,
    backgroundWindow: null,
    dock: null,

    templates: {
        backgroundWindow: 'work-space-background-template',
        FileManagerWindow: 'work-space-file-manager-template',
        dock: 'work-space-dock-template',
        MainMenuWindow: 'work-space-main-menu-template',
    },

    init() {

        this.windows = {
            /** @type {ApplicationWindow} */
            backgroundWindow : null,
            dock : null,
        };

        this.windows.backgroundWindow = SystemAPI.Windows.createWindow(this, 'fullScreen');
        this.windows.backgroundWindow.viewPort.bind({ template : this.templates.backgroundWindow });
        this.windows.backgroundWindow.apperanceMode('alwaysBehind');
        this.backgroundWindow = this.windows.backgroundWindow.viewPort.scope;

        // Load the wallpaper
        this.backgroundWindow.wallpaper = './userSpace/the-roaming-platypus-310824-unsplash.jpg';

        this.windows.dock = SystemAPI.Windows.createWindow(this, 'workSpaceBorderTool');
        this.windows.dock.viewPort.bind({ template : this.templates.dock });
        this.dock = this.windows.dock.viewPort.scope;

        this.windows.dock.dockTo('left');
        this.windows.dock.apperanceMode('alwaysOnTop');

        let applications = SystemAPI.Applications.getActiveApplicationList();

        this.dock.itemList = applications.filter(application => !application.headless)
            .map(application => {
                let icon = application.icons.find(icon => icon.name === '32');

                return {
                    displayName : application.displayName || application.name,
                    name : application.name,
                    icon : icon && icon.src,
                };
            });

        this.windows.dock.viewPort.update();

        createFileMangerWindow(this);
        createMainMenuWindow(this);

        SystemAPI.Applications.on('applicationLaunched', application => {
            if (!application.headless) {
                let isNew = !!this.dock.itemList.find(item => item.name === application.name);

                if (isNew) {
                    let icon = application.icons.find(icon => icon.name === '32');

                    application = {
                        displayName : application.displayName || application.name,
                        name : application.name,
                        icon : icon && icon.src
                    };

                    this.dock.itemList.push(application);
                    this.windows.dock.viewPort.update();
                }
            }
        });

    },

    __proto__: Application,

};

export default WorkSpace;
