import System from '../System';

const ApplicationMenu = {
    get register() {
        return System.ApplicationMenuManager.registerMenu.bind(System.ApplicationMenuManager);
    }
};

export default ApplicationMenu;
