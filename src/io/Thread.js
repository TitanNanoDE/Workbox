import { CurrentThread } from '../threading';
import ViewInterface from './ViewInterface';
import LoaderInteface from './LoaderInterface';

const Thread = {
    interfaces: [
        ViewInterface,
        LoaderInteface,
    ],

    __proto__: CurrentThread,
};

export default Thread;
