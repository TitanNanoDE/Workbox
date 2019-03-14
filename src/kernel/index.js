import Thread from './CurrentThread';
import ApplicationManager from './ApplicationManager';
import SystemCore from './modules/Core';

Thread.bootstrap({
    init() {
        ApplicationManager.init();
        ApplicationManager.register(SystemCore).launch('workbox.kernel.core');
    }
});
