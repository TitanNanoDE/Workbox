import ApplicationManager from '../ApplicationManager';

const WindowInterface = {
    updateWindow({ application, windowId, dimension, templateId, title }) {
        const [windowManager] = ApplicationManager.getInstances('workbox.kernel.windowmanager');
        const window = windowManager.getWindow(application, windowId);

        if (dimension) {
            window.setDimension(dimension.width, dimension.height);
        }

        if (templateId) {
            window.viewPort.bind({ template: `${application}.${templateId}` });
        }

        if (typeof title === 'string') {
            window.title = title;
        }
    }
};

export default WindowInterface;
