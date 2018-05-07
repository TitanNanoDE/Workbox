import { CurrentThread } from '../threading';
import ViewInterface from './ViewInterface';

const Thread = {
    interfaces: [
        ViewInterface,
    ],

    __proto__: CurrentThread,
};

export default Thread;
