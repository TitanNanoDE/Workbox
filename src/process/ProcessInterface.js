import Thread from '../threading/Thread';
import { KernelThreadMeta } from './KernelThread';

const ProcessInterface = {
    injectKernel(port) {
        const KernelThread = Thread.from(port);

        KernelThreadMeta.inject(KernelThread);
    }
};

export default ProcessInterface;
