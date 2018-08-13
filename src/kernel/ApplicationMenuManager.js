import Log from './Log';

export const ApplicationMenu = {
    entries: null,
    menus: null,

    constructor(entries = [], menus = []) {
        if (!this.entries) {
            this.entries = entries;
        }

        if (!this.menus) {
            this.menus = menus;
        }

        return this;
    },
};

const logger = Log.use('ApplicationMenuManager');

const ApplicationMenuManager = {

    _registry: new Map(),

    /**
     * [description]
     *
     * @param  {Symbol.<ApplicationSymbol>} application [description]
     * @param  {ApplicationMenu} menu        [description]
     * @return {un}             [description]
     */
    registerMenu(application, menu) {
        if (typeof application !== 'symbol') {
            logger.error('ApplicationMenu identifier has to be a symbol!');
            return;
        }

        this._registry.set(application, menu);
    },


    /**
     * [getMenu description]
     * @param  {[type]} application [description]
     * @return {[type]}             [description]
     */
    getMenu(application) {
        if (typeof application !== 'symbol') {
            logger.error('ApplicationMenu identifier has to be a symbol!');
            return;
        }

        return this._registry.get(application);
    }
};

export default ApplicationMenuManager;
