import ApplicationManager from '../ApplicationManager';

const WindowInterface = {
    updateWindow({ application, windowId, dimension, templateId, }) {
        const [windowManager] = ApplicationManager.getInstances('System::WindowManager');
        const window = windowManager.getWindow(application, windowId);

        if (dimension) {
            window.setDimension(dimension.width, dimension.height);
        }

        if (templateId) {
            window.viewPort.bind({ template: `${application}.${templateId}` });
        }
    }
};

export default WindowInterface;
