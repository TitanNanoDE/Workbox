import CurrentThread from '../threading/CurrentThread';
import ApplicationInterface from './ApplicationInterface';
import ProcessInterface from './ProcessInterface';

const thread = {
    interfaces: [
        ApplicationInterface,
        ProcessInterface,
    ],

    __proto__: CurrentThread,
};

export default thread;
