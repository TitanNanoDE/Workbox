import CurrentThread from '../threading/CurrentThread';
import ApplicationInterface from './ApplicationInterface';

const thread = {
    interfaces: [
        ApplicationInterface,
    ],

    __proto__: CurrentThread,
};

export default thread;
