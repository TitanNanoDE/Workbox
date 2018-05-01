import System from '../../System';
import SystemAPI from '../../SystemAPI';
import UrlResolver from '../UrlResolver';

const { Application, ApplicationMenu } = SystemAPI.Prototypes;
const { create } = Object;

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
        scope.currentDir = mapDirectoryIndex(SystemAPI.FileSystem.ls(scope.currentPath));

        scope.history.stack = scope.history.stack.slice(0, scope.history.cursor + 1);
        scope.history.stack.push(scope.currentPath);
        scope.history.cursor = scope.history.stack.length - 1;

        window.title = scope.currentPath;
    };

    window.scope.openDir = function(event, scope) {
        if (scope.item.isDir) {
            this.goToPath(`${this.currentPath}${scope.item.name}/`);
        }

        scope.__parentScope__.update();
    };

    window.scope.moveToCursor = function() {
        let path = this.history.stack[this.history.cursor];

        window.title = path;

        this.currentPath = path;
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

const createMainMenuWindow = function(application) {
    const window = SystemAPI.Windows.createWindow(application, 'workSpaceBorderTool');

    /** @type {WindowManager} */
    const [WindowManager] = System.ApplicationManager.getInstances('System::WindowManager');

    window.viewPort.bind({ template: WorkSpace.templates.MainMenuWindow });
    window.scope.currentMainMenu = null;
    window.scope.currentApplication = null;
    window.scope.primaryEntryClick = function() {};
    window.scope.subEntryClick = function(){};
    window.scope.onAboutSystem = function() {
        System.ApplicationManager.launch('system.js.about', WorkSpace.name);
    };

    window.scope.getTitle = function(application) {
        return application.displayName || application.name;
    };

    window.dockTo('top');
    window.apperanceMode('screenBlocking');

    WindowManager.on('focuschange', ({ application }) => {
        window.scope.currentApplication = application;
        window.scope.currentMenu = System.ApplicationMenuManager.getMenu(application.symbol);
        window.viewPort.update();
    });
};

const WorkSpace = {

    name: 'System::WorkSpace',
    displayName: 'File Manager',
    noMainWindow: true,
    icons: [{ name : '32', src : './userSpace/theme/file-manager.svg'}],
    windows: null,
    backgroundWindow: null,
    dock: null,

    applicationMenu: create(ApplicationMenu).constructor([
        {
            title: 'About',
            get handler() { }
        }, {
            title: 'Quit',
            get handler() { },
        }
    ], [{
        title: 'File',
        entries: [{
            title: 'New Window',
            get handler() {
                return WorkSpace.createNewFileManagerWindow.bind(WorkSpace);
            }
        }]
    }]),

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
                    icon : icon && UrlResolver.resolve(icon.src),
                };
            });

        this.windows.dock.viewPort.update();

        createFileMangerWindow(this);
        createMainMenuWindow(this);

        SystemAPI.Applications.on('applicationLaunched', application => {
            if (!application.headless) {
                let isNew = !this.dock.itemList.find(item => item.name === application.name);

                if (isNew) {
                    let icon = application.icons.find(icon => icon.name === '32');

                    application = {
                        displayName : application.displayName || application.name,
                        name : application.name,
                        icon : icon && UrlResolver.resolve(icon.src),
                    };

                    this.dock.itemList.push(application);
                    this.windows.dock.viewPort.update();
                }
            }
        });
    },

    /** @static */
    createNewFileManagerWindow() {
        const instance = SystemAPI.Applications.current.instance(this);

        createFileMangerWindow(instance);
    },

    __proto__: Application,

};

export default WorkSpace;
