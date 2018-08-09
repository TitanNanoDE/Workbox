import { CurrentThread } from '../threading';
import WindowsInterface from './ThreadInterfaces/WindowInterface';

const KernelThread  = {
    interfaces: [
        WindowsInterface
    ],

    __proto__: CurrentThread,
};

export default KernelThread;
