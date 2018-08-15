import { KernelThread } from '../../KernelThread';

export const Window = {
    _id: null,
    _application: null,
    _title: '',

    new({ id: _id, application: _application }) {
        return { _id, _application, __proto__: this };
    },

    setDimension(width, height) {
        KernelThread.updateWindow({
            application: this._application,
            windowId: this._id,
            dimension: { width, height },
        });
    },

    attachView(templateId) {
        KernelThread.updateWindow({
            application: this._application,
            windowId: this._id,
            templateId,
        });
    },

    get title() {
        return this._title;
    },

    set title(value) {
        this._title = value;

        KernelThread.updateWindow({
            application: this._application,
            windowId: this._id,
            title: value
        });
    }
};

export default Window;
