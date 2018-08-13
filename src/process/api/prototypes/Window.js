import { KernelThread } from '../../KernelThread';

export const Window = {
    _id: null,
    _application: null,

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
    }
};

export default Window;
