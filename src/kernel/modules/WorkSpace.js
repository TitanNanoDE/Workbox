import UrlResolver from '../UrlResolver';
import Application from 'application-frame/core/Application';
import ApplicationManager from '../ApplicationManager';
import { ApplicationMenu, default as ApplicationMenuManager } from '../ApplicationMenuManager';
import ViewId from '../../shared/ViewId';

const { create } = Object;

const getFileSystem = function() {
    const [fileSystem] = ApplicationManager.getInstances('workbox.kernel.filesystem');

    return fileSystem;
};

const mapDirectoryIndex = function(index) {
    return Object.keys(index).map(key => {
        return {
            name : key,
            isDir : typeof index[key] === 'object',
            isFile : typeof index[key] === 'boolean',

            get classes() {
                return `${this.isDir && 'dirType ' || ''}${this.isFile && 'fileType' || ''}`;
            },

            get viewId() {
                return ViewId.create(this);
            },

            get __tracker() {
                return this.viewId;
            }
        };
    });
};

const createFileMangerWindow = function(application) {
    const FileSystem = getFileSystem();
    const window = ApplicationManager.requestApplicationMainWindow(application, 'default');
    window.viewPort.bind({ template : WorkSpace.templates.FileManagerWindow });
    window.scope.callbacks = ['openDir', 'goBack', 'goForward'];

    window.scope.goToPath = function(path) {
        const scope = window.scope;

        scope.currentPath = path;
        scope.currentDir = mapDirectoryIndex(FileSystem.ls(scope.currentPath));
        scope.history.stack = scope.history.stack.slice(0, scope.history.cursor + 1);
        scope.history.stack.push(scope.currentPath);
        scope.history.cursor = scope.history.stack.length - 1;

        window.title = scope.currentPath;
    };

    window.scope.openDir = function(viewId) {
        const scope = window.scope;
        const item = this.currentDir.find(item => item.viewId === viewId);

        if (item.isDir) {
            this.goToPath(`${this.currentPath}${item.name}/`);
        }

        scope.update();
    };

    window.scope.moveToCursor = function() {
        let path = this.history.stack[this.history.cursor];

        window.title = path;

        this.currentPath = path;
        this.currentDir = mapDirectoryIndex(FileSystem.ls(path));
    };

    window.scope.goBack = function() {
        if (this.history.canGoBack) {
            this.history.cursor -= 1;

            this.moveToCursor();
            window.scope.update();
        }
    };

    window.scope.goForward = function() {
        if (this.history.canGoForward) {
            this.history.cursor += 1;

            this.moveToCursor();
            window.scope.update();
        }
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

    window.scope.registerCallbacks();
    window.scope.goToPath('/');
    window.viewPort.update();
};

const createMainMenuWindow = function(application) {
    const window = ApplicationManager.requestApplicationMainWindow(application, 'workSpaceBorderTool');

    /** @type {WindowManager} */
    const [WindowManager] = ApplicationManager.getInstances('workbox.kernel.windowmanager');

    window.viewPort.bind({ template: WorkSpace.templates.MainMenuWindow });
    window.scope.currentMainMenu = null;
    window.scope.currentApplication = null;
    window.scope.callbacks = ['primaryEntry', 'subEntryClick', 'onAboutSystem'];
    window.scope.primaryEntryClick = function() {};
    window.scope.subEntryClick = function(menuId, entryId) {
        const menu = this.currentMenu.menus.find(menu => menu.id === menuId);

        if (!menu) {
            throw 'menu has no, or an invalid id!';
        }

        const entry = menu.entries.find(entry => entry.id === entryId);

        if (!entry) {
            throw 'entry has no, or an invalid id!';
        }

        return entry.handler();
    };
    window.scope.onAboutSystem = function() {
        ApplicationManager.launch('workbox.about', WorkSpace.name);
    };

    window.scope.registerCallbacks();
    window.dockTo('top');
    window.apperanceMode('screenBlocking');

    WindowManager.on('focuschange', ({ application }) => {
        window.scope.currentApplication = {
            get title() { return application.displayName || application.name; },
        };
        window.scope.currentMenu = ApplicationMenuManager.getMenu(application.symbol);
        window.viewPort.update();
    });
};

const WorkSpace = {

    name: 'workbox.kernel.workspace',
    displayName: 'File Manager',
    noMainWindow: true,
    icons: [{ name : '32', src : './userSpace/theme/file-manager.svg'}],
    windows: null,
    backgroundWindow: null,
    dock: null,

    applicationMenu: create(ApplicationMenu).constructor([
        {
            get id() { return ViewId.create(this); },
            title: 'About',
            get handler() { }
        }, {
            get id() { return ViewId.create(this); },
            title: 'Quit',
            get handler() { },
        }
    ], [{
        title: 'File',
        get id() { return ViewId.create(this); },

        entries: [{
            get id() { return ViewId.create(this); },
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

        this.windows.backgroundWindow = ApplicationManager.requestApplicationMainWindow(this, 'fullScreen');
        this.windows.backgroundWindow.viewPort.bind({ template : this.templates.backgroundWindow });
        this.windows.backgroundWindow.apperanceMode('alwaysBehind');
        this.backgroundWindow = this.windows.backgroundWindow.viewPort.scope;

        // Load the wallpaper
        this.backgroundWindow.wallpaper = './userSpace/the-roaming-platypus-310824-unsplash.jpg';

        this.windows.dock = ApplicationManager.requestApplicationMainWindow(this, 'workSpaceBorderTool');
        this.windows.dock.viewPort.bind({ template : this.templates.dock });
        this.dock = this.windows.dock.viewPort.scope;

        this.windows.dock.dockTo('left');
        this.windows.dock.apperanceMode('alwaysOnTop');

        let applications = ApplicationManager.getActiveApplicationList();

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
        this.windows.backgroundWindow.viewPort.update();

        createFileMangerWindow(this);
        createMainMenuWindow(this);

        ApplicationManager.on('applicationLaunched', application => {
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
        const list = ApplicationManager.getInstances(this.name);
        const instance = list[list.length - 1];

        createFileMangerWindow(instance);
    },

    __proto__: Application,

};

export default WorkSpace;
