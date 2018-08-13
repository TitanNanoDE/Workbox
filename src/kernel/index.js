import Thread from './CurrentThread';
import ApplicationManager from './ApplicationManager';
import SystemCore from './modules/Core';

Thread.bootstrap(ApplicationManager);

ApplicationManager.register(SystemCore).launch('System::Core');
